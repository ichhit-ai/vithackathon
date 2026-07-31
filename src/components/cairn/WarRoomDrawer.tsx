import { useState, useEffect, useRef } from 'react';
import type { WarRoomLog } from '../../types';
import { ChevronUp, ChevronDown, Terminal } from 'lucide-react';

interface WarRoomDrawerProps {
  logs: WarRoomLog[];
}

const AGENT_COLORS: Record<string, string> = {
  architect: 'var(--clay-cyan)',
  slasher: 'var(--clay-red)',
  pitch: 'var(--clay-amber)',
  coach: 'var(--clay-green)',
};

const AGENT_LABELS: Record<string, string> = {
  architect: '🏗️ Architect',
  slasher: '⚔️ Scope Slasher',
  pitch: '📢 Pitch Coach',
  coach: '🤖 DevCoach AI',
};

export function WarRoomDrawer({ logs }: WarRoomDrawerProps) {
  const [open, setOpen] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState<WarRoomLog[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // Simulate streaming: reveal logs one at a time with delay
  useEffect(() => {
    if (!open || logs.length === 0) return;
    setVisibleLogs([]);
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < logs.length) {
        setVisibleLogs(prev => [...prev, logs[idx]]);
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 800);
    return () => clearInterval(timer);
  }, [open, logs]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLogs]);

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 220, right: 0, zIndex: 50,
      background: '#0f0d0b', borderTop: '2px solid var(--clay-border)',
      transition: 'height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      height: open ? 220 : 36,
      display: 'flex', flexDirection: 'column',
      boxShadow: open ? '0 -8px 30px rgba(0,0,0,0.4)' : 'none'
    }}>
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px', border: 'none', background: 'transparent',
          cursor: 'pointer', flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={13} color="var(--clay-green)" />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-green)', letterSpacing: '0.06em' }}>
            WAR ROOM
          </span>
          <span style={{ fontSize: 10, color: 'var(--clay-text-muted)' }}>
            AI Council Deliberation Log
          </span>
          {!open && logs.length > 0 && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--clay-green)',
              animation: 'pulse 2s infinite'
            }} />
          )}
        </div>
        {open ? <ChevronDown size={14} color="var(--clay-text-muted)" /> : <ChevronUp size={14} color="var(--clay-text-muted)" />}
      </button>

      {/* Log stream */}
      {open && (
        <div style={{
          flex: 1, overflowY: 'auto', padding: '4px 16px 12px',
          fontFamily: 'monospace', fontSize: 11, lineHeight: 1.7
        }}>
          {visibleLogs.map(log => (
            <div key={log.id} className="fade-up" style={{ marginBottom: 4 }}>
              <span style={{ color: 'var(--clay-text-subtle)', marginRight: 8 }}>[{log.timestamp}]</span>
              <span style={{ color: AGENT_COLORS[log.agent] || '#fff', fontWeight: 700, marginRight: 6 }}>
                {AGENT_LABELS[log.agent] || log.agent}:
              </span>
              <span style={{ color: '#d4c9be' }}>{log.message}</span>
            </div>
          ))}
          {visibleLogs.length < logs.length && (
            <div style={{ color: 'var(--clay-text-subtle)', fontStyle: 'italic' }}>
              ● streaming agent deliberation...
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}
