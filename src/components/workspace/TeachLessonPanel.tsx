import { useState } from 'react';
import type { GeminiMilestone as Milestone } from '../../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function TeachLessonPanel({ milestone }: { milestone: Milestone }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ borderBottom: '1px solid var(--clay-border)', background: 'var(--clay-surface)', flexShrink: 0 }}>
      {/* Toggle row */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 14px', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--clay-border)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--clay-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Teach
          </span>
          <span style={{ fontSize: 12, color: 'var(--clay-text)', fontWeight: 500 }}>
            {milestone.name}
          </span>
          <span className="tag" style={{ fontSize: 10 }}>{milestone.conceptTaught}</span>
        </div>
        <span style={{ color: 'var(--clay-text-muted)' }}>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {open && (
        <div style={{ padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 10 }} className="fade-up">
          {/* Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--clay-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Concept</div>
            <p style={{ fontSize: 12, color: 'var(--clay-text-muted)', margin: 0, lineHeight: 1.5 }}>
              {milestone.lessonSummary}
            </p>
          </div>

          {/* Why needed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--clay-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Why now</div>
            <p style={{ fontSize: 12, color: 'var(--clay-text-muted)', margin: 0, lineHeight: 1.5 }}>
              {milestone.whyNeeded}
            </p>
          </div>

          {/* Snippet + goal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 10, color: 'var(--clay-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Example Code
            </div>
            <pre style={{
              background: 'var(--clay-card)', border: '1px solid var(--clay-border)',
              borderRadius: 5, padding: '8px 10px', fontSize: 11,
              color: 'var(--clay-text)', overflow: 'auto', margin: 0
            }}><code>{milestone.exampleSnippet}</code></pre>
            <div style={{ fontSize: 11, color: 'var(--clay-text-muted)', fontStyle: 'italic' }}>
              Goal: {milestone.actionableGoal}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
