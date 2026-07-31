"""
Cairn backend — FastAPI application factory.

Wires up CORS, database initialization, the autonomy background loop,
and all API routers.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import init_db
from backend.autonomy.heartbeat import autonomy_loop

from backend.routers import project, council, critique, roadmap, pitch, feed, watcher


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB + launch autonomy loop. Shutdown: cancel loop."""
    await init_db()
    loop_task = asyncio.create_task(autonomy_loop())
    print("[cairn] Database initialized")
    print(f"[cairn] Autonomy loop started (interval={settings.autonomy_interval_seconds}s)")
    print(f"[cairn] LLM provider: {settings.llm_provider} / {settings.llm_model}")
    yield
    loop_task.cancel()
    try:
        await loop_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Cairn",
    description="Hackathon Mission Control & Coaching Companion — Backend API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(project.router)
app.include_router(council.router)
app.include_router(critique.router)
app.include_router(roadmap.router)
app.include_router(pitch.router)
app.include_router(feed.router)
app.include_router(watcher.router)


@app.get("/api/health")
async def health():
    """Simple health check."""
    return {"status": "ok", "provider": settings.llm_provider, "model": settings.llm_model}
