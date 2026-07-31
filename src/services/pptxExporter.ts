import pptxgen from 'pptxgenjs';
import type { ProjectPlan } from '../types';

export function exportPlanToPowerPoint(plan: ProjectPlan): void {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'DevCoach AI Platform';
  pptx.company = 'Learning Engineering Lab';
  pptx.title = plan.title;

  // Claymorphism Palette Tokens (Rich Contrast, Colorful Clay Theme)
  const BG_COLOR = '1C1815';        // Deep Warm Clay Surface
  const CARD_BG = '26211D';         // Soft Puffy Card
  const CARD_INNER = '302924';      // Elevated Inner Box
  const TEXT_MAIN = 'F0E6DC';       // Parchment Header Text
  const TEXT_MUTED = 'AA9C8E';      // Muted Subtitle Text

  // Vibrant Role Accents
  const COLOR_BLUE = '3B82F6';      // Foundational
  const COLOR_PURPLE = '8B5CF6';    // Patterns
  const COLOR_TEAL = '06B6D4';      // Tech Stack
  const COLOR_ORANGE = 'F59E0B';    // Specialized
  const COLOR_RED = 'EF4444';       // Traps & Mistakes
  const COLOR_GREEN = '10B981';     // Solutions & Insights
  const COLOR_PINK = 'EC4899';      // Code & Architecture

  // ─── SLIDE 1: Title Slide ──────────────────────────────────────────────────
  const slide1 = pptx.addSlide();
  slide1.background = { color: BG_COLOR };

  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 0.8, w: 3.8, h: 0.45, fill: { color: COLOR_PURPLE }, line: { color: COLOR_PURPLE }
  });
  slide1.addText(`DEVCOACH SPECIFICATION • ${plan.tier.toUpperCase()} EDITION`, {
    x: 0.8, y: 0.8, w: 3.8, h: 0.45, fontSize: 10, fontFace: 'Trebuchet MS', color: 'FFFFFF', bold: true, align: 'center'
  });

  slide1.addText(plan.title, {
    x: 0.8, y: 1.5, w: 8.8, h: 1.2, fontSize: 32, fontFace: 'Trebuchet MS', color: TEXT_MAIN, bold: true
  });

  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 2.9, w: 8.8, h: 1.8, fill: { color: CARD_BG }, line: { color: COLOR_PURPLE, width: 2 }
  });
  slide1.addText('Core Architectural Purpose & Problem Solved:', {
    x: 1.1, y: 3.1, w: 8.2, h: 0.3, fontSize: 12, fontFace: 'Trebuchet MS', color: COLOR_PURPLE, bold: true
  });
  slide1.addText(plan.summary, {
    x: 1.1, y: 3.5, w: 8.2, h: 1.0, fontSize: 13, fontFace: 'Segoe UI', color: TEXT_MUTED
  });

  // Metrics Stat Cards
  const stats = [
    { label: 'TOTAL CHECKPOINTS', val: `${plan.milestones.length} Milestones`, color: COLOR_TEAL },
    { label: 'ESTIMATED DURATION', val: `~${plan.estimatedHours} Hours`, color: COLOR_GREEN },
    { label: 'EVALUATION ENGINE', val: 'Gemini 3.1 Flash Lite', color: COLOR_ORANGE },
  ];
  stats.forEach((st, idx) => {
    slide1.addShape(pptx.ShapeType.roundRect, {
      x: 0.8 + idx * 3.0, y: 5.0, w: 2.8, h: 1.4, fill: { color: CARD_BG }, line: { color: CARD_INNER, width: 1 }
    });
    slide1.addText(st.label, {
      x: 1.0 + idx * 3.0, y: 5.2, w: 2.4, h: 0.3, fontSize: 9, fontFace: 'Trebuchet MS', color: st.color, bold: true
    });
    slide1.addText(st.val, {
      x: 1.0 + idx * 3.0, y: 5.5, w: 2.4, h: 0.6, fontSize: 16, fontFace: 'Trebuchet MS', color: TEXT_MAIN, bold: true
    });
  });

  // ─── SLIDE 2: Pedagogical & Engineering Problem ───────────────────────────
  const slide2 = pptx.addSlide();
  slide2.background = { color: BG_COLOR };

  slide2.addText('PEDAGOGICAL & ENGINEERING PROBLEM', {
    x: 0.8, y: 0.6, w: 8.8, h: 0.3, fontSize: 11, fontFace: 'Trebuchet MS', color: COLOR_BLUE, bold: true
  });
  slide2.addText('Why Traditional Copy-Paste Tutorials Fail', {
    x: 0.8, y: 0.9, w: 8.8, h: 0.6, fontSize: 24, fontFace: 'Trebuchet MS', color: TEXT_MAIN, bold: true
  });

  // Left Col: Naive Flaws
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.7, w: 4.2, h: 4.8, fill: { color: CARD_BG }, line: { color: COLOR_RED, width: 2 }
  });
  slide2.addText('NAIVE APPROACH & COMMON FLAWS', {
    x: 1.1, y: 2.0, w: 3.6, h: 0.4, fontSize: 13, fontFace: 'Trebuchet MS', color: COLOR_RED, bold: true
  });
  slide2.addText(
    '• Copy-pasting boilerplate without understanding state flow or architecture.\n\n' +
    '• Re-checking and re-computing logic that is already available.\n\n' +
    '• Getting stuck on unassisted syntax bugs, leading to high abandonment.\n\n' +
    '• Learning hooks or API calls in isolation without production context.',
    { x: 1.1, y: 2.6, w: 3.6, h: 3.6, fontSize: 12, fontFace: 'Segoe UI', color: TEXT_MUTED }
  );

  // Right Col: Key Insight Fix
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 5.4, y: 1.7, w: 4.2, h: 4.8, fill: { color: CARD_BG }, line: { color: COLOR_GREEN, width: 2 }
  });
  slide2.addText('KEY INSIGHT & DEVCOACH FIX', {
    x: 5.7, y: 2.0, w: 3.6, h: 0.4, fontSize: 13, fontFace: 'Trebuchet MS', color: COLOR_GREEN, bold: true
  });
  slide2.addText(
    '• Progressive file unlocking reduces scope to 1 step at a time.\n\n' +
    '• Clear // TODO markers keep focus strictly on implementing core logic.\n\n' +
    '• Senior AI Coach guides via Socratic prompts instead of direct answers.\n\n' +
    '• Gemini 3.1 Flash Lite evaluates semantic intent without rigid regex.',
    { x: 5.7, y: 2.6, w: 3.6, h: 3.6, fontSize: 12, fontFace: 'Segoe UI', color: TEXT_MUTED }
  );

  // ─── SLIDE 3: Tech Stack Reference Table ──────────────────────────────────
  const slide3 = pptx.addSlide();
  slide3.background = { color: BG_COLOR };

  slide3.addText('TECHNOLOGY STACK ARCHITECTURE', {
    x: 0.8, y: 0.6, w: 8.8, h: 0.3, fontSize: 11, fontFace: 'Trebuchet MS', color: COLOR_TEAL, bold: true
  });
  slide3.addText('Engineering Dependencies & Component Rationale', {
    x: 0.8, y: 0.9, w: 8.8, h: 0.6, fontSize: 24, fontFace: 'Trebuchet MS', color: TEXT_MAIN, bold: true
  });

  const tableRows = [
    [
      { text: 'Technology / Dependency', options: { fill: { color: COLOR_TEAL }, color: 'FFFFFF', bold: true, fontFace: 'Trebuchet MS' } },
      { text: 'Role & Classification', options: { fill: { color: COLOR_TEAL }, color: 'FFFFFF', bold: true, fontFace: 'Trebuchet MS' } },
      { text: 'Why Selected & Engineering Purpose', options: { fill: { color: COLOR_TEAL }, color: 'FFFFFF', bold: true, fontFace: 'Trebuchet MS' } },
    ],
    ...plan.techStack.map(tech => [
      { text: tech, options: { fill: { color: CARD_BG }, color: TEXT_MAIN, bold: true, fontFace: 'Trebuchet MS' } },
      { text: 'Core Stack', options: { fill: { color: CARD_BG }, color: COLOR_TEAL, fontFace: 'Trebuchet MS' } },
      { text: `Essential dependency for building ${plan.title}. Configured for high performance, strict modular boundaries, and clean maintainability.`, options: { fill: { color: CARD_BG }, color: TEXT_MUTED, fontFace: 'Segoe UI' } },
    ])
  ];

  slide3.addTable(tableRows, {
    x: 0.8, y: 1.8, w: 8.8, colW: [2.2, 1.8, 4.8], margin: 8
  });

  // ─── SLIDES 4..N: Milestone Deep Dives (Checklist 8-Step Breakdown) ───────
  plan.milestones.forEach((m) => {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    slide.addText(`CHECKPOINT ${m.order} OF ${plan.milestones.length}`, {
      x: 0.8, y: 0.6, w: 8.8, h: 0.3, fontSize: 11, fontFace: 'Trebuchet MS', color: COLOR_PURPLE, bold: true
    });
    slide.addText(m.name, {
      x: 0.8, y: 0.9, w: 8.8, h: 0.6, fontSize: 24, fontFace: 'Trebuchet MS', color: TEXT_MAIN, bold: true
    });

    // Top Left: Lesson & Concept
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.7, w: 4.2, h: 2.3, fill: { color: CARD_BG }, line: { color: COLOR_BLUE, width: 1.5 }
    });
    slide.addText('1. CONCEPT TAUGHT & LESSON', {
      x: 1.0, y: 1.9, w: 3.8, h: 0.3, fontSize: 11, fontFace: 'Trebuchet MS', color: COLOR_BLUE, bold: true
    });
    slide.addText(`Concept: ${m.conceptTaught}\nSummary: ${m.lessonSummary}`, {
      x: 1.0, y: 2.3, w: 3.8, h: 1.5, fontSize: 11, fontFace: 'Segoe UI', color: TEXT_MUTED
    });

    // Top Right: Why Needed
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.4, y: 1.7, w: 4.2, h: 2.3, fill: { color: CARD_BG }, line: { color: COLOR_ORANGE, width: 1.5 }
    });
    slide.addText('2. WHY NEEDED (PROBLEM SOLVED)', {
      x: 5.6, y: 1.9, w: 3.8, h: 0.3, fontSize: 11, fontFace: 'Trebuchet MS', color: COLOR_ORANGE, bold: true
    });
    slide.addText(m.whyNeeded, {
      x: 5.6, y: 2.3, w: 3.8, h: 1.5, fontSize: 11, fontFace: 'Segoe UI', color: TEXT_MUTED
    });

    // Bottom Left: Goal & Hints
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 4.2, w: 4.2, h: 2.3, fill: { color: CARD_BG }, line: { color: COLOR_GREEN, width: 1.5 }
    });
    slide.addText('3. ACTIONABLE GOAL & HINT', {
      x: 1.0, y: 4.4, w: 3.8, h: 0.3, fontSize: 11, fontFace: 'Trebuchet MS', color: COLOR_GREEN, bold: true
    });
    slide.addText(`Goal: ${m.actionableGoal}\nHint: ${m.hint1}`, {
      x: 1.0, y: 4.8, w: 3.8, h: 1.5, fontSize: 11, fontFace: 'Segoe UI', color: TEXT_MUTED
    });

    // Bottom Right: Unlocked Files & Code Example
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.4, y: 4.2, w: 4.2, h: 2.3, fill: { color: CARD_BG }, line: { color: COLOR_PINK, width: 1.5 }
    });
    slide.addText('4. UNLOCKED ARCHITECTURE & EXAMPLE', {
      x: 5.6, y: 4.4, w: 3.8, h: 0.3, fontSize: 11, fontFace: 'Trebuchet MS', color: COLOR_PINK, bold: true
    });
    slide.addText(`Files Unlocked: ${m.filesUnlocked.join(', ')}\n\nExample Snippet:\n${m.exampleSnippet || '// Starter logic'}`, {
      x: 5.6, y: 4.8, w: 3.8, h: 1.5, fontSize: 10, fontFace: 'Segoe UI', color: TEXT_MUTED
    });
  });

  // ─── SLIDE: 5 Conceptual Checkpoint Questions ────────────────────────────
  const slideCheck = pptx.addSlide();
  slideCheck.background = { color: BG_COLOR };

  slideCheck.addText('CONCEPTUAL CHECKPOINT QUIZ', {
    x: 0.8, y: 0.6, w: 8.8, h: 0.3, fontSize: 11, fontFace: 'Trebuchet MS', color: COLOR_ORANGE, bold: true
  });
  slideCheck.addText('5 Questions to Prove Architectural Mastery', {
    x: 0.8, y: 0.9, w: 8.8, h: 0.6, fontSize: 24, fontFace: 'Trebuchet MS', color: TEXT_MAIN, bold: true
  });

  const quizQuestions = [
    `1. Why is ${plan.milestones[0]?.conceptTaught || 'modular state'} introduced first before building advanced UI logic?`,
    `2. What specific flaw would occur if we didn't implement ${plan.milestones[1]?.conceptTaught || 'event handlers'} correctly?`,
    `3. How does ${plan.title} handle data updates without triggering redundant state re-renders?`,
    `4. What mechanistic error causes state mutation bugs during async operations?`,
    `5. How do the unlocked files (${plan.milestones[0]?.filesUnlocked.join(', ')}) separate concerns cleanly?`
  ];

  quizQuestions.forEach((q, qIdx) => {
    slideCheck.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.7 + qIdx * 0.95, w: 8.8, h: 0.8, fill: { color: CARD_BG }, line: { color: COLOR_ORANGE, width: 1 }
    });
    slideCheck.addText(q, {
      x: 1.1, y: 1.9 + qIdx * 0.95, w: 8.2, h: 0.4, fontSize: 12, fontFace: 'Segoe UI', color: TEXT_MAIN, bold: true
    });
  });

  // ─── SLIDE: Closing Slide ─────────────────────────────────────────────────
  const slideClose = pptx.addSlide();
  slideClose.background = { color: BG_COLOR };

  slideClose.addShape(pptx.ShapeType.roundRect, {
    x: 1.2, y: 1.5, w: 8.0, h: 4.4, fill: { color: CARD_BG }, line: { color: COLOR_GREEN, width: 2 }
  });

  slideClose.addText('READY TO BUILD IN WORKSPACE', {
    x: 1.2, y: 2.0, w: 8.0, h: 0.4, fontSize: 12, fontFace: 'Trebuchet MS', color: COLOR_GREEN, bold: true, align: 'center'
  });
  slideClose.addText(plan.title, {
    x: 1.5, y: 2.6, w: 7.4, h: 0.8, fontSize: 28, fontFace: 'Trebuchet MS', color: TEXT_MAIN, bold: true, align: 'center'
  });
  slideClose.addText(
    `Rule: "Never state a fact without explaining the problem it solves."\n\n` +
    `Your workspace is equipped with live AI Code Review, Monaco Editor, and Socratic Coaching.`,
    { x: 1.5, y: 3.6, w: 7.4, h: 1.5, fontSize: 13, fontFace: 'Segoe UI', color: TEXT_MUTED, align: 'center' }
  );

  pptx.writeFile({ fileName: `${plan.title.replace(/[^a-zA-Z0-9]/g, '_')}_Presentation.pptx` });
}
