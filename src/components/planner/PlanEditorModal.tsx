import { useState } from 'react';
import type { ProjectPlan, Milestone } from '../../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface Props {
  plan: ProjectPlan;
  onSave: (p: ProjectPlan) => void;
  onClose: () => void;
}

export function PlanEditorModal({ plan, onSave, onClose }: Props) {
  const [title, setTitle] = useState(plan.title);
  const [summary, setSummary] = useState(plan.summary);
  const [stack, setStack] = useState(plan.techStack.join(', '));
  const [milestones, setMilestones] = useState<Milestone[]>(plan.milestones);

  const addMs = () => {
    const ms: Milestone = {
      id: 'm-custom-' + Date.now(), order: milestones.length + 1,
      name: 'Custom Checkpoint', conceptTaught: 'Custom Concept',
      difficulty: 'intermediate', estimatedMinutes: 30,
      protectedScope: '', lessonContent: { summary: '', whyNeeded: '', exampleSnippet: '', exampleDescription: '', actionableGoal: '' },
      testCases: [], staticChecks: [], filesUnlocked: ['/src/App.tsx'],
      referenceSolution: { '/src/App.tsx': '' }, hints: []
    };
    setMilestones(p => [...p, ms]);
  };

  const save = () => {
    onSave({ ...plan, title, summary, techStack: stack.split(',').map(s => s.trim()).filter(Boolean), milestones });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border)',
        borderRadius: 8, width: '100%', maxWidth: 520,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }} className="animate-in">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            Edit Plan · <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{plan.tier}</span>
          </span>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '4px 6px' }}>
            <X size={13} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Title', el: <input className="input" value={title} onChange={e => setTitle(e.target.value)} /> },
            { label: 'Summary', el: <textarea className="input" rows={2} value={summary} onChange={e => setSummary(e.target.value)} style={{ resize: 'none' }} /> },
            { label: 'Tech Stack (comma separated)', el: <input className="input" value={stack} onChange={e => setStack(e.target.value)} style={{ fontFamily: 'monospace' }} /> },
          ].map(({ label, el }) => (
            <div key={label}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, fontWeight: 500 }}>{label}</label>
              {el}
            </div>
          ))}

          {/* Milestones */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                Checkpoints ({milestones.length})
              </label>
              <button onClick={addMs} className="btn btn-ghost" style={{ fontSize: 11, gap: 4, textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>
                <Plus size={11} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {milestones.map((m, i) => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 5, padding: '7px 10px'
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', width: 18 }}>{i + 1}.</span>
                  <input
                    value={m.name}
                    onChange={e => {
                      const v = e.target.value;
                      setMilestones(p => p.map(x => x.id === m.id ? { ...x, name: v } : x));
                    }}
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)' }}
                  />
                  <button onClick={() => setMilestones(p => p.filter(x => x.id !== m.id))} className="btn btn-ghost" style={{ padding: '2px 4px' }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button onClick={onClose} className="btn btn-default" style={{ fontSize: 11 }}>Cancel</button>
          <button onClick={save} className="btn btn-primary" style={{ fontSize: 11 }}>Save Plan</button>
        </div>
      </div>
    </div>
  );
}
