import { useState, useEffect } from 'react';
import type { ProjectPlan } from '../../types';
import { exportPlanToPowerPoint } from '../../services/pptxExporter';
import { ChevronLeft, ChevronRight, Download, Terminal, Sparkles, HelpCircle, CheckCircle2, AlertTriangle, Code2 } from 'lucide-react';

interface SlideDeckProps {
  plan: ProjectPlan;
  onLaunchWorkspace: () => void;
}

export function SlideDeck({ plan, onLaunchWorkspace }: SlideDeckProps) {
  const [slide, setSlide] = useState(0);

  // Dynamic Total Slides: Title + NaiveVsInsight + TechTable + (1 slide per milestone) + CheckpointQuiz + Closing
  const TOTAL = 5 + plan.milestones.length;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') setSlide(s => Math.min(s + 1, TOTAL - 1));
      if (e.key === 'ArrowLeft') setSlide(s => Math.max(s - 1, 0));
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [TOTAL]);

  const slideDeckElements = [
    // ─── Slide 1: Title Slide ────────────────────────────────────────────────
    <div key="title" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="tag tag-purple">
          DEVCOACH SPECIFICATION • {plan.tier.toUpperCase()} EDITION
        </span>
        <span className="tag">{plan.milestones.length} Checkpoints</span>
        <span className="tag tag-green">~{plan.estimatedHours} Hours</span>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--clay-text)', margin: 0, lineHeight: 1.25 }}>
        {plan.title}
      </h1>

      <div style={{
        background: 'var(--clay-card)', borderRadius: 'var(--clay-radius-md)',
        boxShadow: 'var(--clay-shadow)', padding: '16px 20px', borderLeft: '4px solid var(--clay-purple)'
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-purple)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Core Architectural Purpose & Problem Solved
        </div>
        <p style={{ fontSize: 13, color: 'var(--clay-text-muted)', margin: 0, lineHeight: 1.6 }}>
          {plan.summary}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Checkpoints', val: `${plan.milestones.length} Milestones`, color: 'var(--clay-cyan)' },
          { label: 'Estimated Time', val: `~${plan.estimatedHours} Hours`, color: 'var(--clay-green)' },
          { label: 'AI Review Engine', val: 'Gemini 3.1 Flash Lite', color: 'var(--clay-amber)' },
        ].map(st => (
          <div key={st.label} style={{
            background: 'var(--clay-card-inner)', borderRadius: 'var(--clay-radius-md)',
            boxShadow: 'var(--clay-shadow)', padding: '12px 16px'
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: st.color, textTransform: 'uppercase' }}>
              {st.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--clay-text)', marginTop: 4 }}>
              {st.val}
            </div>
          </div>
        ))}
      </div>
    </div>,

    // ─── Slide 2: Two-Column — Naive vs Key Insight Philosophy ───────────────
    <div key="philosophy" style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', justifyContent: 'center' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-primary)', letterSpacing: '0.08em' }}>PHILOSOPHY</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--clay-text)', marginTop: 2, margin: 0 }}>
          Teach Thinking, Not Facts: Why Brute-Force Learning Fails
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Left Column: Naive Flaws */}
        <div style={{
          background: 'var(--clay-card)', borderRadius: 'var(--clay-radius-md)',
          boxShadow: 'var(--clay-shadow)', padding: '16px 18px', borderTop: '4px solid var(--clay-red)'
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--clay-red)', marginBottom: 8 }}>
            NAIVE APPROACH & COMMON FLAWS
          </div>
          <ul style={{ fontSize: 12, color: 'var(--clay-text-muted)', lineHeight: 1.6, paddingLeft: 16 }}>
            <li>Copy-pasting boilerplate without understanding state flow.</li>
            <li>Blindly re-checking logic that is already available.</li>
            <li>Giving up when hitting unassisted syntax or type errors.</li>
            <li>Learning isolated syntax without end-to-end context.</li>
          </ul>
        </div>

        {/* Right Column: Key Insight */}
        <div style={{
          background: 'var(--clay-card)', borderRadius: 'var(--clay-radius-md)',
          boxShadow: 'var(--clay-shadow)', padding: '16px 18px', borderTop: '4px solid var(--clay-green)'
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--clay-green)', marginBottom: 8 }}>
            KEY INSIGHT & DEVCOACH FIX
          </div>
          <ul style={{ fontSize: 12, color: 'var(--clay-text-muted)', lineHeight: 1.6, paddingLeft: 16 }}>
            <li>Progressive file unlocking reduces scope to 1 step at a time.</li>
            <li>Clear <code>// TODO</code> markers keep focus on core logic.</li>
            <li>Senior AI Coach guides via Socratic prompts instead of direct answers.</li>
            <li>Qualitative Gemini review evaluates intent, not rigid string matching.</li>
          </ul>
        </div>
      </div>
    </div>,

    // ─── Slide 3: Tech Stack Reference Table ─────────────────────────────────
    <div key="techtable" style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', justifyContent: 'center' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-cyan)', letterSpacing: '0.08em' }}>TECH STACK</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--clay-text)', marginTop: 2, margin: 0 }}>
          Technology Stack Architecture & Role Justifications
        </h2>
      </div>

      <div style={{
        background: 'var(--clay-card)', borderRadius: 'var(--clay-radius-md)',
        boxShadow: 'var(--clay-shadow)', overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--clay-cyan)', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px', fontWeight: 800 }}>Technology / Dependency</th>
              <th style={{ padding: '10px 14px', fontWeight: 800 }}>Category</th>
              <th style={{ padding: '10px 14px', fontWeight: 800 }}>Why Selected & Engineering Purpose</th>
            </tr>
          </thead>
          <tbody>
            {plan.techStack.map((tech, i) => (
              <tr key={tech} style={{ borderBottom: i < plan.techStack.length - 1 ? '1px solid var(--clay-border)' : 'none' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--clay-text)' }}>{tech}</td>
                <td style={{ padding: '10px 14px', color: 'var(--clay-purple)', fontWeight: 600 }}>Core Stack</td>
                <td style={{ padding: '10px 14px', color: 'var(--clay-text-muted)' }}>
                  Essential dependency for building {plan.title}. Implements clean modular component boundaries and high performance.
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>,

    // ─── Slides 4..N: Milestone Deep-Dives (1 Slide per Checkpoint) ─────────
    ...plan.milestones.map((m) => (
      <div key={`ms-${m.order}`} style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-purple)', letterSpacing: '0.08em' }}>
            CHECKPOINT {m.order} OF {plan.milestones.length}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--clay-text)', marginTop: 2, margin: 0 }}>
            {m.name}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--clay-card)', borderRadius: 'var(--clay-radius-md)', boxShadow: 'var(--clay-shadow)', padding: '14px 16px', borderLeft: '4px solid var(--clay-purple)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-purple)', marginBottom: 4 }}>1. CONCEPT TAUGHT & LESSON</div>
            <div style={{ fontSize: 12, color: 'var(--clay-text-muted)', lineHeight: 1.5 }}>
              <strong>{m.conceptTaught}:</strong> {m.lessonSummary}
            </div>
          </div>

          <div style={{ background: 'var(--clay-card)', borderRadius: 'var(--clay-radius-md)', boxShadow: 'var(--clay-shadow)', padding: '14px 16px', borderLeft: '4px solid var(--clay-amber)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-amber)', marginBottom: 4 }}>2. WHY NEEDED (PROBLEM SOLVED)</div>
            <div style={{ fontSize: 12, color: 'var(--clay-text-muted)', lineHeight: 1.5 }}>
              {m.whyNeeded}
            </div>
          </div>

          <div style={{ background: 'var(--clay-card)', borderRadius: 'var(--clay-radius-md)', boxShadow: 'var(--clay-shadow)', padding: '14px 16px', borderLeft: '4px solid var(--clay-green)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-green)', marginBottom: 4 }}>3. ACTIONABLE GOAL & HINT</div>
            <div style={{ fontSize: 12, color: 'var(--clay-text-muted)', lineHeight: 1.5 }}>
              <strong>Goal:</strong> {m.actionableGoal}<br />
              <strong>Hint:</strong> {m.hint1}
            </div>
          </div>

          <div style={{ background: 'var(--clay-card)', borderRadius: 'var(--clay-radius-md)', boxShadow: 'var(--clay-shadow)', padding: '14px 16px', borderLeft: '4px solid var(--clay-pink)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-pink)', marginBottom: 4 }}>4. CODE SNIPPET & UNLOCKED FILES</div>
            <pre className="chat-code" style={{ fontSize: 10, margin: 0, maxHeight: 90, overflowY: 'auto' }}>
              {m.exampleSnippet || `// ${m.filesUnlocked[0] || 'App.tsx'}\n// TODO: Implement ${m.conceptTaught}`}
            </pre>
            <div style={{ fontSize: 10, color: 'var(--clay-text-subtle)', marginTop: 4, fontWeight: 600 }}>
              Files Unlocked: {m.filesUnlocked.join(', ')}
            </div>
          </div>
        </div>
      </div>
    )),

    // ─── Slide N+1: Conceptual Checkpoint Quiz ────────────────────────────────
    <div key="checkpointquiz" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'center' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--clay-amber)', letterSpacing: '0.08em' }}>CHECKPOINT QUIZ</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--clay-text)', marginTop: 2, margin: 0 }}>
          5 Conceptual Questions to Prove Architectural Understanding
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          `1. Why is ${plan.milestones[0]?.conceptTaught || 'modular state'} introduced first before building advanced UI logic?`,
          `2. What specific flaw would occur if we didn't implement ${plan.milestones[1]?.conceptTaught || 'event handlers'} correctly?`,
          `3. How does ${plan.title} handle data updates without triggering redundant state re-renders?`,
          `4. What mechanistic error causes state mutation bugs during async operations?`,
          `5. How do the unlocked files (${plan.milestones[0]?.filesUnlocked.join(', ')}) separate concerns cleanly?`
        ].map((q, i) => (
          <div key={i} style={{
            background: 'var(--clay-card)', borderRadius: 'var(--clay-radius-md)',
            boxShadow: 'var(--clay-shadow)', padding: '10px 14px', borderLeft: '3px solid var(--clay-amber)',
            fontSize: 12, fontWeight: 700, color: 'var(--clay-text)'
          }}>
            {q}
          </div>
        ))}
      </div>
    </div>,

    // ─── Slide N+2: Closing Slide ──────────────────────────────────────────────
    <div key="closing" style={{
      display: 'flex', flexDirection: 'column', gap: 18, height: '100%',
      justifyContent: 'center', alignItems: 'center', textAlign: 'center'
    }}>
      <span className="tag tag-green">
        READY TO IMPLEMENT
      </span>

      <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--clay-text)', margin: 0 }}>
        Launch {plan.title} Workspace
      </h2>

      <p style={{ fontSize: 13, color: 'var(--clay-text-muted)', margin: 0, maxWidth: 540, lineHeight: 1.6 }}>
        <em>"Never state a fact without explaining the problem it solves."</em><br />
        Your workspace is ready with live Socratic AI coaching, Monaco Editor, and Qualitative AI Code Review.
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
        <button
          onClick={() => exportPlanToPowerPoint(plan)}
          className="btn btn-default"
          style={{ padding: '10px 20px', fontSize: 12, gap: 8 }}
        >
          <Download size={14} />
          Export PowerPoint (.pptx)
        </button>
        <button
          onClick={onLaunchWorkspace}
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: 12, gap: 8 }}
        >
          <Terminal size={14} />
          Launch Workspace
        </button>
      </div>
    </div>
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="var(--clay-purple)" />
          <span>Presentation Deck</span>
          <span className="tag tag-purple" style={{ fontSize: 10 }}>{plan.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => exportPlanToPowerPoint(plan)}
            className="btn btn-default"
            style={{ fontSize: 11, padding: '5px 12px', gap: 6 }}
          >
            <Download size={12} />
            Export .pptx
          </button>
          <button
            onClick={onLaunchWorkspace}
            className="btn btn-primary"
            style={{ fontSize: 11, padding: '5px 12px', gap: 6 }}
          >
            <Terminal size={12} />
            Launch Workspace
          </button>
        </div>
      </div>

      {/* Slide Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 32px', overflow: 'hidden' }}>
        <div style={{
          flex: 1, background: 'var(--clay-surface)', borderRadius: 'var(--clay-radius-lg)',
          boxShadow: 'var(--clay-shadow-elevated)', padding: '32px 40px', overflow: 'hidden',
          border: '1px solid var(--clay-border)'
        }} className="fade-up">
          {slideDeckElements[slide]}
        </div>

        {/* Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, flexShrink: 0 }}>
          <button
            className="btn btn-default btn-icon"
            onClick={() => setSlide(s => Math.max(s - 1, 0))}
            disabled={slide === 0}
            style={{ padding: '6px 14px' }}
          >
            <ChevronLeft size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                style={{
                  width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
                  background: i === slide ? 'var(--clay-purple)' : 'var(--clay-border)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              />
            ))}
          </div>

          <button
            className="btn btn-default btn-icon"
            onClick={() => setSlide(s => Math.min(s + 1, TOTAL - 1))}
            disabled={slide === TOTAL - 1}
            style={{ padding: '6px 14px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
