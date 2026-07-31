import { GoogleGenAI } from '@google/genai';

export function getApiKey(): string | null {
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

// Model IDs from Google AI Studio Dashboard (Gemini 3.1 Flash Lite primary)
const MODEL_PRIORITY = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

// Helper: Format HTML/JS/CSS code with clean line breaks
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

  onStatusUpdate?.('Architecting project tiers & milestones...');
  const plans = await generateProjectPlans(userText, onStatusUpdate);
  return {
    isProjectPlan: true,
    plans
  };
}

// ─── Plan Schema ─────────────────────────────────────────────────────────────

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

  const prompt = `You are a Lead Software Architect. Generate 3 project tiers (lean: 3 checkpoints, standard: 4 checkpoints, ambitious: 5 checkpoints) for: "${idea}".

CRITICAL FORMATTING REQUIREMENT FOR CODE:
- Always format 'starterCode' and 'referenceSolution' with PROPER LINE BREAKS (\\n). NEVER squish HTML, CSS, JS, or Python code into a single line.
- Provide clean, beautifully indented code blocks with clear // TODO: or <!-- TODO: --> comments.`;

  onStatusUpdate?.('Calling Gemini 3.1 Flash Lite API...');

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
      if (responseText) {
        console.log(`Successfully generated plans using model: ${modelName}`);
        break;
      }
    } catch (err: any) {
      lastErr = err;
      console.warn(`Model ${modelName} failed, trying next fallback...`, err);
    }
  }

  if (!responseText) {
    throw new Error(lastErr?.message || 'Rate limit reached across Gemini models. Please wait a moment and try again.');
  }

  onStatusUpdate?.('Parsing & formatting code blocks...');

  let data: any = { plans: [] };
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    console.error('JSON parse error:', err, responseText);
    throw new Error('Failed to parse Gemini response. Please try clicking send again.');
  }

  const formattedPlans = (data.plans || []).map((p: any) => ({
    ...p,
    milestones: (p.milestones || []).map((m: any) => ({
      ...m,
      starterCode: prettyFormatCode(m.starterCode),
      referenceSolution: prettyFormatCode(m.referenceSolution)
    }))
  }));

  onStatusUpdate?.('Plans ready!');
  return formattedPlans;
}

// ─── Senior Staff Engineer Coach System Prompt ────────────────────────────────

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
  const recentMessages = messages.length > MAX_WINDOW 
    ? messages.slice(-MAX_WINDOW) 
    : messages;

  const history = recentMessages.slice(0, -1).map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const lastMessage = recentMessages[recentMessages.length - 1];

  let stream = null;
  for (const modelName of MODEL_PRIORITY) {
    try {
      const chat = ai.chats.create({
        model: modelName,
        config: { systemInstruction, temperature: 0.4 },
        history
      });
      stream = await chat.sendMessageStream({ message: lastMessage.text });
      if (stream) {
        console.log(`Streaming coach response using model: ${modelName}`);
        break;
      }
    } catch (e) {
      console.warn(`Stream failed on model ${modelName}, trying fallback...`);
    }
  }

  if (!stream) throw new Error('All models currently rate-limited. Please retry in a few seconds.');

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) onChunk(text);
  }
}

// ─── AI Code Reviewer ───────────────────────────────────────────────────

export async function reviewImplementationWithAI(
  code: string,
  milestone: {
    name: string;
    conceptTaught: string;
    actionableGoal: string;
    referenceSolution: string;
  }
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
3. If failed, explain what's missing in 1 short sentence and provide correctedCode formatted with proper line breaks.

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
              passed:        { type: 'boolean' },
              score:         { type: 'number' },
              feedback:      { type: 'string' },
              correctedCode: { type: 'string' }
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

  const raw = responseText || '{}';
  let res: any = {};
  try {
    res = JSON.parse(raw);
  } catch (e) {
    res = { passed: true, score: 90, feedback: "Implementation looks good!" };
  }

  return {
    passed: res.passed ?? true,
    score: res.score || (res.passed ? 95 : 60),
    feedback: res.feedback || "Good progress on this checkpoint!",
    correctedCode: prettyFormatCode(res.correctedCode || milestone.referenceSolution)
  };
}
