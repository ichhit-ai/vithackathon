import type { ProjectPlan } from '../../types';
import { Clock, Edit3, ArrowRight } from 'lucide-react';

interface PlanCardProps {
  plan: ProjectPlan;
  isSelected: boolean;
  onSelect: (plan: ProjectPlan) => void;
  onEdit: (plan: ProjectPlan) => void;
}

export function PlanCard({ plan, isSelected, onSelect, onEdit }: PlanCardProps) {
  const isLean = plan.tier === 'lean';
  const isStandard = plan.tier === 'standard';
  
  const tierColor = isLean
    ? 'text-zinc-400 border-zinc-700 bg-zinc-900/60'
    : isStandard
    ? 'text-emerald-400 border-emerald-800/40 bg-emerald-950/20'
    : 'text-amber-400 border-amber-800/40 bg-amber-950/20';

  const tierBadge = isLean
    ? 'LEAN (4-6 Checkpoints)'
    : isStandard
    ? 'RECOMMENDED • STANDARD (8-12 Checkpoints)'
    : 'AMBITIOUS PORTFOLIO (12+ Checkpoints)';

  return (
    <div
      className={`rounded-xl border p-6 flex flex-col justify-between transition-all duration-200 ${
        isSelected
          ? 'border-emerald-500/80 bg-zinc-900 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${tierColor}`}>
            {tierBadge}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>~{plan.estimatedHours} hrs</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-zinc-100 tracking-tight mb-2">{plan.title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-6">{plan.summary}</p>

        <div className="mb-6">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-2">Tech Stack</span>
          <div className="flex flex-wrap gap-1.5">
            {plan.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2 mb-6 border-t border-zinc-800/80 pt-4">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
            Checkpoints ({plan.milestones.length})
          </span>
          {plan.milestones.slice(0, 4).map((m, idx) => (
            <div key={m.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-zinc-950/60 border border-zinc-800/40">
              <span className="text-zinc-300 font-medium truncate max-w-[200px]">
                {idx + 1}. {m.name}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{m.difficulty}</span>
            </div>
          ))}
          {plan.milestones.length > 4 && (
            <span className="text-[10px] text-zinc-500 italic block text-center pt-1">
              + {plan.milestones.length - 4} more checkpoints...
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
        <button
          onClick={() => onSelect(plan)}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            isSelected
              ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold'
              : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700'
          }`}
        >
          <span>{isSelected ? 'Plan Selected' : 'Select Plan'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onEdit(plan)}
          title="Customize plan milestones and stack"
          className="p-2.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 border border-zinc-700 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
