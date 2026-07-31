import type { ProjectPlan } from '../types';
import { SlideDeck } from '../components/slides/SlideDeck';

interface PresentationPageProps {
  plan: ProjectPlan;
  onLaunchWorkspace: () => void;
}

export function PresentationPage({ plan, onLaunchWorkspace }: PresentationPageProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-950 animate-fade-in">
      <SlideDeck plan={plan} onLaunchWorkspace={onLaunchWorkspace} />
    </div>
  );
}
