import { useState, useEffect, useRef } from 'react';
import type { WarRoomLog } from '../../types';
import { ChevronUp, ChevronDown, Terminal } from 'lucide-react';

interface WarRoomDrawerProps {
  logs?: WarRoomLog[];
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

export function WarRoomDrawer({ logs = [] }: WarRoomDrawerProps) {
  const [open, setOpen] = useState(false);
  const [visibleLogs, setVisibleLogs] = useState<WarRoomLog[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Safely reveal logs sequentially when drawer opens
  useEffect(() => {
    if (!open || !logs || logs.length === 0) {
      if (logs && logs.length > 0 && !open) {
        setVisibleLogs(logs); // preload so opening shows logs instantly
      }
      return;
    }

    setVisibleLogs([]);
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < logs.length) {
        const item = logs[idx];
        if (item) {
          setVisibleLogs(prev => [...prev, item]);
        }
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 400);

    return () => clearInterval(timer);
  }, [open, logs]);

  // Safe container scroll (prevents scrolling parent window)
  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLogs, open]);

  const safeLogs = Array.isArray(visibleLogs) ? visibleLogs : [];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 220, right: 0, zIndex: 100,
      background: '#0f0d0b', borderTop: '2px solid var(--clay-border)',
      transition: 'height 0.25s ease-in-out',
      height: open ? 220 : 36,
      display: 'flex', flexDirection: 'column',
      boxShadow: open ? '0 -8px 30px rgba(0,0,0,0.5)' : 'none',
      overflow: 'hidden'
    }}>
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px', border: 'none', background: 'transparent',
          cursor: 'pointer', flexShrink: 0, width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={13} color="var(--clay-green)" />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-green)', letterSpacing: '0.06em' }}>
            WAR ROOM
          </span>
          <span style={{ fontSize: 10, color: 'var(--clay-text-muted)' }}>
            AI Council Deliberation Log ({logs ? logs.length : 0} events)
          </span>
          {!open && logs && logs.length > 0 && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: 'var(--clay-green)',
              display: 'inline-block'
            }} />
          )}
        </div>
        {open ? <ChevronDown size={14} color="var(--clay-text-muted)" /> : <ChevronUp size={14} color="var(--clay-text-muted)" />}
      </button>

      {/* Log stream container */}
      {open && (
        <div
          ref={containerRef}
          style={{
            flex: 1, overflowY: 'auto', padding: '6px 16px 14px',
            fontFamily: 'monospace', fontSize: 11, lineHeight: 1.7,
            background: '#0a0907'
          }}
        >
          {safeLogs.map((log, index) => (
            <div key={log.id || `log-${index}`} style={{ marginBottom: 4 }}>
              <span style={{ color: 'var(--clay-text-subtle)', marginRight: 8 }}>[{log.timestamp || '00:00'}]</span>
              <span style={{ color: AGENT_COLORS[log.agent] || 'var(--clay-cyan)', fontWeight: 700, marginRight: 6 }}>
                {AGENT_LABELS[log.agent] || log.agent || 'Agent'}:
              </span>
              <span style={{ color: '#d4c9be' }}>{log.message}</span>
            </div>
          ))}
          {safeLogs.length < logs.length && (
            <div style={{ color: 'var(--clay-text-subtle)', fontStyle: 'italic' }}>
              ● streaming council debate...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
