# 🪨 Cairn

<div align="center">

![Cairn Header Banner](https://img.shields.io/badge/CAIRN-Autonomous%20Hackathon%20Mission%20Control-10b981?style=for-the-badge&logo=rocket&logoColor=white)

**Autonomous Hackathon Project Mentor & Real-Time Mission-Control Watchdog**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-f97316.svg?style=flat-square&logo=speedtest&logoColor=white)](https://groq.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-8e44ad.svg?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-Zero--Config-003B57.svg?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

*Cairn critiques project scope, locks an hourly milestone roadmap, monitors local file save activity in real time, and alerts hackathon teams the moment progress slips.*

[📖 Read Operator Guide (HOW_IT_WORKS.md)](./HOW_IT_WORKS.md) • [🚀 Quick Start](#-quick-start) • [🏗️ Architecture](#%EF%B8%8F-system-architecture) • [✨ Features](#-key-features)

---

</div>

## 🌟 Overview

During hackathons, **80% of teams fail or present half-baked demos** due to scope creep, loss of time awareness, or uncoordinated pitching. 

**Cairn solves this.** It acts as an aggressive, AI-powered mentorship council and real-time watchdog that:
1. **Slashes bloated scope** into a lean 2-hour build plan.
2. **Monitors source code saves** (`.py`, `.tsx`, `.css`) in the background.
3. **Calculates live Demo Readiness (0% ➔ 100%)** as milestones are checked off.
4. **Fires autonomous warnings** if no code is saved for 45 minutes.
5. **Generates slide-by-slide pitch outlines** tailored for hackathon judges.

---

## ⚡ Key Features

| Feature | Description | Icon |
| :--- | :--- | :---: |
| **Multi-Agent AI Council** | Concurrently runs 3 specialized agents (**Architect**, **Scope Slasher**, **Pitch Coach**) to critique project feasibility. | 🤖 |
| **Provider Fallback Cascade** | Auto-rotates across **Groq**, **Gemini**, **OpenRouter**, and **Ollama** with zero downtime if APIs fail. | ⚡ |
| **Realtime Watchdog Daemon** | Lightweight background process that monitors filesystem saves with 5-second debouncing. | 👁️ |
| **Autonomous Heartbeat Loop** | Background task running every 60s to detect code inactivity, milestone drift, and deadline pressure. | 💓 |
| **War Room SSE Log Terminal** | Live-streams AI council deliberation logs to the dashboard via Server-Sent Events. | 📟 |
| **Multi-Device Team Sync** | Allows entire teams to view and update the same dashboard over local Wi-Fi. | 📱 |

---

## 🏗️ System Architecture

```
                                  ┌───────────────────────────────┐
                                  │   React / Vite Dashboard UI   │
                                  │    (Polling & SSE Stream)     │
                                  └───────────────┬───────────────┘
                                                  │
                                   HTTP REST / SSE│  Heartbeat (204)
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ FastAPI Local Backend Service                                                           │
│                                                                                         │
│  ┌─────────────────────────┐  ┌────────────────────────────────┐  ┌───────────────────┐ │
│  │   REST API Routers      │  │    Multi-Agent LLM Council     │  │  Autonomy Loop    │ │
│  │  (/project, /roadmap,   │  │  (Architect, Scope Slasher,    │  │  (60s Inactivity  │ │
│  │   /feed, /status)       │  │   Pitch Coach)                 │  │   Alert Trigger)  │ │
│  └────────────┬────────────┘  └───────────────┬────────────────┘  └─────────┬─────────┘ │
└───────────────┼───────────────────────────────┼─────────────────────────────┼───────────┘
                │                               │                             │
                ▼                               ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ SQLite Database Engine (backend/cairn.db)                                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                                ▲
                                                │ File Save Event (heartbeat)
                                 ┌──────────────┴──────────────┐
                                 │ Local Watcher Daemon        │
                                 │ (Watchfiles Python Daemon)  │
                                 └──────────────┬──────────────┘
                                                │
                                                ▼
                                 ┌─────────────────────────────┐
                                 │ Hackathon Code Repository   │
                                 │ (.py, .ts, .tsx, .css, etc) │
                                 └─────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone repository
git clone https://github.com/njd07/Cairn.git
cd Cairn

# Create & load environment settings
cp .env.example .env
```

Add your free API key in `.env`:
```ini
GROQ_API_KEY=gsk_your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
CAIRN_LLM_PROVIDER=groq
```

---

### 2. Start Services

Open **3 terminal windows**:

#### 🟢 Terminal 1: Backend Server (FastAPI)
```bash
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 🟢 Terminal 2: File Watcher Daemon
```bash
source .venv/bin/activate
python -m backend.watcher.daemon --path .
```

#### 🟢 Terminal 3: Dashboard Web UI (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:8080`** in your browser!

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, Asyncio, Pydantic v2
- **Database**: SQLite (Zero-config local file DB)
- **Inference Engines**: Groq (`llama-3.3-70b-versatile`), Google Gemini (`gemini-2.0-flash`), OpenRouter, Ollama
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, SSE (`sse-starlette`)
- **FileSystem Watcher**: `watchfiles` / `watchdog` Python library

---

## 📖 Detailed Guides

- [**Full How It Works & Operator Guide (HOW_IT_WORKS.md)**](./HOW_IT_WORKS.md) — Comprehensive guide covering agent roles, team workflow, multi-device network setup, and deployment.

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

<div align="center">
  <sub>Built with ❤️ for hackathon builders everywhere. Ship your project on time!</sub>
</div>
