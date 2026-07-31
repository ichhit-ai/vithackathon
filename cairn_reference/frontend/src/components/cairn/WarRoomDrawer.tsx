import { useEffect, useRef, useState } from "react";
import { AGENTS, connectWarRoomStream, type WarRoomLog } from "@/lib/cairn-api";

const AGENT_COLOR: Record<string, string> = {
  architect: "text-brass-bright",
  slasher: "text-alert",
  pitch: "text-sage",
  master: "text-terminal-foreground",
};

const ROW = "grid grid-cols-[2.75rem_5rem_1fr] sm:grid-cols-[2.75rem_5rem_8rem_1fr]";
const SCROLL_THRESHOLD_PX = 24;

export function WarRoomDrawer({ initialLogs }: { initialLogs: WarRoomLog[] }) {
  const [open, setOpen] = useState(true);
  const [logs, setLogs] = useState(initialLogs);
  const [following, setFollowing] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  useEffect(() => {
    // Connect to SSE stream for live council debate logs
    const lastId = logs[logs.length - 1]?.id;
    const es = connectWarRoomStream(lastId);

    es.addEventListener("log", (event) => {
      try {
        const data: WarRoomLog = JSON.parse(event.data);
        setLogs((current) =>
          current.some((l) => l.id === data.id) ? current : [...current, data],
        );
      } catch (err) {
        console.error("[cairn] Failed to parse SSE log:", err);
      }
    });

    return () => {
      es.close();
    };
  }, [logs]);

  useEffect(() => {
    if (!open || !scrollRef.current) return;
    const el = scrollRef.current;

    if (following) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [logs, open, following]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isAtBottom = distanceFromBottom <= SCROLL_THRESHOLD_PX;

    if (isAtBottom && !following) {
      setFollowing(true);
    } else if (!isAtBottom && following) {
      setFollowing(false);
    }
  };

  const resumeFollowing = () => {
    setFollowing(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  };

  return (
    <section className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-t-md border-x border-t border-brass/30 bg-terminal shadow-[0_-14px_40px_-20px_oklch(0.2178_0_0/45%)]">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="focus-brass flex w-full items-center gap-4 border-b border-brass/20 px-4 py-2.5 text-left"
        >
          <span className="font-display text-lg font-semibold uppercase tracking-tight text-brass-bright">
            War Room
          </span>
          <span className="border border-terminal-foreground/15 px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-terminal-foreground/45">
            {logs.length} lines
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="watcher-dot size-1.5 rounded-full bg-sage" />
            <span className="text-[0.68rem] font-medium uppercase tracking-wider text-sage">
              Council in session
            </span>
          </span>
          <span className="ml-auto font-mono text-[0.68rem] text-terminal-foreground/50">
            {open ? "collapse ▾" : "expand ▴"}
          </span>
        </button>

        <div
          className="grid transition-all duration-300 ease-out"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="relative overflow-hidden">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="max-h-56 overflow-y-auto font-mono"
            >
              {logs.map((log, i) => {
                const agent = AGENTS[log.agent];
                const isMaster = log.agent === "master";
                return (
                  <div
                    key={log.id}
                    className={`${ROW} border-b border-terminal-foreground/[0.07] text-[0.75rem] transition-colors hover:bg-terminal-foreground/[0.03] ${
                      isMaster ? "bg-terminal-foreground/[0.04]" : ""
                    }`}
                  >
                    <div
                      className={`border-r border-terminal-foreground/[0.07] bg-black/20 px-3 py-2 text-right ${
                        isMaster ? "text-sage" : "text-terminal-foreground/25"
                      }`}
                    >
                      {String(i + 1).padStart(3, "0")}
                    </div>
                    <div className="border-r border-terminal-foreground/[0.07] px-3 py-2 text-terminal-foreground/40">
                      {log.timestamp}
                    </div>
                    <div
                      className={`hidden border-r border-terminal-foreground/[0.07] px-3 py-2 font-medium uppercase tracking-tight sm:block ${
                        AGENT_COLOR[log.agent]
                      } ${isMaster ? "italic" : ""}`}
                    >
                      {agent.name}
                    </div>
                    <div className="px-4 py-2 leading-relaxed text-terminal-foreground/85">
                      <span className={`sm:hidden ${AGENT_COLOR[log.agent]}`}>
                        {agent.name}
                        {" · "}
                      </span>
                      {log.message}
                    </div>
                  </div>
                );
              })}

              <div className={`${ROW} text-[0.75rem]`}>
                <div className="border-r border-terminal-foreground/[0.07] bg-black/30 px-3 py-2 text-right text-terminal-foreground/25">
                  {String(logs.length + 1).padStart(3, "0")}
                </div>
                <div className="border-r border-terminal-foreground/[0.07] px-3 py-2 text-terminal-foreground/25">
                  live
                </div>
                <div className="hidden border-r border-terminal-foreground/[0.07] px-3 py-2 sm:block" />
                <div className="flex items-center px-4 py-2">
                  <span className="inline-block h-4 w-1.5 animate-pulse bg-brass-bright align-middle" />
                </div>
              </div>
            </div>

            {!following && (
              <button
                onClick={resumeFollowing}
                className="focus-brass absolute bottom-10 right-6 z-10 flex items-center gap-2 rounded-full border border-brass/40 bg-terminal/95 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-brass-bright shadow-lg backdrop-blur-sm transition-all hover:bg-brass/10 hover:text-brass"
                aria-label="Resume following new messages"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-brass-bright" />
                Resume following
              </button>
            )}
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-transparent via-brass/25 to-transparent" />
      </div>
    </section>
  );
}

