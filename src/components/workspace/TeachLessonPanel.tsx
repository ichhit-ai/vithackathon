import { useState } from 'react';
import type { Milestone } from '../../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function TeachLessonPanel({ milestone }: { milestone: Milestone }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-sidebar)', flexShrink: 0 }}>
      {/* Toggle row */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 14px', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border-subtle)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Teach
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>
            {milestone.name}
          </span>
          <span className="tag" style={{ fontSize: 10 }}>{milestone.conceptTaught}</span>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {open && (
        <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 10 }} className="animate-in">
          {/* Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concept</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {milestone.lessonContent.summary}
            </p>
          </div>

          {/* Why needed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Why now</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {milestone.lessonContent.whyNeeded}
            </p>
          </div>

          {/* Snippet + goal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Example (different domain)
            </div>
            <pre style={{
              background: 'var(--bg-app)', border: '1px solid var(--border)',
              borderRadius: 5, padding: '8px 10px', fontSize: 11,
              color: 'var(--text-secondary)', overflow: 'auto', margin: 0
            }}><code>{milestone.lessonContent.exampleSnippet}</code></pre>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Goal: {milestone.lessonContent.actionableGoal}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
