import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { IntakeBriefing } from "@/lib/cairn-api";
import { ThemeToggle } from "@/components/cairn/ThemeToggle";

type TeamRow = { name: string; role: string };

export function IntakeBriefingForm({
  onConvene,
  loading = false,
}: {
  onConvene: (briefing: IntakeBriefing) => void;
  loading?: boolean;
}) {
  const [idea, setIdea] = useState(
    "Cairn watches a hackathon team's local repo and mentors them in real time — cutting scope, timeboxing the build, and warning them the moment a task goes quiet.",
  );
  const [hours, setHours] = useState("12");
  const [team, setTeam] = useState<TeamRow[]>([
    { name: "Priya", role: "Frontend / demo driver" },
    { name: "Dev", role: "Backend + watcher daemon" },
    { name: "Sam", role: "Pitch & rehearsal" },
  ]);

  const updateRow = (index: number, patch: Partial<TeamRow>) =>
    setTeam((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const removeRow = (index: number) => setTeam((rows) => rows.filter((_, i) => i !== index));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-14">
      <div className="flex items-center gap-3">
        <span className="neu-sm flex size-11 items-center justify-center rounded-xl text-lg">🪨</span>
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.32em] text-brass">Cairn</p>
          <p className="text-sm text-muted-foreground">Autonomous coaching companion</p>
        </div>
        <ThemeToggle className="ml-auto" />
      </div>

      <h1 className="mt-9 text-4xl leading-[1.1] tracking-tight sm:text-5xl">Intake briefing</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Give the council the raw truth — what you think you're building, how long you actually have,
        and who is on the rope. It will argue about the rest.
      </p>

      <form
        className="glass-panel mt-9 rounded-2xl p-6 sm:p-8"
        onSubmit={(event) => {
          event.preventDefault();
          const parsedHours = Number(hours);
          onConvene({
            idea,
            hours: Number.isFinite(parsedHours) && parsedHours > 0 ? Math.min(72, parsedHours) : 12,
            team: team.filter((row) => row.name.trim().length > 0),
          });
        }}
      >
        <label className="block">
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Project idea
          </span>
          <textarea
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            rows={5}
            required
            className="neu-inset focus-brass mt-2 w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Describe the thing you actually intend to demo."
          />
        </label>

        <label className="mt-6 block max-w-[14rem]">
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Time remaining (hours)
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={hours}
            onChange={(event) => {
              // Digits only, clamped to 1–72.
              const digits = event.target.value.replace(/[^0-9]/g, "").slice(0, 2);
              setHours(digits);
            }}
            onBlur={() => {
              const parsed = Number(hours);
              if (!hours || !Number.isFinite(parsed) || parsed < 1) setHours("1");
              else if (parsed > 72) setHours("72");
            }}
            aria-describedby="hours-hint"
            className="neu-inset focus-brass mt-2 w-full rounded-xl px-4 py-3 font-mono text-lg text-brass outline-none"
          />
          <span id="hours-hint" className="mt-1.5 block font-mono text-[0.6rem] text-muted-foreground">
            Whole hours, 1–72
          </span>
        </label>

        <fieldset className="mt-6">
          <legend className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Team members &amp; roles
          </legend>
          <div className="mt-2 space-y-2">
            {team.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  <input
                    value={row.name}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                    placeholder="Name"
                    className="neu-inset focus-brass w-full rounded-xl px-4 py-2.5 text-sm outline-none sm:w-40"
                  />
                  <input
                    value={row.role}
                    onChange={(event) => updateRow(index, { role: event.target.value })}
                    placeholder="Role"
                    className="neu-inset focus-brass w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  aria-label={`Remove ${row.name.trim() || `member ${index + 1}`}`}
                  className="focus-brass flex size-8 shrink-0 items-center justify-center rounded-full border border-hairline text-muted-foreground transition-colors duration-200 hover:border-destructive/50 hover:text-destructive"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTeam((rows) => [...rows, { name: "", role: "" }])}
            className="focus-brass mt-3 inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-brass transition-opacity hover:opacity-70"
          >
            <Plus size={13} /> Add member
          </button>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className="focus-brass mt-8 w-full rounded-xl bg-brass px-6 py-4 font-mono text-[0.78rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          style={{ boxShadow: "var(--shadow-extruded-sm)" }}
        >
          {loading ? "Convening Council…" : "Convene Mentorship Council"}
        </button>
      </form>
    </main>
  );
}
