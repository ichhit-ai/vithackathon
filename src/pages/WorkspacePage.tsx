import { useState, useRef, useEffect } from 'react';
import type { ProjectPlan, ChatMessage, GeminiMilestone, WarRoomLog } from '../types';
import { streamCoachResponse, reviewImplementationWithAI, generateWarRoomLogs } from '../services/geminiService';
import { MonacoCodeEditor } from '../components/workspace/MonacoEditor';
import { ClayRoadmapPath } from '../components/workspace/ClayRoadmapPath';
import { ReadinessGauge } from '../components/cairn/ReadinessGauge';
import { WarRoomDrawer } from '../components/cairn/WarRoomDrawer';
import { ScopeCritiqueCards } from '../components/cairn/ScopeCritiqueCards';
import { CheckCircle, ChevronRight, ChevronDown, ChevronUp, Send, Loader, ShieldAlert, X, Save, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WorkspaceProps {
  plan: ProjectPlan;
}

interface ReviewResult {
  passed: boolean;
  score: number;
  feedback: string;
  correctedCode?: string;
}

// ─── Teach bar ───────────────────────────────────────────────────────────────
function TeachBar({ milestone }: { milestone: GeminiMilestone }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="teach-bar">
      <button className="teach-toggle" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--clay-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teach</span>
          <span style={{ fontSize: 12, color: 'var(--clay-text)', fontWeight: 700 }}>{milestone.name}</span>
          <span className="tag tag-purple" style={{ fontSize: 9 }}>{milestone.conceptTaught}</span>
        </div>
        {open ? <ChevronUp size={12} color="var(--clay-text-muted)" /> : <ChevronDown size={12} color="var(--clay-text-muted)" />}
      </button>

      {open && (
        <div className="teach-body fade-up">
          <div>
            <div className="teach-section-label">Concept</div>
            <div className="teach-text">{milestone.lessonSummary}</div>
          </div>
          <div>
            <div className="teach-section-label">Why Now</div>
            <div className="teach-text">{milestone.whyNeeded}</div>
          </div>
          <div>
            <div className="teach-section-label">Goal & Starter Hint</div>
            <pre className="chat-code" style={{ margin: 0, fontSize: 11 }}>{milestone.exampleSnippet}</pre>
            <div className="teach-text" style={{ marginTop: 6, color: 'var(--clay-text)', fontWeight: 600 }}>
              Goal: {milestone.actionableGoal}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── File tree ───────────────────────────────────────────────────────────────
function FileTree({ unlockedFiles, activeFile, onSelect }: {
  unlockedFiles: string[];
  activeFile: string;
  onSelect: (f: string) => void;
}) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-hdr">Explorer</div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {unlockedFiles.map(f => {
          const name = f.split('/').pop() || f;
          const active = activeFile === f;
          return (
            <button
              key={f}
              onClick={() => onSelect(f)}
              style={{
                width: '100%', textAlign: 'left',
                background: active ? 'var(--clay-card)' : 'transparent',
                boxShadow: active ? 'var(--clay-shadow)' : 'none',
                border: 'none', borderRadius: 'var(--clay-radius-pill)', padding: '6px 12px', cursor: 'pointer',
                fontSize: 12, fontFamily: 'monospace', color: active ? 'var(--clay-text)' : 'var(--clay-text-muted)',
                fontWeight: active ? 700 : 500,
                display: 'block', transition: 'all 0.15s'
              }}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Review Modal ────────────────────────────────────────────────────────────
function ReviewModal({ result, onClose, onNext, onApplyFix }: {
  result: ReviewResult;
  onClose: () => void;
  onNext: () => void;
  onApplyFix: (code: string) => void;
}) {
  useEffect(() => {
    if (result.passed) confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 }, colors: ['#ff6b6b', '#06b6d4', '#8b5cf6', '#10b981'] });
  }, [result.passed]);

  return (
    <div className="modal-overlay">
      <div className="modal-box fade-up">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: result.passed ? 'var(--clay-green)' : 'var(--clay-amber)', flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--clay-text)' }}>
              {result.passed ? 'Implementation Approved!' : 'Review Feedback'}
            </span>
            <span className="tag tag-purple" style={{ fontSize: 10 }}>Score: {result.score}/100</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="modal-body">
          <div style={{
            background: 'var(--clay-card)', border: '1px solid var(--clay-border)',
            borderRadius: 'var(--clay-radius-md)', padding: '14px 16px', fontSize: 12, color: 'var(--clay-text)', lineHeight: 1.6
          }}>
            {result.feedback}
          </div>

          {!result.passed && result.correctedCode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-purple)' }}>AI Suggested Correction</div>
              <pre className="chat-code" style={{ fontSize: 11, maxHeight: 160, overflowY: 'auto' }}>{result.correctedCode}</pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!result.passed && result.correctedCode && (
            <button
              className="btn btn-default"
              style={{ fontSize: 11, gap: 5 }}
              onClick={() => { onApplyFix(result.correctedCode!); onClose(); }}
            >
              <Wand2 size={12} color="var(--clay-amber)" />
              Apply AI Fix
            </button>
          )}

          <button className="btn btn-default" style={{ fontSize: 11 }} onClick={onClose}>
            {result.passed ? 'Close' : 'Keep Editing'}
          </button>

          {result.passed && (
            <button className="btn btn-primary" style={{ fontSize: 11 }} onClick={() => { onClose(); onNext(); }}>
              Next Checkpoint <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Coach Chat ───────────────────────────────────────────────────────────────
function CoachChat({ plan, milestone, activeFile, fileContents }: {
  plan: ProjectPlan;
  milestone: GeminiMilestone;
  activeFile: string;
  fileContents: Record<string, string>;
}) {
  const chatKey = `devcoach_chat_${plan.id}`;
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(chatKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'init', role: 'assistant',
        content: `Senior Coach online for **${milestone.name}**. Write code for the active file, then click **Review Implementation**. Need guidance? Ask me anything!`,
        timestamp: ''
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(chatKey, JSON.stringify(messages));
    } catch (e) {}
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatKey]);

  const quickPrompts = ['Architectural hint', 'State flow pattern', 'Common pitfalls'];

  const sendMsg = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(), role: 'user', content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const streamingId = 'stream-' + Date.now();
    setMessages(prev => [...prev, userMsg, {
      id: streamingId, role: 'assistant', content: '', isLoading: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setLoading(true);

    try {
      const historyForApi = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        text: m.content
      })).concat([{ role: 'user' as const, text }]);

      let fullText = '';
      await streamCoachResponse(
        historyForApi,
        {
          projectTitle: plan.title,
          checkpointName: milestone.name,
          conceptTaught: milestone.conceptTaught,
          activeFile,
          currentCode: fileContents[activeFile] || '',
          hint1: milestone.hint1
        },
        (chunk) => {
          fullText += chunk;
          setMessages(prev => prev.map(m => m.id === streamingId
            ? { ...m, content: fullText, isLoading: false }
            : m
          ));
        }
      );
    } catch (e: any) {
      setMessages(prev => prev.map(m => m.id === streamingId
        ? { ...m, content: `Error: ${e.message}`, isLoading: false }
        : m
      ));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(input); setInput(''); }
  };

  return (
    <div className="chat-wrap" style={{ borderLeft: '1px solid var(--clay-border)' }}>
      <div className="panel-hdr">
        <span>Coach Assistant</span>
        <span style={{ fontWeight: 600, textTransform: 'none', color: 'var(--clay-text-muted)' }}>
          {milestone.name}
        </span>
      </div>

      <div style={{
        padding: '6px 14px', borderBottom: '1px solid var(--clay-border)',
        fontSize: 10, color: 'var(--clay-purple)', fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0
      }}>
        <ShieldAlert size={11} />
        Senior Lead • Active Reviewer
      </div>

      <div className="chat-messages" style={{ padding: '0' }}>
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(msg => (
            <div key={msg.id} className={`msg msg-${msg.role === 'user' ? 'user' : 'assistant'}`} style={{ gap: 8 }}>
              <div className="msg-avatar" style={{ width: 26, height: 26, fontSize: 10, borderRadius: 8 }}>
                {msg.role === 'user' ? 'U' : 'AI'}
              </div>
              <div className="msg-content">
                {msg.isLoading && !msg.content ? (
                  <div style={{ display: 'flex', gap: 6, color: 'var(--clay-text-muted)', alignItems: 'center' }}>
                    <Loader size={12} className="spin" /> <span style={{ fontSize: 12 }}>Thinking...</span>
                  </div>
                ) : (() => {
                  const parts = msg.content.split(/(```[\s\S]*?```)/g);
                  return (
                    <div className="msg-text">
                      {parts.map((p, i) => {
                        if (p.startsWith('```') && p.endsWith('```')) {
                          return <pre key={i} className="chat-code" style={{ fontSize: 11 }}>{p.slice(3, -3).replace(/^\w+\n/, '')}</pre>;
                        }
                        return <span key={i}>{p}</span>;
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div style={{ padding: '6px 10px', borderTop: '1px dashed var(--clay-border)', display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
        {quickPrompts.map(p => (
          <button
            key={p}
            className="btn btn-ghost"
            style={{ fontSize: 10, padding: '3px 8px' }}
            onClick={() => sendMsg(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ padding: '10px', borderTop: '1px solid var(--clay-border)', flexShrink: 0 }}>
        <div className="chat-input-wrap" style={{ padding: '6px 6px 6px 12px' }}>
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask your coach..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            disabled={loading}
            style={{ fontSize: 12 }}
          />
          <button
            className="chat-send"
            style={{ width: 30, height: 30 }}
            onClick={() => { sendMsg(input); setInput(''); }}
            disabled={!input.trim() || loading}
          >
            {loading ? <Loader size={12} color="#fff" className="spin" /> : <Send size={12} color="#fff" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Workspace ───────────────────────────────────────────────────────────
export function WorkspacePage({ plan }: WorkspaceProps) {
  const storeKey = `devcoach_ws_${plan.id}`;

  const [cpIndex, setCpIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${storeKey}_cp`);
      if (saved) return parseInt(saved, 10);
    } catch (e) {}
    return 0;
  });

  const [completedCpIndices, setCompletedCpIndices] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`${storeKey}_completed_cps`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const milestone = plan.milestones[cpIndex];

  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`${storeKey}_files`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const [activeFile, setActiveFile] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${storeKey}_activefile`);
      if (saved) return saved;
    } catch (e) {}
    return milestone?.filesUnlocked[0] || 'index.html';
  });

  const [unlockedFiles, setUnlockedFiles] = useState<string[]>(() => {
    const defaultUnlocked = plan.milestones.slice(0, cpIndex + 1).flatMap(m => m.filesUnlocked);
    return Array.from(new Set(defaultUnlocked));
  });

  const [terminalOutput, setTerminalOutput] = useState('$ workspace active\n');
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);
  const [watcherActive, setWatcherActive] = useState(false);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<string>('');
  const [showScopeCritique, setShowScopeCritique] = useState(false);
  const watcherTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate war room logs from plan
  const warRoomLogs: WarRoomLog[] = generateWarRoomLogs(plan.title, plan.scopeCritique);

  // Auto-fill starter code if file is empty
  useEffect(() => {
    if (milestone && (!fileContents[activeFile] || fileContents[activeFile].trim() === '')) {
      const starter = milestone.starterCode || `// ${activeFile}\n// TODO: Implement ${milestone.name} here\n`;
      setFileContents(prev => ({ ...prev, [activeFile]: starter }));
    }
  }, [milestone, activeFile]);

  // Persistence side effects
  useEffect(() => {
    try {
      localStorage.setItem(`${storeKey}_cp`, cpIndex.toString());
      localStorage.setItem(`${storeKey}_completed_cps`, JSON.stringify(completedCpIndices));
      localStorage.setItem(`${storeKey}_files`, JSON.stringify(fileContents));
      localStorage.setItem(`${storeKey}_activefile`, activeFile);
    } catch (e) {}
  }, [cpIndex, completedCpIndices, fileContents, activeFile, storeKey]);

  const handleCodeChange = (val: string) => {
    setFileContents(prev => ({ ...prev, [activeFile]: val }));
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1200);

    // Watchdog Daemon: track file edit & update heartbeat
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setWatcherActive(true);
    setLastHeartbeatTime(nowStr);

    if (watcherTimeoutRef.current) clearTimeout(watcherTimeoutRef.current);
    watcherTimeoutRef.current = setTimeout(() => setWatcherActive(false), 12000);
  };

  const handleReviewCode = async () => {
    if (!milestone || reviewing) return;
    setReviewing(true);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setWatcherActive(true);
    setLastHeartbeatTime(nowStr);

    setTerminalOutput(prev => prev + `\n[WATCHDOG DAEMON ${nowStr}] Code submission received for file "${activeFile}"\n[WATCHDOG DAEMON] Running AI Intent & AST Review for CP ${cpIndex + 1}: ${milestone.name}...\n`);

    try {
      const res = await reviewImplementationWithAI(
        fileContents[activeFile] || '',
        {
          name: milestone.name,
          conceptTaught: milestone.conceptTaught,
          actionableGoal: milestone.actionableGoal,
          referenceSolution: milestone.referenceSolution
        }
      );

      setReviewResult(res);

      if (res.passed) {
        const nextCompleted = completedCpIndices.includes(cpIndex) ? completedCpIndices : [...completedCpIndices, cpIndex];
        const newPct = Math.round((nextCompleted.length / plan.milestones.length) * 100);

        if (!completedCpIndices.includes(cpIndex)) {
          setCompletedCpIndices(nextCompleted);
        }

        setTerminalOutput(prev => prev + `[WATCHDOG DAEMON] ✅ PASSED (${res.score}/100) — Recalculated Demo Readiness: ${newPct}%\n  Feedback: ${res.feedback}\n`);
      } else {
        setTerminalOutput(prev => prev + `[WATCHDOG DAEMON] ⚠️ NEEDS REVISION (${res.score}/100)\n  Feedback: ${res.feedback}\n`);
      }
    } catch (e: any) {
      setTerminalOutput(prev => prev + `[WATCHDOG DAEMON] Error during review: ${e.message}\n`);
    } finally {
      setReviewing(false);
    }
  };

  const nextCheckpoint = () => {
    if (cpIndex >= plan.milestones.length - 1) return;
    const next = cpIndex + 1;
    setCpIndex(next);
    const nextMs = plan.milestones[next];
    const newFiles = Array.from(new Set([...unlockedFiles, ...nextMs.filesUnlocked]));
    setUnlockedFiles(newFiles);
    if (nextMs.filesUnlocked[0]) setActiveFile(nextMs.filesUnlocked[0]);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setWatcherActive(true);
    setLastHeartbeatTime(nowStr);

    setTerminalOutput(prev => prev + `\n[WATCHDOG DAEMON ${nowStr}] 🚀 Advanced to Checkpoint ${next + 1}: ${nextMs.name}\n[WATCHDOG DAEMON] Files Unlocked & Monitored: ${nextMs.filesUnlocked.join(', ')}\n`);
  };

  const selectCheckpoint = (idx: number) => {
    setCpIndex(idx);
    const selectedMs = plan.milestones[idx];
    const newFiles = Array.from(new Set([...unlockedFiles, ...selectedMs.filesUnlocked]));
    setUnlockedFiles(newFiles);
    if (selectedMs.filesUnlocked[0]) setActiveFile(selectedMs.filesUnlocked[0]);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setWatcherActive(true);
    setLastHeartbeatTime(nowStr);

    setTerminalOutput(prev => prev + `\n[WATCHDOG DAEMON ${nowStr}] Jumped to Checkpoint ${idx + 1}: ${selectedMs.name}\n[WATCHDOG DAEMON] Active Monitored File: ${selectedMs.filesUnlocked[0] || 'code'}\n`);
  };

  const applyAIFix = (correctedCode: string) => {
    setFileContents(prev => ({ ...prev, [activeFile]: correctedCode }));
    setTerminalOutput(prev => prev + `$ applied AI code fix to ${activeFile}\n`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top bar */}
      <div className="ws-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--clay-text)' }}>{milestone?.name}</span>
          <span className="tag tag-purple" style={{ fontSize: 10 }}>CP {cpIndex + 1}/{plan.milestones.length}</span>
          {savedBadge && (
            <span style={{ fontSize: 10, color: 'var(--clay-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Save size={11} /> Auto-Saved
            </span>
          )}
          <ReadinessGauge
            completedCount={completedCpIndices.length}
            totalCount={plan.milestones.length}
            watcherActive={watcherActive}
            activeFile={activeFile}
            lastHeartbeatTime={lastHeartbeatTime}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {plan.scopeCritique && plan.scopeCritique.length > 0 && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: 10, padding: '5px 10px', gap: 4 }}
              onClick={() => setShowScopeCritique(s => !s)}
            >
              ⚔️ Scope
            </button>
          )}
          <button
            className="btn btn-primary"
            style={{ fontSize: 11, padding: '6px 14px' }}
            onClick={handleReviewCode}
            disabled={reviewing}
          >
            {reviewing ? <Loader size={12} className="spin" color="#fff" /> : <CheckCircle size={12} color="#fff" />}
            Review Implementation
          </button>

          <button
            className="btn btn-default"
            style={{ fontSize: 11, padding: '6px 12px' }}
            onClick={nextCheckpoint}
            disabled={cpIndex >= plan.milestones.length - 1}
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Interactive Visual Roadmap Path Bar */}
      <ClayRoadmapPath
        milestones={plan.milestones}
        currentCpIndex={cpIndex}
        completedCpIndices={completedCpIndices}
        onSelectCheckpoint={selectCheckpoint}
      />

      {showScopeCritique && plan.scopeCritique && plan.scopeCritique.length > 0 && (
        <ScopeCritiqueCards cards={plan.scopeCritique} />
      )}

      {milestone && <TeachBar milestone={milestone} />}

      <div className="ws-layout" style={{ flex: 1 }}>
        <div className="ws-files">
          <FileTree unlockedFiles={unlockedFiles} activeFile={activeFile} onSelect={setActiveFile} />
        </div>

        <div className="ws-editor">
          <div style={{ flex: 1 }}>
            <MonacoCodeEditor
              filePath={activeFile}
              value={fileContents[activeFile] ?? milestone?.starterCode ?? `// ${activeFile}\n// TODO: Implement ${milestone?.name} here...\n`}
              onChange={handleCodeChange}
            />
          </div>
          <div style={{
            height: 120, flexShrink: 0, borderTop: '1px solid var(--clay-border)',
            background: '#181512', fontFamily: 'monospace', display: 'flex', flexDirection: 'column'
          }}>
            <div className="panel-hdr" style={{ background: '#241e1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Output Console</span>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 9, padding: '2px 6px' }}
                onClick={() => setTerminalOutput('$ cleared\n')}
              >
                Clear
              </button>
            </div>
            <div style={{ flex: 1, padding: '8px 14px', overflowY: 'auto', fontSize: 12, color: '#34d399', whiteSpace: 'pre-wrap' }}>
              {terminalOutput}
            </div>
          </div>
        </div>

        <div className="ws-chat">
          <CoachChat
            plan={plan}
            milestone={milestone}
            activeFile={activeFile}
            fileContents={fileContents}
          />
        </div>
      </div>

      {reviewResult && (
        <ReviewModal
          result={reviewResult}
          onClose={() => setReviewResult(null)}
          onNext={nextCheckpoint}
          onApplyFix={applyAIFix}
        />
      )}

      {/* War Room Bottom Drawer */}
      <WarRoomDrawer logs={warRoomLogs} />
    </div>
  );
}
