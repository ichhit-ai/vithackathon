import { useState } from "react";
import { ArrowUp } from "lucide-react";
import type { FeedEntry } from "@/lib/cairn-api";

export function CheckInFeed({
  entries,
  onSubmit,
}: {
  entries: FeedEntry[];
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <section className="glass-panel flex flex-col rounded-2xl p-6">
      <h2 className="text-2xl tracking-tight">Check-ins &amp; watchdog</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything the watcher noticed, and everything you told it.
      </p>

      <ul className="mt-5 max-h-[26rem] space-y-2.5 overflow-y-auto pr-1">
        {entries.map((entry) =>
          entry.kind === "alert" ? (
            <li
              key={entry.id}
              className="rounded-xl border border-alert/35 bg-alert/10 px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-alert">
                  {entry.author}
                </span>
                <span className="font-mono text-[0.66rem] text-muted-foreground">
                  {entry.timestamp}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{entry.body}</p>
            </li>
          ) : (
            <li key={entry.id} className="neu-sm rounded-xl px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-brass">
                  {entry.author}
                </span>
                <span className="font-mono text-[0.66rem] text-muted-foreground">
                  {entry.timestamp}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{entry.body}</p>
            </li>
          ),
        )}
      </ul>

      <form
        className="neu-inset focus-within:ring-1 focus-within:ring-brass/50 mt-4 flex items-center gap-2 rounded-full py-1 pl-4 pr-1 transition-shadow duration-200"
        onSubmit={(event) => {
          event.preventDefault();
          const value = text.trim();
          if (!value) return;
          onSubmit(value);
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Post a status update…"
          aria-label="Status update"
          className="w-full bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Post status update"
          disabled={text.trim().length === 0}
          className="focus-brass flex size-8 shrink-0 items-center justify-center rounded-full bg-brass text-primary-foreground transition-all duration-200 hover:brightness-110 disabled:opacity-40"
        >
          <ArrowUp size={15} strokeWidth={2.5} />
        </button>
      </form>
    </section>
  );
}
