import type { ProjectPlan } from '../../types';
import { Terminal, Presentation, LayoutGrid, Users, Code, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentTab: 'planner' | 'presentation' | 'workspace' | 'gallery' | 'educator';
  onNavigate: (tab: 'planner' | 'presentation' | 'workspace' | 'gallery' | 'educator') => void;
  activePlan?: ProjectPlan;
  activeCheckpointIndex?: number;
}

export function Header({ currentTab, onNavigate, activePlan, activeCheckpointIndex = 0 }: HeaderProps) {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 font-mono font-bold text-sm">
          <Code className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-100 tracking-tight text-sm">DevCoach AI</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono border border-zinc-700">
              Learning Engine
            </span>
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800/80 text-xs">
        <button
          onClick={() => onNavigate('planner')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            currentTab === 'planner'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
          <span>1. Planner</span>
        </button>

        <button
          onClick={() => onNavigate('presentation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            currentTab === 'presentation'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Presentation className="w-3.5 h-3.5 text-blue-400" />
          <span>2. Slide Deck</span>
        </button>

        <button
          onClick={() => onNavigate('workspace')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            currentTab === 'workspace'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>3. Coach Workspace</span>
        </button>

        <div className="w-px h-4 bg-zinc-800 mx-1" />

        <button
          onClick={() => onNavigate('gallery')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            currentTab === 'gallery'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Showcase</span>
        </button>

        <button
          onClick={() => onNavigate('educator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
            currentTab === 'educator'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Educator Hub</span>
        </button>
      </nav>

      {activePlan && (
        <div className="hidden lg:flex items-center gap-3 text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md">
          <span className="text-zinc-400 truncate max-w-[160px]">{activePlan.title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-zinc-300 font-mono">
            CP {activeCheckpointIndex + 1}/{activePlan.milestones.length}
          </span>
        </div>
      )}
    </header>
  );
}
