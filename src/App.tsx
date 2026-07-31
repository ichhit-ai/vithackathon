import { useState } from 'react';
import type { ProjectPlan } from './types';
import { PlannerChat } from './pages/PlannerChat';
import { SlideDeck } from './components/slides/SlideDeck';
import { WorkspacePage } from './pages/WorkspacePage';
import { GalleryPage } from './pages/GalleryPage';
import { EducatorPage } from './pages/EducatorPage';
import { ApiKeyModal } from './components/ApiKeyModal';
import { getApiKey } from './services/geminiService';
import { Code2, MessageSquare, Presentation, Terminal, Library, GraduationCap, Key } from 'lucide-react';

type Tab = 'planner' | 'slides' | 'workspace' | 'gallery' | 'educator';

export default function App() {
  const [tab, setTab] = useState<Tab>('planner');
  const [activePlan, setActivePlan] = useState<ProjectPlan | null>(null);
  const [showApiModal, setShowApiModal] = useState(!getApiKey());

  const navItems: { id: Tab; label: string; icon: React.ReactNode; requiresPlan?: boolean }[] = [
    { id: 'planner',   label: 'Chat',        icon: <MessageSquare size={14} /> },
    { id: 'slides',    label: 'Slides (PPT)',icon: <Presentation size={14} />, requiresPlan: true },
    { id: 'workspace', label: 'Workspace',   icon: <Terminal size={14} />,    requiresPlan: true },
    { id: 'gallery',   label: 'Gallery',     icon: <Library size={14} /> },
    { id: 'educator',  label: 'Educator',    icon: <GraduationCap size={14} /> },
  ];

  const handlePlanSelected = (plan: ProjectPlan) => {
    setActivePlan(plan);
  };

  const handleLaunchWorkspace = () => {
    if (activePlan) setTab('workspace');
  };

  const handleViewSlides = () => {
    if (activePlan) setTab('slides');
  };

  return (
    <>
      {showApiModal && (
        <ApiKeyModal onSaved={() => setShowApiModal(false)} />
      )}

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Code2 size={14} color="#fff" />
            </div>
            <div>
              <div className="logo-text">DevCoach</div>
              <div className="logo-sub">AI Learning</div>
            </div>
          </div>

          <nav className="nav">
            {navItems.map(item => {
              const disabled = item.requiresPlan && !activePlan;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (disabled) return;
                    setTab(item.id);
                  }}
                  className={`nav-item ${tab === item.id ? 'active' : ''}`}
                  style={{ opacity: disabled ? 0.35 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                  title={disabled ? 'Select a plan in Chat first' : undefined}
                >
                  <span style={{ color: tab === item.id ? 'var(--text-2)' : 'var(--text-3)', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-bottom">
            {activePlan ? (
              <div className="plan-card">
                <div className="plan-card-label">Active Plan</div>
                <div className="plan-card-title">{activePlan.title}</div>
                <div className="plan-card-meta">
                  <span className="tag tag-green">{activePlan.tier}</span>
                  <span className="tag">{activePlan.milestones.length} CP</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--text-3)', padding: '4px 2px' }}>
                No plan selected yet
              </div>
            )}

            <button
              className="btn btn-ghost"
              style={{ fontSize: 11, justifyContent: 'flex-start', gap: 7, padding: '5px 4px' }}
              onClick={() => setShowApiModal(true)}
            >
              <Key size={11} />
              API Key
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main">
          {tab === 'planner' && (
            <PlannerChat
              onPlanSelected={handlePlanSelected}
              onLaunchWorkspace={handleLaunchWorkspace}
              onViewSlides={handleViewSlides}
            />
          )}

          {tab === 'slides' && activePlan && (
            <SlideDeck
              plan={activePlan}
              onLaunchWorkspace={handleLaunchWorkspace}
            />
          )}

          {tab === 'workspace' && activePlan && (
            <WorkspacePage plan={activePlan} />
          )}

          {(tab === 'workspace' || tab === 'slides') && !activePlan && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-3)', fontSize: 13 }}>
              Select a plan in Chat first to unlock Slides & Workspace
            </div>
          )}

          {tab === 'gallery' && <GalleryPage />}
          {tab === 'educator' && <EducatorPage />}
        </main>
      </div>
    </>
  );
}
