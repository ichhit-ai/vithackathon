import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CheckInFeed } from "@/components/cairn/CheckInFeed";
import { CommandBar } from "@/components/cairn/CommandBar";
import { IntakeBriefingForm } from "@/components/cairn/IntakeBriefingForm";
import { MilestoneRoadmap } from "@/components/cairn/MilestoneRoadmap";
import { PitchOutline } from "@/components/cairn/PitchOutline";
import { ScopeCritique } from "@/components/cairn/ScopeCritique";
import { WarRoomDrawer } from "@/components/cairn/WarRoomDrawer";
import {
  getCheckInFeed,
  getProjectStatus,
  getPitchOutline,
  getRoadmap,
  getScopeCritique,
  getWarRoomLogs,
  initProject,
  submitCheckIn,
  updateMilestone,
  type IntakeBriefing,
  type ProjectStatus,
  type CritiqueCard,
  type WarRoomLog,
  type PitchSlide,
  type Milestone,
  type FeedEntry,
} from "@/lib/cairn-api";

const title = "Cairn — Hackathon Mission Control & Coaching Companion";
const description =
  "Cairn critiques your scope, builds an hourly roadmap, watches local code activity, and warns your hackathon team the moment a task slips.";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: CairnPage,
});

function CairnPage() {
  const [briefing, setBriefing] = useState<IntakeBriefing | null>(null);
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [critique, setCritique] = useState<CritiqueCard[]>([]);
  const [warRoom, setWarRoom] = useState<WarRoomLog[]>([]);
  const [pitch, setPitch] = useState<PitchSlide[]>([]);
  const [roadmap, setRoadmap] = useState<Milestone[]>([]);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Poll for all dashboard data after briefing is submitted
  const fetchDashboardData = useCallback(async () => {
    try {
      const [st, cr, wr, pi, rm, fe] = await Promise.all([
        getProjectStatus(),
        getScopeCritique(),
        getWarRoomLogs(),
        getPitchOutline(),
        getRoadmap(),
        getCheckInFeed(),
      ]);
      setStatus(st);
      setCritique(cr);
      setWarRoom(wr);
      setPitch(pi);
      setRoadmap(rm);
      setFeed(fe);
    } catch (err) {
      console.error("[cairn] Failed to fetch dashboard data:", err);
    }
  }, []);

  // After briefing is submitted, start polling for data
  useEffect(() => {
    if (!briefing) return;

    // Initial fetch
    fetchDashboardData();

    // Poll for all dashboard data (status, critique, roadmap, pitch, feed) every 3s
    const pollInterval = window.setInterval(() => {
      fetchDashboardData();
    }, 3000);

    return () => {
      window.clearInterval(pollInterval);
    };
  }, [briefing, fetchDashboardData]);

  const handleConvene = async (intake: IntakeBriefing) => {
    setLoading(true);
    try {
      await initProject(intake);
      setBriefing(intake);
    } catch (err) {
      console.error("[cairn] Failed to initialize project:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!briefing) {
    return <IntakeBriefingForm onConvene={handleConvene} loading={loading} />;
  }

  if (!status) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground animate-pulse">
          Convening the council…
        </p>
      </div>
    );
  }

  const toggleMilestone = async (id: string) => {
    const current = roadmap.find((m) => m.id === id);
    if (!current) return;

    const newStatus = current.status === "done" ? "active" : "done";

    // Optimistic update
    setRoadmap((blocks) =>
      blocks.map((block) =>
        block.id === id ? { ...block, status: newStatus } : block,
      ),
    );

    try {
      await updateMilestone(id, newStatus);
      // Refresh status for readiness recalculation
      const st = await getProjectStatus();
      setStatus(st);
    } catch (err) {
      console.error("[cairn] Failed to update milestone:", err);
      // Revert optimistic update
      setRoadmap((blocks) =>
        blocks.map((block) =>
          block.id === id ? { ...block, status: current.status } : block,
        ),
      );
    }
  };

  const handleCheckIn = async (text: string) => {
    try {
      const entry = await submitCheckIn(text);
      setFeed((entries) => [...entries, entry]);
    } catch (err) {
      console.error("[cairn] Failed to submit check-in:", err);
    }
  };

  return (
    <div className="min-h-screen pb-72">
      <CommandBar
        readiness={status.readiness}
        secondsRemaining={briefing.hours * 3600}
        watcherActive={status.watcherActive}
        lastActivityLabel={`Watcher ${status.watcherActive ? "active" : "idle"} — ${status.lastActivityLabel}`}
        onReset={() => setBriefing(null)}
      />

      <main className="mx-auto w-full max-w-7xl px-5 py-8">
        <div className="glass-panel rounded-2xl px-6 py-5">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.22em] text-brass">
            Briefing under review
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {briefing.idea}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {briefing.team.map((member) => (
              <span
                key={member.name}
                className="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[0.62rem] text-muted-foreground"
              >
                {member.name} · {member.role}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <ScopeCritique cards={critique} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <MilestoneRoadmap milestones={roadmap} onToggle={toggleMilestone} />
          <div className="grid gap-6">
            <PitchOutline slides={pitch} />
            <CheckInFeed entries={feed} onSubmit={handleCheckIn} />
          </div>
        </div>
      </main>

      <WarRoomDrawer initialLogs={warRoom} />
    </div>
  );
}
