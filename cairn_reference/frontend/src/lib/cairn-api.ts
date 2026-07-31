/**
 * Cairn API client — replaces cairn-mock.ts with real backend calls.
 *
 * Every function signature and return type matches the original mock
 * layer so the components need zero changes.
 */

const API_BASE = "http://localhost:8000";

// ---------- Types (unchanged from cairn-mock.ts) ----------

export type ProjectStatus = {
  secondsRemaining: number;
  readiness: number;
  watcherActive: boolean;
  lastActivityLabel: string;
};

export type AgentId = "architect" | "slasher" | "pitch" | "master";

export type WarRoomLog = {
  id: string;
  agent: AgentId;
  timestamp: string;
  message: string;
};

export type CritiqueBucket = "keep" | "cut" | "pivot";

export type CritiqueCard = {
  id: string;
  bucket: CritiqueBucket;
  title: string;
  rationale: string;
};

export type MilestoneStatus = "done" | "active" | "pending";

export type Milestone = {
  id: string;
  window: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  assignees: string[];
};

export type PitchSlide = {
  id: string;
  name: string;
  minutes: number;
  beats: string[];
};

export type FeedEntry = {
  id: string;
  kind: "update" | "alert";
  author: string;
  timestamp: string;
  body: string;
};

export type IntakeBriefing = {
  idea: string;
  hours: number;
  team: { name: string; role: string }[];
};

// ---------- Agent display metadata (client-side only) ----------

export const AGENTS: Record<AgentId, { icon: string; name: string }> = {
  architect: { icon: "🛠️", name: "Architect" },
  slasher: { icon: "✂️", name: "Scope Slasher" },
  pitch: { icon: "🎙️", name: "Pitch Coach" },
  master: { icon: "🪨", name: "Cairn Master" },
};

// ---------- API Functions ----------

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!resp.ok) {
    throw new Error(`API ${resp.status}: ${resp.statusText}`);
  }
  // 204 No Content
  if (resp.status === 204) return undefined as T;
  return resp.json();
}

/**
 * Initialize a new project and trigger the council debate.
 * Returns the projectId and councilStatus.
 */
export async function initProject(
  briefing: IntakeBriefing,
): Promise<{ projectId: string; councilStatus: string }> {
  return apiFetch("/api/project/init", {
    method: "POST",
    body: JSON.stringify(briefing),
  });
}

/** Fetch live project status (countdown, readiness, watcher state). */
export async function getProjectStatus(): Promise<ProjectStatus> {
  return apiFetch("/api/project/status");
}

/** Fetch all war room logs. */
export async function getWarRoomLogs(): Promise<WarRoomLog[]> {
  return apiFetch("/api/warroom/logs");
}

/**
 * Subscribe to war room SSE stream.
 * Returns an EventSource — the caller should listen for "log" events.
 */
export function connectWarRoomStream(afterId?: string): EventSource {
  const params = afterId ? `?after=${encodeURIComponent(afterId)}` : "";
  return new EventSource(`${API_BASE}/api/warroom/stream${params}`);
}

/** Fetch scope critique cards. */
export async function getScopeCritique(): Promise<CritiqueCard[]> {
  return apiFetch("/api/critique");
}

/** Fetch the milestone roadmap. */
export async function getRoadmap(): Promise<Milestone[]> {
  return apiFetch("/api/roadmap");
}

/** Toggle a milestone's status. */
export async function updateMilestone(
  id: string,
  status: MilestoneStatus,
): Promise<Milestone> {
  return apiFetch(`/api/roadmap/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/** Fetch the pitch outline slides. */
export async function getPitchOutline(): Promise<PitchSlide[]> {
  return apiFetch("/api/pitch");
}

/** Fetch the check-in/alert feed. */
export async function getCheckInFeed(): Promise<FeedEntry[]> {
  return apiFetch("/api/feed");
}

/** Post a new check-in update. */
export async function submitCheckIn(text: string): Promise<FeedEntry> {
  return apiFetch("/api/feed", {
    method: "POST",
    body: JSON.stringify({ body: text }),
  });
}
