import { useState } from 'react';
import type { GeminiMilestone } from '../../types';
import { CheckCircle2, MapPin, ChevronDown, ChevronUp, Play, Unlock } from 'lucide-react';

interface ClayRoadmapPathProps {
  milestones: GeminiMilestone[];
  currentCpIndex: number;
  completedCpIndices: number[];
  onSelectCheckpoint: (index: number) => void;
}

export function ClayRoadmapPath({
  milestones,
  currentCpIndex,
  completedCpIndices,
  onSelectCheckpoint,
}: ClayRoadmapPathProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div style={{
      background: 'var(--clay-card)',
      borderRadius: 'var(--clay-radius-md)',
      boxShadow: 'var(--clay-shadow)',
      margin: '10px 16px 4px 16px',
      padding: '10px 16px',
      border: '1px solid var(--clay-border)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        cursor: 'pointer'
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--clay-purple), var(--clay-cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '2px 4px 8px var(--clay-purple-shadow)'
          }}>
            <MapPin size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--clay-text)' }}>
              Interactive Learning Path
            </div>
            <div style={{ fontSize: 10, color: 'var(--clay-text-muted)', fontWeight: 600 }}>
              Click any step to jump freely • {completedCpIndices.length} of {milestones.length} Completed
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="tag tag-purple" style={{ fontSize: 9 }}>
            Step {currentCpIndex + 1} of {milestones.length}
          </span>
          <button className="btn btn-ghost btn-icon" style={{ padding: 4 }}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Visual Roadmap Path Nodes */}
      {isExpanded && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px dashed var(--clay-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 6
        }} className="fade-up">
          {milestones.map((m, idx) => {
            const isCompleted = completedCpIndices.includes(idx);
            const isActive = currentCpIndex === idx;

            let bgColor = 'var(--clay-card-inner)';
            let borderColor = 'var(--clay-border)';
            let textColor = 'var(--clay-text-muted)';
            let shadow = 'var(--clay-shadow)';
            let badgeGradient = 'linear-gradient(135deg, var(--clay-purple), var(--clay-cyan))';

            if (isCompleted) {
              bgColor = 'rgba(16, 185, 129, 0.1)';
              borderColor = 'var(--clay-green)';
              textColor = 'var(--clay-text)';
              shadow = '4px 6px 14px var(--clay-green-shadow)';
              badgeGradient = 'linear-gradient(135deg, #34d399, var(--clay-green))';
            } else if (isActive) {
              bgColor = 'rgba(139, 92, 246, 0.12)';
              borderColor = 'var(--clay-purple)';
              textColor = 'var(--clay-text)';
              shadow = '6px 8px 18px var(--clay-purple-shadow)';
              badgeGradient = 'linear-gradient(135deg, var(--clay-purple), var(--clay-coral))';
            }

            return (
              <div key={m.order} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {/* Node Box - Always Clickable! */}
                <div
                  onClick={() => onSelectCheckpoint(idx)}
                  style={{
                    background: bgColor,
                    border: `2px solid ${borderColor}`,
                    borderRadius: 'var(--clay-radius-md)',
                    padding: '8px 12px',
                    boxShadow: shadow,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    minWidth: 160,
                    maxWidth: 220,
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  title={`Jump to Checkpoint ${m.order}: ${m.name}`}
                >
                  {/* Step Number Circle */}
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: badgeGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 11,
                    flexShrink: 0,
                    boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.6)'
                  }}>
                    {isCompleted ? <CheckCircle2 size={15} /> : m.order}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: textColor,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {m.name}
                    </div>
                    <div style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: isActive ? 'var(--clay-purple)' : isCompleted ? 'var(--clay-green)' : 'var(--clay-text-subtle)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {isActive ? '● Active Step' : isCompleted ? '✓ Completed' : 'Unlocked'}
                    </div>
                  </div>
                </div>

                {/* Path Connector Line */}
                {idx < milestones.length - 1 && (
                  <div style={{
                    width: 20,
                    height: 4,
                    borderRadius: 2,
                    background: isCompleted ? 'var(--clay-green)' : 'var(--clay-border)',
                    margin: '0 4px',
                    flexShrink: 0
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
