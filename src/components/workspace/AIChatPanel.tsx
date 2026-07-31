import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Milestone } from '../../types';
import { Send, ShieldAlert } from 'lucide-react';

interface AIChatPanelProps {
  messages: ChatMessage[];
  activeMilestone?: Milestone;
  activeFilePath: string;
  onSendMessage: (text: string) => void;
}

const quickPrompts = [
  { label: 'Structural hint', text: 'Give me a structural hint for this checkpoint' },
  { label: 'Why this concept?', text: 'Why do we need this concept here?' },
  { label: 'Debug help', text: 'How do I debug syntax errors in my file?' },
];

export function AIChatPanel({ messages, activeMilestone, activeFilePath, onSendMessage }: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) { onSendMessage(input); setInput(''); }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-sidebar)' }}>
      {/* Header */}
      <div className="panel-header">
        <span>Coach</span>
        <span style={{
          fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10,
          color: 'var(--text-muted)'
        }}>
          CP {activeMilestone?.order || 1} · {activeFilePath.split('/').pop()}
        </span>
      </div>

      {/* Guardrail notice */}
      <div style={{
        padding: '6px 12px', borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 10, color: 'var(--text-muted)'
      }}>
        <ShieldAlert size={10} />
        <span>Solution guardrail active — won't write checkpoint code</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            gap: 2
          }}>
            {msg.isGuardrailWarning && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 10, color: 'var(--amber)', marginBottom: 2
              }}>
                <ShieldAlert size={10} />
                <span>Guardrail triggered</span>
              </div>
            )}
            <div style={{
              maxWidth: '86%', padding: '8px 10px', borderRadius: 6,
              fontSize: 12, lineHeight: 1.5,
              background: msg.sender === 'user' ? 'var(--bg-active)' : 'var(--bg-card)',
              color: msg.isGuardrailWarning ? 'var(--amber)' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)'
            }}>
              {msg.text}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{msg.timestamp}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      <div style={{
        padding: '6px 10px', borderTop: '1px solid var(--border-subtle)',
        display: 'flex', gap: 4, flexWrap: 'wrap'
      }}>
        {quickPrompts.map(p => (
          <button
            key={p.label}
            onClick={() => onSendMessage(p.text)}
            className="btn btn-ghost"
            style={{ fontSize: 10, padding: '3px 8px', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={submit}
        style={{
          display: 'flex', gap: 6, padding: '8px 10px',
          borderTop: '1px solid var(--border-subtle)', flexShrink: 0
        }}
      >
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a concept question..."
          style={{ flex: 1, fontSize: 12 }}
        />
        <button type="submit" className="btn btn-default" style={{ padding: '6px 8px', flexShrink: 0 }}>
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}
