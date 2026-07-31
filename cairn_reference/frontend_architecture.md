# Cairn — Frontend Architecture

> Hackathon Mission Control & Coaching Companion

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | TanStack Start (React 19) | SSR-capable via Nitro; file-based routing under `src/routes/` |
| Bundler | Vite 8 | Uses `@lovable.dev/vite-tanstack-config` which bundles TanStack devtools, `@vitejs/plugin-react`, Tailwind, `vite-tsconfig-paths`, and Nitro |
| Styling | Tailwind CSS v4 | `@tailwindcss/vite` plugin; custom design tokens in `src/styles.css` |
| State | React `useState` / `useEffect` | No global store; all state is lifted into the single route component |
| Data fetching | `@tanstack/react-query` (wired, unused) | `QueryClientProvider` is mounted but no queries are made yet; mock layer provides all data synchronously |
| Icons | `lucide-react` | `ArrowUp`, `ChevronDown`, `Moon`, `Sun`, `Plus`, `X` |
| Fonts | Google Fonts (CDN) | **Fraunces** (display), **IBM Plex Sans** (body), **IBM Plex Mono** (data / labels) |

---

## Directory Layout

```
frontend/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   └── cairn/             ← All UI components (8 files)
│   ├── hooks/
│   │   └── use-theme.tsx      ← Light/dark toggle with localStorage persistence
│   ├── lib/
│   │   ├── cairn-mock.ts      ← Mock data layer (see §Data Layer below)
│   │   └── utils.ts           ← `cn()` — clsx + tailwind-merge helper
│   ├── routes/
│   │   ├── __root.tsx          ← HTML shell, fonts, 404/error boundaries
│   │   └── index.tsx           ← Single-page dashboard (all panels composed here)
│   ├── router.tsx              ← TanStack Router factory
│   ├── routeTree.gen.ts        ← Auto-generated route tree (do not edit)
│   ├── server.ts               ← Nitro server entry (SSR error wrapper)
│   ├── start.ts                ← TanStack Start middleware (CSRF + error)
│   └── styles.css              ← Tailwind config + full design system
├── package.json
├── tsconfig.json
├── vite.config.ts
├── components.json             ← Shadcn/ui config (no UI components remain; kept for future `npx shadcn` use)
├── eslint.config.js
├── bunfig.toml
└── bun.lock
```

---

## Styling Approach

### Tailwind v4 + oklch Semantic Tokens

All colors are defined as **oklch** CSS custom properties in `src/styles.css`, aliased into Tailwind via `@theme inline`. The system provides:

| Token family | Examples | Purpose |
|---|---|---|
| Shadcn-standard | `--background`, `--foreground`, `--primary`, `--card`, `--muted`, `--border`, etc. | Base surface / text / interactive colors |
| Cairn-specific | `--brass`, `--brass-dim`, `--brass-bright`, `--sage`, `--alert` | Accent palette: **brass** (gold, primary CTA), **sage** (green, success/watcher), **alert** (amber, warnings) |
| Surface effects | `--terminal`, `--terminal-foreground`, `--hairline`, `--ridge`, `--trench` | War Room terminal chrome + subtle dividers |
| Shadows | `--shadow-extruded`, `--shadow-extruded-sm`, `--shadow-inset` | Neumorphic depth |
| Glass | `--glass-fill`, `--glass-shadow` | Glassmorphism panels |

### Dual-Theme System

`:root` defines the **light theme** (matte cream expedition paper). `.dark` overrides every token for a **graphite-green neumorphic** dark mode. Toggled via `useTheme()` hook which adds/removes the `.dark` class on `<html>` and persists to `localStorage`.

### Custom Utilities

Registered via `@utility`:

| Class | Effect |
|---|---|
| `neu` | Neumorphic raised surface (background + extruded shadow) |
| `neu-sm` | Smaller neumorphic elevation |
| `neu-inset` | Inset / pressed neumorphic surface (for inputs, wells) |
| `glass-panel` | Frosted glass card (backdrop blur + hairline border + glass shadow) |
| `focus-brass` | Focus-visible ring using brass color |
| `watcher-dot` | Pulsing dot animation for the watcher heartbeat indicator |

---

## Component Structure

All components live in `src/components/cairn/`. None use Shadcn/Radix primitives — they are pure React + Tailwind with inline SVG where needed.

### Component Map

| Component | File | Props | Responsibility |
|---|---|---|---|
| `IntakeBriefingForm` | `IntakeBriefingForm.tsx` | `onConvene: (briefing) => void` | Full-page intake form: project idea (textarea), hours remaining (numeric input), dynamic team member rows. Gatekeeper — dashboard doesn't render until this submits. |
| `CommandBar` | `CommandBar.tsx` | `readiness`, `secondsRemaining`, `watcherActive`, `lastActivityLabel` | Sticky glassmorphism header: Cairn logo, live countdown timer (ticks every second), semi-circular SVG readiness gauge, watcher heartbeat dot, theme toggle. |
| `ScopeCritique` | `ScopeCritique.tsx` | `cards: CritiqueCard[]` | Three-column editorial layout (Keep / Cut / Pivot). Cards are numbered sequentially across columns. "Cut" cards render at 80% opacity with hover reveal. "Pivot" cards are italic with an amber left border. |
| `MilestoneRoadmap` | `MilestoneRoadmap.tsx` | `milestones`, `onToggle` | Vertical timeline with toggleable checkboxes. Clicking a milestone toggles its `done`↔`active` status. Shows assignee chips and a running "X/N blocks closed" counter. |
| `PitchOutline` | `PitchOutline.tsx` | `slides: PitchSlide[]` | Accordion of pitch slides with time allocations. Expand/collapse each slide to reveal talking-point beats. Total time displayed in header. |
| `CheckInFeed` | `CheckInFeed.tsx` | `entries`, `onSubmit` | Scrollable feed of team updates and watchdog alerts. Alerts render with amber border/tint. Bottom input bar for posting new check-ins. |
| `WarRoomDrawer` | `WarRoomDrawer.tsx` | `initialLogs: WarRoomLog[]` | Fixed bottom terminal-styled drawer. Simulates streaming agent debate (appends queued logs every 4.2s). Auto-follows scroll; shows "Resume following" pill when user scrolls up. Color-coded agent names. |
| `ThemeToggle` | `ThemeToggle.tsx` | `className?` | Sun/Moon icon button with crossfade rotation animation. Calls `useTheme().toggleTheme`. |

### Page Composition (`routes/index.tsx`)

```
IntakeBriefingForm (if no briefing)
  └─ onConvene → setBriefing → renders dashboard:

CommandBar (sticky header)
Briefing summary panel
ScopeCritique
┌─────────────────────────────┐
│ MilestoneRoadmap │ PitchOutline    │
│                  │ CheckInFeed     │
└─────────────────────────────┘
WarRoomDrawer (fixed bottom)
```

---

## Data Layer — `cairn-mock.ts`

This is the **single file to replace** when wiring up the real backend. Every function currently returns hardcoded data. The shapes they return are the API contract.

### Exported Types

| Type | Fields | Used by |
|---|---|---|
| `ProjectStatus` | `secondsRemaining`, `readiness`, `watcherActive`, `lastActivityLabel` | `CommandBar` |
| `AgentId` | `"architect" \| "slasher" \| "pitch" \| "master"` | `WarRoomDrawer` |
| `WarRoomLog` | `id`, `agent: AgentId`, `timestamp`, `message` | `WarRoomDrawer` |
| `CritiqueBucket` | `"keep" \| "cut" \| "pivot"` | `ScopeCritique` |
| `CritiqueCard` | `id`, `bucket`, `title`, `rationale` | `ScopeCritique` |
| `MilestoneStatus` | `"done" \| "active" \| "pending"` | `MilestoneRoadmap` |
| `Milestone` | `id`, `window`, `title`, `description`, `status`, `assignees` | `MilestoneRoadmap` |
| `PitchSlide` | `id`, `name`, `minutes`, `beats[]` | `PitchOutline` |
| `FeedEntry` | `id`, `kind: "update" \| "alert"`, `author`, `timestamp`, `body` | `CheckInFeed` |
| `IntakeBriefing` | `idea`, `hours`, `team: {name, role}[]` | `IntakeBriefingForm` / `index.tsx` |

### Exported Functions — Replacement Targets

| Function | Signature | Replace with |
|---|---|---|
| `getProjectStatus()` | `() => ProjectStatus` | `GET /api/project/status` — Returns live countdown, watcher heartbeat state, and computed readiness score. |
| `getWarRoomLogs()` | `() => WarRoomLog[]` | `GET /api/warroom/logs` — Initial batch of council debate logs. |
| `getStreamingWarRoomLogs()` | `() => WarRoomLog[]` | `GET /api/warroom/stream` or **WebSocket/SSE** — New logs pushed in real time as agents deliberate. Currently simulated with a 4.2s `setInterval` queue. |
| `getScopeCritique()` | `() => CritiqueCard[]` | `GET /api/critique` — The council's scope verdict (keep/cut/pivot cards). Triggered after intake briefing is submitted. |
| `getRoadmap()` | `() => Milestone[]` | `GET /api/roadmap` — Hourly milestone blocks with statuses and assignees. |
| `getPitchOutline()` | `() => PitchSlide[]` | `GET /api/pitch` — AI-generated pitch slide outline with talking beats. |
| `getCheckInFeed()` | `() => FeedEntry[]` | `GET /api/feed` — Historical check-in entries + watchdog alerts. |
| `submitCheckIn(text)` | `(text: string) => FeedEntry` | `POST /api/feed` with `{ body: text }` — Creates a new check-in entry. Should return the created entry with server-assigned `id` and `timestamp`. |

### Exported Constants

| Constant | Shape | Purpose |
|---|---|---|
| `AGENTS` | `Record<AgentId, { icon: string, name: string }>` | Agent display metadata (emoji + label). Used by WarRoomDrawer for color-coding and name display. Can remain client-side or be fetched as config. |

---

## Runtime Notes

- **SSR**: TanStack Start renders through Nitro. `server.ts` is the custom server entry (wraps SSR errors), `start.ts` registers CSRF + error middleware.
- **Path alias**: `@/` maps to `src/` (configured in `tsconfig.json` paths + vite-tsconfig-paths).
- **Package manager**: Bun (lockfile is `bun.lock`, config in `bunfig.toml`).
- **No client router besides TanStack Router**: Single route at `/`. The `routeTree.gen.ts` is auto-generated.
