import { useState } from 'react';
import type { ProjectPlan } from '../types';
import { PlanEditorModal } from '../components/planner/PlanEditorModal';
import {
  Sparkles, Terminal, Presentation, Edit3, Clock,
  CheckCircle2, ChevronRight, ArrowRight
} from 'lucide-react';

interface PlannerPageProps {
  plans: ProjectPlan[];
  selectedPlan: ProjectPlan;
  onSelectPlan: (plan: ProjectPlan) => void;
  onGeneratePlans: (idea: string) => void;
  onNavigateToPresentation: () => void;
  onNavigateToWorkspace: () => void;
}

export function PlannerPage({
  plans, selectedPlan, onSelectPlan, onGeneratePlans,
  onNavigateToPresentation, onNavigateToWorkspace
}: PlannerPageProps) {
  const [idea, setIdea] = useState('');
  const [editingPlan, setEditingPlan] = useState<ProjectPlan | null>(null);

  const presets = [
    'Habit Tracker with Streaks',
    'Markdown Note App',
    'Real-Time Quiz Leaderboard',
    'Developer Portfolio',
    'Weather Dashboard',
  ];

  const handleGenerate = (text: string) => {
    setIdea(text);
    onGeneratePlans(text);
  };

  const tierLabel: Record<string, string> = {
    lean: 'Lean',
    standard: 'Standard',
    ambitious: 'Ambitious',
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* Left panel — idea input */}
      <div style={{
        width: 300, minWidth: 300, flexShrink: 0,
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-sidebar)',
        overflow: 'hidden'
      }}>
        <div className="panel-header">
          <span>Project Idea</span>
        </div>

        <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          {/* Input */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Describe what you want to build
            </label>
            <textarea
              className="input"
              rows={4}
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="e.g. A habit tracker with daily streaks and progress charts..."
              style={{ resize: 'none', lineHeight: 1.5 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => idea.trim() && handleGenerate(idea)}
              style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
            >
              <Sparkles size={12} />
              Generate Plans
            </button>
          </div>

          <hr className="divider" />

          {/* Presets */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Start
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => handleGenerate(p)}
                  style={{
                    textAlign: 'left', background: 'none', border: 'none',
                    padding: '6px 8px', borderRadius: 5, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 8, transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p}</span>
                  <ChevronRight size={11} color="#555" />
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* CTA actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
            <button className="btn btn-default" style={{ justifyContent: 'center' }} onClick={onNavigateToPresentation}>
              <Presentation size={12} />
              View Slide Deck
            </button>
            <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={onNavigateToWorkspace}>
              <Terminal size={12} />
              Launch Workspace
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Right panel — plan cards */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="panel-header">
          <span>Generated Plans</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>
            Select a scope tier to continue
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {plans.map(plan => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <div
                key={plan.id}
                style={{
                  background: isSelected ? 'var(--bg-card)' : 'var(--bg-sidebar)',
                  border: `1px solid ${isSelected ? 'var(--border)' : 'var(--border-subtle)'}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  transition: 'border-color 0.1s',
                }}
              >
                {/* Card header row */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border-subtle)',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`tag ${isSelected ? 'tag-green' : ''}`} style={{ fontSize: 10 }}>
                      {tierLabel[plan.tier]}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                      {plan.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                      <Clock size={11} />
                      ~{plan.estimatedHours}h
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {plan.milestones.length} checkpoints
                    </span>
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="btn btn-ghost"
                      style={{ padding: '4px 6px' }}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => onSelectPlan(plan)}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-default'}`}
                      style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                      {isSelected ? (
                        <><CheckCircle2 size={11} /> Selected</>
                      ) : 'Select'}
                    </button>
                  </div>
                </div>

                {/* Summary + stack + milestones */}
                <div style={{ padding: '10px 14px', display: 'flex', gap: 20 }}>
                  {/* Left: summary + stack */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {plan.summary}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {plan.techStack.map(t => (
                        <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Right: milestone list */}
                  <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {plan.milestones.slice(0, 5).map((m, i) => (
                      <div key={m.id} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '3px 0', fontSize: 11, color: 'var(--text-secondary)'
                      }}>
                        <span style={{
                          width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                          background: 'var(--bg-active)', border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, color: 'var(--text-muted)', fontFamily: 'monospace'
                        }}>{i + 1}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.name}
                        </span>
                      </div>
                    ))}
                    {plan.milestones.length > 5 && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', paddingTop: 2 }}>
                        +{plan.milestones.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingPlan && (
        <PlanEditorModal
          plan={editingPlan}
          onSave={updated => { onSelectPlan(updated); setEditingPlan(null); }}
          onClose={() => setEditingPlan(null)}
        />
      )}
    </div>
  );
}
