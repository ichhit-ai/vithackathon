import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/cairn/ThemeToggle";

function ReadinessGauge({ value }: { value: number }) {
  // Semi-circular dial: -90deg at 0%, +90deg at 100%.
  const angle = -90 + (Math.min(100, Math.max(0, value)) / 100) * 180;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[34px] w-[68px]">
        <svg viewBox="0 0 104 56" className="absolute inset-0 h-full w-full">
          <path
            d="M8 52 A44 44 0 0 1 96 52"
            fill="none"
            stroke="var(--trench)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M8 52 A44 44 0 0 1 96 52"
            fill="none"
            stroke="var(--sage)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="138.2"
            strokeDashoffset={138.2 - (138.2 * value) / 100}
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
          />
          {[0, 25, 50, 75, 100].map((tick) => {
            const rad = ((-180 + (tick / 100) * 180) * Math.PI) / 180;
            return (
              <line
                key={tick}
                x1={52 + Math.cos(rad) * 34}
                y1={52 + Math.sin(rad) * 34}
                x2={52 + Math.cos(rad) * 29}
                y2={52 + Math.sin(rad) * 29}
                stroke="var(--hairline)"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
        <div
          className="absolute bottom-[2px] left-1/2 h-[24px] w-[2px] origin-bottom rounded-full bg-brass"
          style={{
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)",
          }}
          aria-hidden="true"
        />
        <div className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-brass" />
      </div>
      <div className="leading-tight">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
          Readiness
        </p>
        <p className="font-mono text-base leading-tight text-brass tabular-nums">{value}%</p>
      </div>
    </div>
  );
}

function formatCountdown(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

function Divider() {
  return <span aria-hidden="true" className="hidden h-8 w-px bg-hairline sm:block" />;
}

export function CommandBar({
  readiness,
  secondsRemaining,
  watcherActive,
  lastActivityLabel,
  onReset,
}: {
  readiness: number;
  secondsRemaining: number;
  watcherActive: boolean;
  lastActivityLabel: string;
  onReset?: () => void;
}) {
  const [seconds, setSeconds] = useState(secondsRemaining);

  useEffect(() => setSeconds(secondsRemaining), [secondsRemaining]);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 px-3 pt-3">
      <div className="glass-panel mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="neu-sm flex size-9 items-center justify-center rounded-lg text-sm">
            🪨
          </span>
          <div className="leading-tight">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-brass">Cairn</p>
            <p className="text-[0.7rem] text-muted-foreground">Mission control</p>
          </div>
        </div>

        <Divider />

        <div className="leading-tight">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
            Time remaining
          </p>
          <p className="font-mono text-base leading-tight tabular-nums">
            {formatCountdown(seconds)}
          </p>
        </div>

        <Divider />

        <ReadinessGauge value={readiness} />

        <Divider />

        <div className="flex items-center gap-2.5">
          <span
            className={`size-2 shrink-0 rounded-full ${watcherActive ? "watcher-dot bg-sage" : "bg-muted-foreground"}`}
          />
          <div className="leading-tight">
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-sage">
              Watcher: {watcherActive ? "Active" : "Idle"}
            </p>
            <p className="font-mono text-[0.64rem] text-muted-foreground">{lastActivityLabel}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {onReset && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to return to the Intake Briefing? Your active dashboard state will be reset.",
                  )
                ) {
                  onReset();
                }
              }}
              className="focus-brass rounded-lg border border-hairline px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground transition-colors hover:border-brass hover:text-brass"
              title="Return to Intake Briefing"
            >
              New Briefing
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
