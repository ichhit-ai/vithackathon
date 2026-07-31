import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PitchSlide } from "@/lib/cairn-api";

export function PitchOutline({ slides }: { slides: PitchSlide[] }) {
  const [openId, setOpenId] = useState<string | null>(slides[0]?.id ?? null);
  const total = slides.reduce((sum, slide) => sum + slide.minutes, 0);

  return (
    <section className="glass-panel rounded-2xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl tracking-tight">Pitch outline</h2>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
          {total.toFixed(1)} min total
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {slides.map((slide, index) => {
          const isOpen = openId === slide.id;
          return (
            <div key={slide.id} className="neu-sm overflow-hidden rounded-xl">
              <button
                onClick={() => setOpenId(isOpen ? null : slide.id)}
                aria-expanded={isOpen}
                className="focus-brass flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="font-mono text-[0.68rem] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium">{slide.name}</span>
                <span className="ml-auto font-mono text-[0.7rem] text-brass">
                  {slide.minutes.toFixed(1)}m
                </span>
                <ChevronDown
                  aria-hidden="true"
                  size={14}
                  className="text-muted-foreground transition-transform duration-300 ease-out"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              <div
                className="grid transition-all duration-300 ease-out"
                style={{
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <ul className="space-y-2 border-t border-hairline px-4 py-3 pl-11">
                    {slide.beats.map((beat, i) => (
                      <li key={i} className="text-xs leading-relaxed text-muted-foreground">
                        <span className="mr-2 text-brass">—</span>
                        {beat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
