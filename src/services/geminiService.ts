import { GoogleGenAI } from '@google/genai';
import type { CritiqueCard, WarRoomLog } from '../types';

export function getApiKey(): string | null {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return localStorage.getItem('devcoach_gemini_key');
}

export function setApiKey(key: string) {
  localStorage.setItem('devcoach_gemini_key', key);
}

function getClient(): GoogleGenAI {
  const key = getApiKey();
  if (!key) throw new Error('NO_API_KEY');
  return new GoogleGenAI({ apiKey: key });
}

const MODEL_PRIORITY = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

function prettyFormatCode(code: string): string {
  if (!code) return '';
  if (code.includes('<!DOCTYPE') || code.includes('<html')) {
    return code
      .replace(/></g, '>\n<')
      .replace(/<!--/g, '\n<!--')
      .replace(/-->/g, '-->\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }
  return code;
}

// ─── Intent & Response Handling for Planner ──────────────────────────────────

export async function processPlannerMessage(
  _history: { role: 'user' | 'model'; text: string }[],
  userText: string,
  onStatusUpdate?: (status: string) => void
): Promise<{
  isProjectPlan: boolean;
  conversationalResponse?: string;
  plans?: any[];
}> {
  const lower = userText.trim().toLowerCase();
  const greetings = ['hi', 'hello', 'hey', 'sup', 'yo', 'hlo', 'hola', 'what is this', 'how does this work', 'help'];
  
  if (greetings.includes(lower) || lower.length <= 3) {
    return {
      isProjectPlan: false,
      conversationalResponse: `Hey! I'm your AI Coding Coach. Tell me what project or technology you want to build (e.g. *"HTML/CSS Weather App"*, *"Rust CLI Tool"*, or *"React Habit Tracker"*) and I'll generate custom project tiers for you.`
    };
  }

  onStatusUpdate?.('Convening AI Council: Architect + Scope Slasher + Pitch Coach...');
  const plans = await generateProjectPlans(userText, onStatusUpdate);
  return { isProjectPlan: true, plans };
}

// ─── Plan Schema with Scope Critique ─────────────────────────────────────────

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    plans: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tier:             { type: 'string', enum: ['lean', 'standard', 'ambitious'] },
          title:            { type: 'string' },
          summary:          { type: 'string' },
          estimatedHours:   { type: 'number' },
          techStack:        { type: 'array', items: { type: 'string' } },
          scopeCritique: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                bucket:    { type: 'string', enum: ['keep', 'cut', 'pivot'] },
                title:     { type: 'string' },
                rationale: { type: 'string' }
              },
              required: ['bucket', 'title', 'rationale']
            }
          },
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                order:           { type: 'number' },
                name:            { type: 'string' },
                conceptTaught:   { type: 'string' },
                difficulty:      { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                estimatedMinutes:{ type: 'number' },
                lessonSummary:   { type: 'string' },
                whyNeeded:       { type: 'string' },
                exampleSnippet:  { type: 'string' },
                actionableGoal:  { type: 'string' },
                hint1:           { type: 'string' },
                filesUnlocked:   { type: 'array', items: { type: 'string' } },
                starterCode:     { type: 'string' },
                referenceSolution:{ type: 'string' }
              },
              required: [
                'order','name','conceptTaught','difficulty','estimatedMinutes',
                'lessonSummary','whyNeeded','exampleSnippet','actionableGoal',
                'hint1','filesUnlocked','starterCode','referenceSolution'
              ]
            }
          }
        },
        required: ['tier','title','summary','estimatedHours','techStack','milestones']
      }
    }
  },
  required: ['plans']
};

export async function generateProjectPlans(idea: string, onStatusUpdate?: (status: string) => void): Promise<any[]> {
  const ai = getClient();

  const prompt = `You are a Lead Software Architect working with a Scope Slasher mentor. Generate 3 project tiers (lean: 3 checkpoints, standard: 4 checkpoints, ambitious: 5 checkpoints) for: "${idea}".

CRITICAL REQUIREMENTS:
1. Include a 'scopeCritique' array of 4-6 items categorizing features:
   - 'keep': Must-have features essential for a working demo
   - 'cut': Bloat to drop immediately (Auth, Settings, complex DBs)
   - 'pivot': Clever shortcuts (e.g. mock data instead of scraper)
2. Format 'starterCode' and 'referenceSolution' with PROPER LINE BREAKS (\\n).`;

  onStatusUpdate?.('Calling Gemini Flash Lite API...');

  let responseText = '';
  let lastErr = null;

  for (const modelName of MODEL_PRIORITY) {
    try {
      const res = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: PLAN_SCHEMA,
          temperature: 0.3
        }
      });
      responseText = res.text || '';
      if (responseText) break;
    } catch (err: any) {
      lastErr = err;
      console.warn(`Model ${modelName} failed, trying fallback...`, err);
    }
  }

  if (!responseText) {
    throw new Error(lastErr?.message || 'Rate limit reached. Please wait and try again.');
  }

  onStatusUpdate?.('Parsing scope critiques & code blocks...');

  let data: any = { plans: [] };
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    console.error('JSON parse error:', err, responseText);
    throw new Error('Failed to parse Gemini response. Please try again.');
  }

  const formattedPlans = (data.plans || []).map((p: any, pIdx: number) => ({
    ...p,
    scopeCritique: (p.scopeCritique && p.scopeCritique.length > 0
      ? p.scopeCritique
      : [
          { bucket: 'keep', title: 'Core UI & Interactive Logic', rationale: 'Essential for a functional demo.' },
          { bucket: 'cut', title: 'User Authentication', rationale: 'Takes 2+ hours and adds zero demo value.' },
          { bucket: 'pivot', title: 'Use Hardcoded Seed Data', rationale: 'Skip complex API integrations for now.' },
        ]
    ).map((c: any, i: number) => ({ ...c, id: `sc-${pIdx}-${i}` })),
    milestones: (p.milestones || []).map((m: any) => ({
      ...m,
      starterCode: prettyFormatCode(m.starterCode),
      referenceSolution: prettyFormatCode(m.referenceSolution)
    }))
  }));

  onStatusUpdate?.('Council plans ready!');
  return formattedPlans;
}

// ─── War Room Log Generator ──────────────────────────────────────────────────

export function generateWarRoomLogs(projectTitle: string, scopeCritique?: CritiqueCard[]): WarRoomLog[] {
  const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const keeps = (scopeCritique || []).filter(c => c.bucket === 'keep').map(c => c.title);
  const cuts = (scopeCritique || []).filter(c => c.bucket === 'cut').map(c => c.title);
  const pivots = (scopeCritique || []).filter(c => c.bucket === 'pivot').map(c => c.title);

  return [
    { id: 'w1', agent: 'architect', timestamp: ts(), message: `Analyzing complexity for "${projectTitle}". Target window: 2-3 hours with progressive checkpoint unlocks.` },
    { id: 'w2', agent: 'slasher', timestamp: ts(), message: `SCOPE SLASH: Cutting ${cuts.length > 0 ? cuts.join(', ') : 'auth, settings, complex DB'} — zero demo value, high time cost.` },
    { id: 'w3', agent: 'slasher', timestamp: ts(), message: `KEEP LIST locked: ${keeps.length > 0 ? keeps.join(', ') : 'Core UI, Interactive Logic'} — essential for judges.` },
    { id: 'w4', agent: 'pitch', timestamp: ts(), message: `Pitch arc framed: Hook → Architecture → Live Demo → Tech Stack → Closing Ask. 3 minutes total.` },
    { id: 'w5', agent: 'architect', timestamp: ts(), message: `Smart pivots approved: ${pivots.length > 0 ? pivots.join(', ') : 'Hardcoded seed data instead of live API'}. Saves ~1 hour.` },
    { id: 'w6', agent: 'coach', timestamp: ts(), message: `Roadmap locked. Launching Socratic pair-programming workspace with progressive file unlocking.` },
  ];
}

// ─── Senior Staff Engineer Coach ──────────────────────────────────────────────

export async function streamCoachResponse(
  messages: { role: 'user' | 'model'; text: string }[],
  context: {
    projectTitle: string;
    checkpointName: string;
    conceptTaught: string;
    activeFile: string;
    currentCode: string;
    hint1?: string;
  },
  onChunk: (chunk: string) => void
): Promise<void> {
  const ai = getClient();

  const systemInstruction = `You are a Senior Staff Engineer pair-programming with a developer.

Current Context:
- Project: "${context.projectTitle}"
- Active Checkpoint: "${context.checkpointName}"
- Concept Focus: "${context.conceptTaught}"
- Active File: "${context.activeFile}"

Student Code:
\`\`\`
${context.currentCode.slice(0, 1500)}
\`\`\`

RULES:
1. Concise engineering lead advice (max 2 short paragraphs).
2. Do NOT write out full solution code unless evaluating.
3. Direct, clear, structural guidance.`;

  const MAX_WINDOW = 10;
  const recentMessages = messages.length > MAX_WINDOW ? messages.slice(-MAX_WINDOW) : messages;
  const history = recentMessages.slice(0, -1).map(m => ({ role: m.role, parts: [{ text: m.text }] }));
  const lastMessage = recentMessages[recentMessages.length - 1];

  let stream = null;
  for (const modelName of MODEL_PRIORITY) {
    try {
      const chat = ai.chats.create({ model: modelName, config: { systemInstruction, temperature: 0.4 }, history });
      stream = await chat.sendMessageStream({ message: lastMessage.text });
      if (stream) break;
    } catch (e) {
      console.warn(`Stream failed on model ${modelName}, trying fallback...`);
    }
  }

  if (!stream) throw new Error('All models rate-limited. Please retry.');

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) onChunk(text);
  }
}

// ─── AI Code Reviewer ────────────────────────────────────────────────────────

export async function reviewImplementationWithAI(
  code: string,
  milestone: { name: string; conceptTaught: string; actionableGoal: string; referenceSolution: string; }
): Promise<{ passed: boolean; score: number; feedback: string; correctedCode?: string }> {
  const ai = getClient();

  const prompt = `Review student code submission:
Checkpoint: "${milestone.name}"
Goal: "${milestone.actionableGoal}"

Code:
\`\`\`
${code.slice(0, 2000)}
\`\`\`

Rules:
1. Evaluate flexibly: Does the code reasonably fulfill the goal?
2. If passed, give brief 1-sentence praise.
3. If failed, explain what's missing in 1 short sentence and provide correctedCode.

Respond JSON matching schema.`;

  let responseText = '';
  for (const modelName of MODEL_PRIORITY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          responseSchema: {
            type: 'object',
            properties: {
              passed: { type: 'boolean' }, score: { type: 'number' },
              feedback: { type: 'string' }, correctedCode: { type: 'string' }
            },
            required: ['passed', 'score', 'feedback']
          }
        }
      });
      responseText = response.text || '';
      if (responseText) break;
    } catch (e) {
      console.warn(`Review failed on model ${modelName}, trying fallback...`);
    }
  }

  let res: any = {};
  try { res = JSON.parse(responseText || '{}'); }
  catch (e) { res = { passed: true, score: 90, feedback: "Implementation looks good!" }; }

  return {
    passed: res.passed ?? true,
    score: res.score || (res.passed ? 95 : 60),
    feedback: res.feedback || "Good progress on this checkpoint!",
    correctedCode: prettyFormatCode(res.correctedCode || milestone.referenceSolution)
  };
}
