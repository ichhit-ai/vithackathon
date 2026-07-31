import { useState, useEffect } from 'react';
import type { AttemptResult, Milestone } from '../../types';
import confetti from 'canvas-confetti';
import { X, ChevronRight, Eye } from 'lucide-react';

interface Props {
  result: AttemptResult;
  milestone: Milestone;
  onNextCheckpoint: () => void;
  onClose: () => void;
}

export function JudgeFeedbackModal({ result, milestone, onNextCheckpoint, onClose }: Props) {
  const [showRef, setShowRef] = useState(false);

  useEffect(() => {
    if (result.passed) confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 }, colors: ['#3d9970', '#888', '#e8e8e8'] });
  }, [result.passed]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border)',
        borderRadius: 8, width: '100%', maxWidth: 520,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }} className="animate-in">
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: result.passed ? 'var(--green)' : 'var(--red)',
              flexShrink: 0
            }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {result.passed ? 'Checkpoint Passed' : 'Needs Revision'}
            </span>
            <span className="tag" style={{ fontSize: 10 }}>Score: {result.score}/100</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Attempt #{result.attemptNumber}</span>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '4px 6px' }}>
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* LLM feedback */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '10px 12px', fontSize: 12,
            color: 'var(--text-secondary)', lineHeight: 1.6
          }}>
            {result.llmFeedback}
          </div>

          {/* Signals */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Execution Tests', items: result.testResults },
              { label: 'Static Checks', items: result.staticResults },
            ].map(({ label, items }) => (
              <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  {label}
                </div>
                {items.map((it: any) => (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, fontSize: 11, paddingBottom: 4, color: 'var(--text-secondary)' }}>
                    <span style={{ flex: 1 }}>• {it.description}</span>
                    <span style={{ color: it.passed ? 'var(--green)' : 'var(--red)', fontFamily: 'monospace', flexShrink: 0 }}>
                      {it.passed ? 'pass' : 'fail'}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Hint */}
          {!result.passed && milestone.hints.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Hint #{Math.min(result.attemptNumber, milestone.hints.length)}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                {milestone.hints[Math.min(result.attemptNumber - 1, milestone.hints.length - 1)]}
              </p>
            </div>
          )}

          {/* Reference solution */}
          {!result.passed && result.attemptNumber >= 2 && (
            <div>
              <button
                onClick={() => setShowRef(!showRef)}
                className="btn btn-ghost"
                style={{ fontSize: 11, gap: 5, textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}
              >
                <Eye size={11} />
                {showRef ? 'Hide' : 'View'} reference solution
              </button>
              {showRef && (
                <pre style={{
                  marginTop: 8, background: 'var(--bg-app)', border: '1px solid var(--border)',
                  borderRadius: 5, padding: '10px 12px', fontSize: 11,
                  color: 'var(--text-secondary)', overflow: 'auto'
                }}>
                  <code>{Object.values(milestone.referenceSolution)[0]}</code>
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button onClick={onClose} className="btn btn-default" style={{ fontSize: 11 }}>
            {result.passed ? 'Close' : 'Retry'}
          </button>
          {result.passed && (
            <button
              onClick={() => { onClose(); onNextCheckpoint(); }}
              className="btn btn-primary"
              style={{ fontSize: 11 }}
            >
              Next Checkpoint
              <ChevronRight size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
