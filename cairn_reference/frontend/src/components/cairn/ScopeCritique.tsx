import type { CritiqueBucket, CritiqueCard } from "@/lib/cairn-api";

const BUCKETS: {
  id: CritiqueBucket;
  label: string;
  tag: string;
  dot: string;
  italic?: boolean;
  rule?: string;
}[] = [
  { id: "keep", label: "Keep / Must Have", tag: "text-sage", dot: "bg-sage" },
  { id: "cut", label: "Cut Immediately", tag: "text-destructive", dot: "bg-destructive" },
  {
    id: "pivot",
    label: "Smart Pivot",
    tag: "text-alert",
    dot: "bg-alert",
    italic: true,
    rule: "border-l border-alert/25 pl-6",
  },
];

export function ScopeCritique({ cards }: { cards: CritiqueCard[] }) {
  const ordered = BUCKETS.map((bucket) => ({
    bucket,
    items: cards.filter((card) => card.bucket === bucket.id),
  }));

  let counter = 0;

  return (
    <section className="glass-panel relative overflow-hidden rounded-2xl">
      <div className="h-1 w-full bg-brass/40" />

      <div className="p-8 md:p-12">
        <header className="border-b border-border/60 pb-8">
          <h2 className="text-3xl font-light tracking-tight md:text-4xl">Scope critique</h2>
          <p className="mt-2 text-base text-muted-foreground">
            The council's ruling on what survives the night.
          </p>
        </header>

        <div className="grid grid-cols-1 pt-10 lg:grid-cols-3">
          {ordered.map(({ bucket, items }, columnIndex) => (
            <section
              key={bucket.id}
              className={[
                "mt-12 lg:mt-0",
                columnIndex === 0 ? "lg:border-r lg:border-border/60 lg:pr-10" : "",
                columnIndex === 1 ? "lg:border-r lg:border-border/60 lg:px-10" : "",
                columnIndex === 2 ? "lg:pl-10" : "",
                "first:mt-0",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <span className={`size-2 rounded-full ${bucket.dot}`} />
                <h3
                  className={`font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] ${bucket.tag}`}
                >
                  {bucket.label}
                </h3>
              </div>

              <div className="mt-8 space-y-10">
                {items.map((card) => {
                  counter += 1;
                  const index = String(counter).padStart(2, "0");
                  return (
                    <article
                      key={card.id}
                      className={[
                        "group transition-opacity duration-200",
                        bucket.id === "cut" ? "opacity-80 hover:opacity-100" : "",
                        bucket.italic ? "italic" : "",
                        bucket.rule ?? "",
                      ].join(" ")}
                    >
                      <span
                        className={`block font-display text-3xl leading-none ${
                          bucket.id === "pivot" ? "text-alert/45" : "text-brass/35"
                        }`}
                      >
                        {index}
                      </span>
                      <h4 className="mt-2 text-lg font-medium leading-snug text-foreground">
                        {card.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {card.rationale}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 p-6 opacity-30">
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.3em] text-brass">
          Cairn Council Ref: CR-2026-X
        </span>
      </div>
    </section>
  );
}
