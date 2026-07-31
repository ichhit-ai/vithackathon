import type { Milestone } from "@/lib/cairn-api";

export function MilestoneRoadmap({
  milestones,
  onToggle,
}: {
  milestones: Milestone[];
  onToggle: (id: string) => void;
}) {
  const done = milestones.filter((m) => m.status === "done").length;

  return (
    <section className="glass-panel rounded-2xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl tracking-tight">Milestone roadmap</h2>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
          {done}/{milestones.length} blocks closed
        </p>
      </div>

      <ol className="mt-6 space-y-1">
        {milestones.map((milestone, index) => {
          const isDone = milestone.status === "done";
          const isActive = milestone.status === "active";
          return (
            <li key={milestone.id} className="relative flex gap-4 pb-5">
              {index < milestones.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[13px] top-8 bottom-0 w-px ${isDone ? "bg-sage/50" : "bg-hairline"}`}
                />
              )}
              <button
                onClick={() => onToggle(milestone.id)}
                aria-pressed={isDone}
                aria-label={`Toggle ${milestone.title} complete`}
                className={`focus-brass mt-1 flex size-[27px] shrink-0 items-center justify-center rounded-md transition-colors duration-200 ${
                  isDone
                    ? "bg-sage text-primary-foreground"
                    : isActive
                      ? "neu-inset text-brass"
                      : "neu-inset text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="font-mono text-[0.62rem]">{index + 1}</span>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-brass">
                    {milestone.window}
                  </span>
                  {isActive && (
                    <span className="rounded-full bg-brass/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-brass">
                      In progress
                    </span>
                  )}
                  {isDone && (
                    <span className="rounded-full bg-sage/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sage">
                      Done
                    </span>
                  )}
                  {milestone.status === "pending" && (
                    <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                      Pending
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 text-sm font-medium ${isDone ? "text-muted-foreground line-through" : ""}`}
                >
                  {milestone.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {milestone.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {milestone.assignees.map((person) => (
                    <span
                      key={person}
                      className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[0.6rem] text-muted-foreground"
                    >
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
