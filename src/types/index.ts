export type PlanTier = 'lean' | 'standard' | 'ambitious';

export interface GeminiMilestone {
  order: number;
  name: string;
  conceptTaught: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  lessonSummary: string;
  whyNeeded: string;
  exampleSnippet: string;
  actionableGoal: string;
  hint1: string;
  hint2?: string;
  filesUnlocked: string[];
  staticPattern?: string;       // optional — old rigid checker removed
  starterCode?: string;         // generated client-side
  referenceSolution: string;
}

// ─── Cairn Integration Types ─────────────────────────────────────────────────

export type CritiqueBucket = 'keep' | 'cut' | 'pivot';

export interface CritiqueCard {
  id: string;
  bucket: CritiqueBucket;
  title: string;
  rationale: string;
}

export type WarRoomAgent = 'architect' | 'slasher' | 'pitch' | 'coach';

export interface WarRoomLog {
  id: string;
  agent: WarRoomAgent;
  timestamp: string;
  message: string;
}

export interface PitchSlideBeat {
  slideNumber: number;
  name: string;
  minutes: number;
  talkingPoints: string[];
}

export interface CheckInFeedEntry {
  id: string;
  kind: 'update' | 'alert';
  author: string;
  timestamp: string;
  body: string;
}

// ─── Core Plan & Chat Types ──────────────────────────────────────────────────

export interface ProjectPlan {
  id: string;
  tier: PlanTier;
  title: string;
  summary: string;
  estimatedHours: number;
  techStack: string[];
  milestones: GeminiMilestone[];
  scopeCritique?: CritiqueCard[];
  pitchOutline?: PitchSlideBeat[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isGuardrail?: boolean;
  isLoading?: boolean;
  plans?: ProjectPlan[];
  judgeResult?: JudgeResult;
  timestamp: string;
}

export interface JudgeResult {
  passed: boolean;
  score: number;
  feedback: string;
  staticPassed?: boolean;
  attemptNumber?: number;
}

export interface ShowcaseProject {
  id: string;
  studentName: string;
  avatar: string;
  title: string;
  tier: PlanTier;
  techStack: string[];
  checkpointsCompleted: number;
  totalCheckpoints: number;
  completionTimeHours: number;
  likes: number;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
}
