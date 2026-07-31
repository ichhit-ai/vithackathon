import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, ProjectPlan } from '../types';
import { processPlannerMessage } from '../services/geminiService';
import { Loader, Send, ChevronRight, Check, Presentation, Sparkles } from 'lucide-react';

interface PlannerChatProps {
  onPlanSelected: (plan: ProjectPlan) => void;
  onLaunchWorkspace: () => void;
  onViewSlides: () => void;
}

function renderMessageContent(
  msg: ChatMessage,
  onSelect: (p: ProjectPlan) => void,
  selectedPlanId?: string,
  onLaunchWorkspace?: () => void,
  onViewSlides?: () => void
) {
  if (msg.plans && msg.plans.length > 0) {
    return (
      <div>
        <div className="msg-text" style={{ marginBottom: 12 }}>{msg.content}</div>
        <div className="plan-list">
          {msg.plans.map(plan => (
            <PlanRow
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              onSelect={() => onSelect(plan)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (msg.isGuardrail) {
    return (
      <div className="guardrail-banner">
        <span>⚠</span>
        <span>{msg.content}</span>
      </div>
    );
  }

  const parts = msg.content.split(/(```[\s\S]*?```)/g);
  return (
    <div>
      <div className="msg-text">
        {parts.map((part, i) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const inner = part.slice(3, -3).replace(/^\w+\n/, '');
            return <pre key={i} className="chat-code">{inner}</pre>;
          }
          return <span key={i}>{part}</span>;
        })}
      </div>

      {msg.id.startsWith('confirm-') && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {onViewSlides && (
            <button
              className="btn btn-default"
              style={{ fontSize: 11, padding: '6px 14px', gap: 6 }}
              onClick={onViewSlides}
            >
              <Presentation size={12} />
              View Presentation Deck (PPT)
            </button>
          )}
          {onLaunchWorkspace && (
            <button
              className="btn btn-primary"
              style={{ fontSize: 11, padding: '6px 14px', gap: 6 }}
              onClick={onLaunchWorkspace}
            >
              Launch Workspace
              <ChevronRight size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PlanRow({ plan, selected, onSelect }: { plan: ProjectPlan; selected: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`plan-row ${selected ? 'selected' : ''}`}>
      <div className="plan-row-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <span className="tag tag-purple">{plan.tier}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--clay-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {plan.title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--clay-text-muted)', fontFamily: 'monospace' }}>
            {plan.milestones.length} CP · ~{plan.estimatedHours}h
          </span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setOpen(o => !o)}
            style={{ padding: '4px 6px', fontSize: 10 }}
          >
            {open ? '▲' : '▼'}
          </button>
          <button
            onClick={onSelect}
            className={`btn ${selected ? 'btn-default' : 'btn-primary'}`}
            style={{ padding: '4px 12px', fontSize: 11 }}
          >
            {selected ? <><Check size={12} /> Selected</> : 'Select Plan'}
          </button>
        </div>
      </div>

      <div style={{
        padding: '2px 4px 8px',
        fontSize: 12, color: 'var(--clay-text-muted)', lineHeight: 1.5
      }}>
        {plan.summary}
      </div>

      {open && (
        <div className="plan-row-milestones">
          {plan.milestones.map(m => (
            <div key={m.order} className="ms-row">
              <span className="ms-num">{m.order}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{m.name}</span>
              <span className="tag" style={{ fontSize: 9 }}>{m.difficulty}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--clay-text-subtle)', marginLeft: 4 }}>{m.estimatedMinutes}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PlannerChat({ onPlanSelected, onLaunchWorkspace, onViewSlides }: PlannerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `What do you want to build? Tell me your project idea (e.g. *"HTML/CSS Weather App"* or *"Rust CLI"*) and I'll generate 3 custom scope tiers (Lean, Standard, Ambitious) with step-by-step checkpoints for you.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();
  const [selectedPlan, setSelectedPlan] = useState<ProjectPlan | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, statusText]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  };

  const handleSelectPlan = useCallback((plan: ProjectPlan) => {
    setSelectedPlanId(plan.id);
    setSelectedPlan(plan);
    onPlanSelected(plan);

    setMessages(prev => [
      ...prev,
      {
        id: 'confirm-' + Date.now(),
        role: 'assistant',
        content: `Selected **${plan.title}** (${plan.tier.toUpperCase()}) — ${plan.milestones.length} checkpoints, ~${plan.estimatedHours}h.\n\nYou can now view the **Presentation Deck (PPT)** to review the detailed architectural breakdown, or jump straight into the **Workspace** to start coding.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [onPlanSelected]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(), role: 'user', content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const loadingId = 'loading-' + Date.now();
    const loadingMsg: ChatMessage = {
      id: loadingId, role: 'assistant',
      content: 'Architecting your project tiers...', isLoading: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setLoading(true);
    setStatusText('Initiating Gemini 2.5 Lead Architect...');

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        text: m.content
      }));

      const res = await processPlannerMessage(history, userText, (status) => {
        setStatusText(status);
        setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: status } : m));
      });

      if (!res.isProjectPlan) {
        setMessages(prev => prev.map(m =>
          m.id === loadingId ? {
            id: 'resp-' + Date.now(),
            role: 'assistant',
            content: res.conversationalResponse || 'Tell me a project idea to build!',
            isLoading: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          } : m
        ));
      } else {
        const timestampedPlans: ProjectPlan[] = (res.plans || []).map((p: any, i: number) => ({
          ...p,
          id: `plan-${p.tier}-${Date.now()}-${i}`,
          scopeCritique: p.scopeCritique || [],
          milestones: p.milestones.map((m: any) => ({ ...m, hint2: m.hint2 || '' }))
        }));

        setMessages(prev => prev.map(m =>
          m.id === loadingId ? {
            id: 'plans-' + Date.now(),
            role: 'assistant',
            content: `Here are 3 custom plan tiers for "${userText}". Select one to continue:`,
            plans: timestampedPlans,
            isLoading: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          } : m
        ));
      }
    } catch (e: any) {
      const errMsg = e.message === 'NO_API_KEY'
        ? 'No API key found. Please add your Gemini API key in Settings.'
        : `Error: ${e.message}`;
      setMessages(prev => prev.map(m =>
        m.id === loadingId ? { ...m, isLoading: false, content: errMsg } : m
      ));
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-wrap">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="var(--clay-purple)" />
          <span>Planner</span>
        </div>
        {selectedPlan && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-default"
              style={{ fontSize: 11, padding: '5px 12px', gap: 5 }}
              onClick={onViewSlides}
            >
              <Presentation size={12} />
              View PPT
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: 11, padding: '5px 12px', gap: 5 }}
              onClick={onLaunchWorkspace}
            >
              Launch Workspace
              <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="chat-messages">
        <div className="chat-msg-wrap">
          {messages.map(msg => (
            <div key={msg.id} className={`msg msg-${msg.role === 'user' ? 'user' : 'assistant'} fade-up`}>
              <div className="msg-avatar">
                {msg.role === 'user' ? 'U' : 'AI'}
              </div>
              <div className="msg-content">
                <div className="msg-role">
                  {msg.role === 'user' ? 'You' : 'DevCoach AI'}
                </div>
                {msg.isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--clay-purple)', padding: '6px 0' }}>
                    <Loader size={16} className="spin" color="var(--clay-purple)" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="msg-text" style={{ color: 'var(--clay-text)', fontWeight: 700 }}>
                        {msg.content}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--clay-text-muted)', fontFamily: 'monospace' }}>
                        Gemini 2.5 Flash active streaming
                      </span>
                    </div>
                  </div>
                ) : renderMessageContent(msg, handleSelectPlan, selectedPlanId, onLaunchWorkspace, onViewSlides)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Describe what you want to build (e.g. 'Weather App with HTML/CSS/JS')..."
            value={input}
            onChange={e => { setInput(e.target.value); autoResize(); }}
            onKeyDown={onKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="chat-send"
            onClick={send}
            disabled={!input.trim() || loading}
          >
            {loading
              ? <Loader size={14} color="#fff" className="spin" />
              : <Send size={14} color="#fff" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
