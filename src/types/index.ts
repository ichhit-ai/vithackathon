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

export interface ProjectPlan {
  id: string;
  tier: PlanTier;
  title: string;
  summary: string;
  estimatedHours: number;
  techStack: string[];
  milestones: GeminiMilestone[];
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
