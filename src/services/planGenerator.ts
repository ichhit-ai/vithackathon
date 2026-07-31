import type { ProjectPlan } from '../types';

export function generatePlansFromIdea(idea: string): ProjectPlan[] {
  const cleanIdea = idea.trim() || 'Interactive Habit Tracker with Streaks';
  
  // 1. LEAN TIER
  const leanPlan: ProjectPlan = {
    id: 'plan-lean-' + Date.now(),
    title: `${cleanIdea} (Lean Edition)`,
    summary: `Minimalist working prototype focusing on core functionality with clean component structure.`,
    tier: 'lean',
    techStack: ['React', 'JavaScript/TypeScript', 'Tailwind CSS', 'Local Storage'],
    estimatedHours: 4,
    fileStructure: [
      {
        id: 'f1',
        name: 'src',
        path: '/src',
        type: 'folder',
        unlockedAtCheckpoint: 1,
        children: [
          { id: 'f2', name: 'App.tsx', path: '/src/App.tsx', type: 'file', unlockedAtCheckpoint: 1, content: `// Checkpoint 1: Scaffold your main layout\nimport React from 'react';\n\nexport default function App() {\n  return (\n    <div className="p-8 text-zinc-100">\n      <h1 className="text-2xl font-bold">${cleanIdea}</h1>\n      {/* TODO: Add your main components here */}\n    </div>\n  );\n}\n` },
          { id: 'f3', name: 'types.ts', path: '/src/types.ts', type: 'file', unlockedAtCheckpoint: 1, content: `// Data models for the project\nexport interface Item {\n  id: string;\n  title: string;\n  completed: boolean;\n}\n` },
          { id: 'f4', name: 'HabitList.tsx', path: '/src/HabitList.tsx', type: 'file', unlockedAtCheckpoint: 2, content: `// Checkpoint 2: Habit List Component\nimport React from 'react';\nimport { Item } from './types';\n\nexport function HabitList({ items }: { items: Item[] }) {\n  return (\n    <ul className="mt-4 space-y-2">\n      {items.map(item => (\n        <li key={item.id} className="p-3 bg-zinc-800 rounded border border-zinc-700">\n          {item.title}\n        </li>\n      ))}\n    </ul>\n  );\n}\n` },
          { id: 'f5', name: 'useStorage.ts', path: '/src/useStorage.ts', type: 'file', unlockedAtCheckpoint: 3, content: `// Checkpoint 3: Local Storage persistence hook\nimport { useState, useEffect } from 'react';\n\nexport function useStorage<T>(key: string, initialValue: T) {\n  const [storedValue, setStoredValue] = useState<T>(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch {\n      return initialValue;\n    }\n  });\n\n  useEffect(() => {\n    window.localStorage.setItem(key, JSON.stringify(storedValue));\n  }, [key, storedValue]);\n\n  return [storedValue, setStoredValue] as const;\n}\n` },
          { id: 'f6', name: 'StatsSummary.tsx', path: '/src/StatsSummary.tsx', type: 'file', unlockedAtCheckpoint: 4, content: `// Checkpoint 4: Summary Statistics Component\nimport React from 'react';\n\nexport function StatsSummary({ total, completed }: { total: number; completed: number }) {\n  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;\n  return (\n    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300">\n      Completion Rate: <span className="font-semibold text-emerald-400">{percent}%</span>\n    </div>\n  );\n}\n` }
        ]
      }
    ],
    milestones: [
      {
        id: 'm1',
        order: 1,
        name: 'Project Scaffold & Layout Header',
        conceptTaught: 'JSX Layout & Component Scaffolding',
        difficulty: 'beginner',
        estimatedMinutes: 30,
        protectedScope: 'Exporting App component with title and main container elements',
        lessonContent: {
          summary: 'Scaffolding clean layout shells using semantic HTML tags and CSS utility classes.',
          whyNeeded: 'Before implementing state or handlers, every interface needs a predictable structural shell.',
          exampleSnippet: `function HeaderShell({ title }) {\n  return (\n    <header className="border-b border-zinc-800 pb-4 mb-6">\n      <h1 className="text-xl font-bold text-zinc-100">{title}</h1>\n    </header>\n  );\n}`,
          exampleDescription: 'Here is how a clean layout header component is structured without mixing business logic.',
          actionableGoal: 'In `src/App.tsx`, update the App function to return a top header bar with a subtitle and container card.'
        },
        testCases: [
          { id: 't1', description: 'App component renders a header container element', expectedOutput: 'Header element present' },
          { id: 't2', description: 'Contains title matching the project requirement', expectedOutput: 'Title string rendered' }
        ],
        staticChecks: [
          { id: 's1', description: 'Must use JSX return statement', pattern: 'return', targetFile: '/src/App.tsx' }
        ],
        filesUnlocked: ['/src/App.tsx', '/src/types.ts'],
        referenceSolution: {
          '/src/App.tsx': `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 max-w-2xl mx-auto">\n      <header className="border-b border-zinc-800 pb-4 mb-6">\n        <h1 className="text-2xl font-bold tracking-tight">${cleanIdea}</h1>\n        <p className="text-sm text-zinc-400">Track and build daily progress effortlessly.</p>\n      </header>\n    </div>\n  );\n}\n`
        },
        hints: [
          'Make sure you return a single top-level element or React fragment from App().',
          'Use CSS classes like `min-h-screen`, `bg-zinc-950`, `p-8` for clean dark aesthetics.'
        ]
      },
      {
        id: 'm2',
        order: 2,
        name: 'Interactive Habit Item Rendering',
        conceptTaught: 'React Props & Array Mapping',
        difficulty: 'beginner',
        estimatedMinutes: 45,
        protectedScope: 'Mapping over array items in HabitList component',
        lessonContent: {
          summary: 'Rendering dynamic lists using Array.map() with unique `key` props.',
          whyNeeded: 'Static markup cannot render dynamic user data. Array mapping projects items into React components.',
          exampleSnippet: `function SimpleList({ items }) {\n  return (\n    <ul>\n      {items.map(item => (\n        <li key={item.id}>{item.name}</li>\n      ))}\n    </ul>\n  );\n}`,
          exampleDescription: 'Always pass a unique key prop (like item.id) to prevent React re-rendering glitches.',
          actionableGoal: 'In `src/HabitList.tsx`, map through items prop to display habit title and a completion checkbox.'
        },
        testCases: [
          { id: 't3', description: 'HabitList renders all passed list items', expectedOutput: 'Mapped list nodes' }
        ],
        staticChecks: [
          { id: 's2', description: 'Must call Array.map() inside component', pattern: '.map(', targetFile: '/src/HabitList.tsx' }
        ],
        filesUnlocked: ['/src/HabitList.tsx'],
        referenceSolution: {
          '/src/HabitList.tsx': `import React from 'react';\nimport { Item } from './types';\n\nexport function HabitList({ items, onToggle }: { items: Item[]; onToggle?: (id: string) => void }) {\n  return (\n    <ul className="mt-4 space-y-2">\n      {items.map(item => (\n        <li key={item.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg">\n          <span className={item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>{item.title}</span>\n          <input\n            type="checkbox"\n            checked={item.completed}\n            onChange={() => onToggle?.(item.id)}\n            className="w-4 h-4 accent-emerald-500 cursor-pointer"\n          />\n        </li>\n      ))}\n    </ul>\n  );\n}\n`
        },
        hints: [
          'Remember to wrap `.map()` in curly braces `{}` inside JSX.',
          'Add conditional class styling like `line-through` when item.completed is true.'
        ]
      },
      {
        id: 'm3',
        order: 3,
        name: 'Persistent State Hook',
        conceptTaught: 'Custom Hooks & Web Storage API',
        difficulty: 'intermediate',
        estimatedMinutes: 40,
        protectedScope: 'Writing custom useStorage hook logic',
        lessonContent: {
          summary: 'Encapsulating reusable storage logic into custom React hooks.',
          whyNeeded: 'State resets on page reload unless synchronized with localStorage.',
          exampleSnippet: `function useMyStorage(key, initial) {\n  const [val, setVal] = useState(() => {\n    const saved = localStorage.getItem(key);\n    return saved ? JSON.parse(saved) : initial;\n  });\n  return [val, setVal];\n}`,
          exampleDescription: 'Using lazy state initialization `useState(() => ...)` prevents reading storage on every render.',
          actionableGoal: 'Complete `src/useStorage.ts` to load and sync data with window.localStorage.'
        },
        testCases: [
          { id: 't4', description: 'Reads existing key from localStorage or uses initial fallback', expectedOutput: 'Synced value state' }
        ],
        staticChecks: [
          { id: 's3', description: 'Must use localStorage getItem and setItem', pattern: 'localStorage', targetFile: '/src/useStorage.ts' }
        ],
        filesUnlocked: ['/src/useStorage.ts'],
        referenceSolution: {
          '/src/useStorage.ts': `import { useState, useEffect } from 'react';\n\nexport function useStorage<T>(key: string, initialValue: T) {\n  const [storedValue, setStoredValue] = useState<T>(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch {\n      return initialValue;\n    }\n  });\n\n  useEffect(() => {\n    try {\n      window.localStorage.setItem(key, JSON.stringify(storedValue));\n    } catch (e) {\n      console.error(e);\n    }\n  }, [key, storedValue]);\n\n  return [storedValue, setStoredValue] as const;\n}\n`
        },
        hints: [
          'JSON.stringify is required when storing objects or arrays in localStorage.',
          'Always use try/catch blocks when accessing window.localStorage.'
        ]
      },
      {
        id: 'm4',
        order: 4,
        name: 'Progress Statistics & Completion Rate',
        conceptTaught: 'Derived State & Calculation Patterns',
        difficulty: 'beginner',
        estimatedMinutes: 30,
        protectedScope: 'Calculating completion percentage without redundant state',
        lessonContent: {
          summary: 'Computing derived values during render without redundant useState calls.',
          whyNeeded: 'Storing calculated values in state creates synchronization bugs. Compute derived values directly.',
          exampleSnippet: `function MetricDisplay({ items }) {\n  const activeCount = items.filter(i => !i.done).length;\n  return <div>Active: {activeCount}</div>;\n}`,
          exampleDescription: 'Calculate derived numbers right inside component body before return statement.',
          actionableGoal: 'In `src/StatsSummary.tsx`, calculate total count, completed count, and render progress indicator.'
        },
        testCases: [
          { id: 't5', description: 'Correctly computes percent complete', expectedOutput: 'Percentage text rendered' }
        ],
        staticChecks: [
          { id: 's4', description: 'Computes completion percentage', pattern: 'completed / total', targetFile: '/src/StatsSummary.tsx' }
        ],
        filesUnlocked: ['/src/StatsSummary.tsx'],
        referenceSolution: {
          '/src/StatsSummary.tsx': `import React from 'react';\n\nexport function StatsSummary({ total, completed }: { total: number; completed: number }) {\n  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;\n  return (\n    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between text-sm">\n      <span className="text-zinc-400">Completion Metrics</span>\n      <div className="flex items-center gap-2">\n        <div className="w-24 bg-zinc-800 rounded-full h-2 overflow-hidden">\n          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: \`\${percent}%\` }} />\n        </div>\n        <span className="font-semibold text-emerald-400">{percent}%</span>\n      </div>\n    </div>\n  );\n}\n`
        },
        hints: [
          'Guard against division by zero when `total === 0`.',
          'Use Math.round() for clean integer percentages.'
        ]
      }
    ]
  };

  // 2. STANDARD TIER
  const standardPlan: ProjectPlan = {
    id: 'plan-standard-' + Date.now(),
    title: `${cleanIdea} (Standard Edition)`,
    summary: `Balanced, production-ready build featuring streak tracking, category tagging, filtering, and animated progress visualizers.`,
    tier: 'standard',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Lucide Icons', 'Canvas Confetti', 'Zustand Store'],
    estimatedHours: 8,
    fileStructure: leanPlan.fileStructure,
    milestones: [
      ...leanPlan.milestones,
      {
        id: 'm5',
        order: 5,
        name: 'Streak Calculator & Celebration Effects',
        conceptTaught: 'Side Effects & External Canvas Libraries',
        difficulty: 'intermediate',
        estimatedMinutes: 50,
        protectedScope: 'Triggering confetti canvas animation on 100% completion milestone',
        lessonContent: {
          summary: 'Triggering delightful celebration effects safely inside React useEffect hooks.',
          whyNeeded: 'Micro-interactions boost user engagement and completion motivation.',
          exampleSnippet: `useEffect(() => {\n  if (isMilestoneReached) {\n    confetti({ particleCount: 50, spread: 60 });\n  }\n}, [isMilestoneReached]);`,
          exampleDescription: 'Pass dependency array properly to prevent infinite animation loops.',
          actionableGoal: 'Trigger canvas confetti when all habits for the day are marked complete.'
        },
        testCases: [
          { id: 't6', description: 'Triggers confetti function call upon total completion', expectedOutput: 'Confetti effect executed' }
        ],
        staticChecks: [
          { id: 's5', description: 'Uses useEffect dependency check', pattern: 'useEffect', targetFile: '/src/App.tsx' }
        ],
        filesUnlocked: ['/src/App.tsx'],
        referenceSolution: {
          '/src/App.tsx': `import React, { useEffect } from 'react';\nimport confetti from 'canvas-confetti';\n\nexport function celebrate() {\n  confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });\n}\n`
        },
        hints: [
          'Call confetti() only when completion reaches 100%.',
          'Import canvas-confetti gracefully.'
        ]
      }
    ]
  };

  // 3. AMBITIOUS TIER
  const ambitiousPlan: ProjectPlan = {
    id: 'plan-ambitious-' + Date.now(),
    title: `${cleanIdea} (Ambitious Portfolio Grade)`,
    summary: `Full-featured portfolio project with heatmaps, analytics charts, custom themes, dark/light toggle, data export/import, and PWA readiness.`,
    tier: 'ambitious',
    techStack: ['React', 'TypeScript', 'TanStack Query', 'Recharts / SVG', 'Tailwind CSS', 'IndexedDB / Storage'],
    estimatedHours: 14,
    fileStructure: leanPlan.fileStructure,
    milestones: [
      ...standardPlan.milestones,
      {
        id: 'm6',
        order: 6,
        name: 'GitHub-Style Activity Heatmap Grid',
        conceptTaught: 'Complex Data Transformations & Matrix Visualization',
        difficulty: 'advanced',
        estimatedMinutes: 60,
        protectedScope: 'Building 365-day heat map matrix grid calculation',
        lessonContent: {
          summary: 'Transforming raw log timestamps into a 2D week-by-day activity grid.',
          whyNeeded: 'Portfolio projects stand out when turning raw user logs into visual insights.',
          exampleSnippet: `const matrix = Array.from({ length: 7 }, () => Array(52).fill(0));`,
          exampleDescription: 'Pre-allocate a fixed matrix for 52 weeks x 7 days per week.',
          actionableGoal: 'Build an activity grid rendering 30-day activity intensity blocks.'
        },
        testCases: [
          { id: 't7', description: 'Calculates day intensity levels from date history', expectedOutput: 'Heatmap matrix generated' }
        ],
        staticChecks: [
          { id: 's6', description: 'Calculates array intensity matrix', pattern: 'fill(', targetFile: '/src/App.tsx' }
        ],
        filesUnlocked: ['/src/App.tsx'],
        referenceSolution: {
          '/src/App.tsx': `// Advanced Heatmap grid transform\n`
        },
        hints: [
          'Map intensity values to background color shades (e.g., bg-emerald-950 to bg-emerald-500).'
        ]
      }
    ]
  };

  return [leanPlan, standardPlan, ambitiousPlan];
}
