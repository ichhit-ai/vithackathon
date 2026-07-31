# 🪨 Cairn — How It Works & Full Operator Guide

Welcome to **Cairn**! This guide explains the complete architecture, inner workings, and step-by-step instructions so anyone on your hackathon team can run, understand, and demo Cairn.

---

## 🎯 What is Cairn?

During hackathons, **80% of teams fail or present incomplete demos** for three main reasons:
1. **Scope Creep**: Over-promising complex features (GUIs, DBs, Auth) that take too long to build.
2. **Loss of Time Awareness**: Spending 4 hours debugging minor UI bugs while core backend logic remains unbuilt.
3. **Weak Pitch Prep**: Rushing presentation slides 10 minutes before judging.

**Cairn is your autonomous mission-control watchdog.** It acts as an aggressive AI mentor team that cuts your scope down to a realistic 2-to-4 hour build, tracks your file save activity in real time, and alerts you the moment your progress slips.

---

## 🧠 The 3-Agent AI Mentorship Council

When you submit your project idea and team roles, Cairn launches a concurrent multi-agent council powered by high-speed LLMs (Groq `llama-3.3-70b-versatile` & Gemini `gemini-2.0-flash`):

```
                       ┌───────────────────────────────┐
                       │  INTAKE: Project Idea & Roles │
                       └───────────────┬───────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
 ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
 │ 🏗️ THE ARCHITECT    │    │ ⚔️ SCOPE SLASHER    │    │ 📢 PITCH COACH      │
 │ Evaluates time vs.  │    │ Ruthlessly cuts 60% │    │ Builds a slide-by-  │
 │ team capacity & UI  │    │ of bloat to keep    │    │ slide 3-min pitch   │
 │ technical feasibility│   │ only demo essentials│    │ script for judges   │
 └──────────┬──────────┘    └──────────┬──────────┘    └──────────┬──────────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │   LOCKED MILESTONE ROADMAP    │
                       │   & DEMO READINESS SCORE (0%) │
                       └───────────────────────────────┘
```

### 1. 🏗️ The Architect
- Analyzes your project complexity against your strict time budget (e.g. 2 hours) and team composition.
- Issues a clear, realistic verdict on what technical architecture can survive the time limit.

### 2. ⚔️ The Scope Slasher
- Categorizes all project features into **3 strict lists**:
  - 🟢 **KEEP / MUST HAVE**: Features vital for a working judge demo.
  - 🔴 **CUT IMMEDIATELY**: Bloat features (Auth, Settings pages, complex DB schemas) that will kill your deadline.
  - 🟠 **SMART PIVOT**: Clever simplifications (e.g. hardcoding seed data instead of building a live API scraper).

### 3. 📢 Pitch Coach
- Automatically formats your project narrative into a 5-slide, 3-minute pitch outline:
  - **Slide 1**: Hook & Problem
  - **Slide 2**: Solution & Key Innovation
  - **Slide 3**: Live Demo Walkthrough
  - **Slide 4**: Tech Stack & Architecture
  - **Slide 5**: Next Steps & Closing Ask

---

## 👁️ Real-Time Watchdog Daemon

Cairn does **not** rely on self-reporting or manual timers. It includes a lightweight background watcher daemon (`python -m backend.watcher.daemon`).

```
 Developer saves code (Ctrl+S) ──> Watcher Daemon ──> POST /api/watcher/heartbeat ──> DB updated ──> Dashboard turns Green 🟢
```

1. You point the daemon at your project folder:
   ```bash
   python -m backend.watcher.daemon --path /path/to/your/hackathon/repo
   ```
2. The daemon watches all source files (`.py`, `.ts`, `.tsx`, `.html`, `.css`, `.go`, `.rs`, `.sql`, etc.).
3. When you press `Ctrl + S`, the daemon debounces the save event and posts an HTTP heartbeat (`204 No Content`) to the backend.
4. The dashboard header instantly pulses **`🟢 WATCHER: ACTIVE`** and updates the timestamp (`Watcher active — just now`).

### 🤖 The Autonomous Heartbeat (Autonomy Loop)
Every 60 seconds, Cairn's background service checks your repo activity:
- **Active State**: File saves detected within 2 minutes ➔ System status is Healthy.
- **Inactivity Warning**: If no file saves are detected for **45 minutes**, Cairn automatically posts an **Amber Warning Alert** to your feed:
  > *"⚠️ Warning: No code saves detected in 45m on active block. Is the schema blocked?"*

---

## 🚀 Step-by-Step Operator Guide

Anyone can get Cairn up and running in **under 2 minutes** with these steps:

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- A Groq API key or Gemini API key (Free tier keys work!)

---

### Step 1: Clone & Configure Environment

```bash
git clone https://github.com/njd07/Cairn.git
cd Cairn

# Copy environment template
cp .env.example .env
```

Open `.env` in your text editor and insert your API key:
```ini
GROQ_API_KEY=gsk_your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
CAIRN_LLM_PROVIDER=groq
```

---

### Step 2: Start the 3 Terminal Services

#### Terminal 1 — Backend API (FastAPI + SQLite)
```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies (first time only)
pip install -r backend/requirements.txt

# Start backend server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 2 — Watcher Daemon
```bash
source .venv/bin/activate

# Point to the code directory you are building
python -m backend.watcher.daemon --path .
```

#### Terminal 3 — React Frontend (Vite)
```bash
cd frontend

# Install packages (first time only)
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:8080` in your browser!

---

## 📱 Multi-Device & Team Sync Over Wi-Fi

Cairn allows your whole team to see the same live dashboard during the hackathon:

1. **Find your Local IP Address**: When Vite starts Terminal 3, it displays:
   `➜ Network: http://10.27.213.122:8080/`
2. **Connect Teammate Laptops or Phones**: Any teammate connected to the same Wi-Fi network can open `http://10.27.213.122:8080/` on their browser or phone.
3. **Live Sync (3s Polling)**: When anyone checks off a milestone or posts a progress note, all connected devices update within 3 seconds automatically!

---

## ⚡ Multi-Provider LLM Fallback Cascade

Cairn is engineered with zero-downtime resilience for high-stress hackathons. If an API provider experiences rate limits or outages, Cairn automatically pivots:

```
┌──────────────┐   Fail / Rate Limit   ┌──────────────┐   Fail / Outage   ┌───────────────────┐
│ ⚡ Groq       │ ───────────────────> │ ♊ Gemini     │ ───────────────> │ 🌐 OpenRouter     │
│ (Llama 70B)  │                      │ (2.0 Flash)  │                  │ (Gemma / Flash)   │
└──────────────┘                      └──────────────┘                  └───────────────────┘
```

If all external APIs fail, Cairn falls back open to structured fallback roadmaps so your team is never blocked.

---

## 🛠️ Troubleshooting & FAQs

### Q1: The War Room log streaming stops or lags.
- Refresh the web browser tab. The dashboard fetches the latest database logs automatically upon reload.

### Q2: The Watcher says "Target API un-reachable".
- Ensure Terminal 1 (`uvicorn backend.main:app`) is running on port 8000 before starting the watcher in Terminal 2.

### Q3: How do I reset for a new project briefing?
- Click the **"New Briefing"** button in the top navigation bar. Confirm the warning prompt to start a fresh council deliberation.
