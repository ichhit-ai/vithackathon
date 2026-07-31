"""
Project routes: initialization and status.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, HTTPException

from backend.config import settings
from backend.database import get_db, get_active_project
from backend.models import (
    ProjectInitRequest,
    ProjectInitResponse,
    ProjectStatus,
)

router = APIRouter(prefix="/api/project", tags=["project"])


@router.post("/init", response_model=ProjectInitResponse)
async def init_project(
    body: ProjectInitRequest, background_tasks: BackgroundTasks
):
    """Create a new project and kick off the council debate in the background."""
    now = datetime.now(timezone.utc)
    project_id = str(uuid.uuid4())
    deadline = now + timedelta(hours=body.hours)

    db = await get_db()
    try:
        await db.execute(
            """
            INSERT INTO projects (id, idea, hours, created_at, deadline_at, council_status)
            VALUES (?, ?, ?, ?, ?, 'running')
            """,
            (
                project_id,
                body.idea,
                body.hours,
                now.isoformat(),
                deadline.isoformat(),
            ),
        )
        for member in body.team:
            await db.execute(
                "INSERT INTO team_members (id, project_id, name, role) VALUES (?, ?, ?, ?)",
                (str(uuid.uuid4()), project_id, member.name, member.role),
            )
        await db.commit()
    finally:
        await db.close()

    # Launch council in background — imported lazily to avoid circular deps
    from backend.agents.council import convene_council

    background_tasks.add_task(convene_council, project_id, body)

    return ProjectInitResponse(projectId=project_id, councilStatus="running")


@router.get("/status", response_model=ProjectStatus)
async def get_project_status():
    """Return live countdown, readiness score, and watcher state."""
    db = await get_db()
    try:
        project = await get_active_project(db)
        if project is None:
            raise HTTPException(status_code=404, detail="No active project")

        now = datetime.now(timezone.utc)
        deadline = datetime.fromisoformat(project["deadline_at"])
        seconds_remaining = max(0, int((deadline - now).total_seconds()))

        # Readiness = percentage of milestones marked done
        cursor = await db.execute(
            "SELECT status FROM milestones WHERE project_id = ?",
            (project["id"],),
        )
        milestones = await cursor.fetchall()
        if milestones:
            done = sum(1 for m in milestones if m["status"] == "done")
            readiness = round((done / len(milestones)) * 100)
        else:
            readiness = 0

        # Watcher state
        watcher_last = project["watcher_last_seen"]
        if watcher_last:
            last_seen = datetime.fromisoformat(watcher_last)
            delta_seconds = (now - last_seen).total_seconds()
            watcher_active = delta_seconds < settings.watcher_active_window_seconds

            if delta_seconds < 60:
                label = "just now"
            elif delta_seconds < 3600:
                label = f"{int(delta_seconds // 60)} mins ago"
            else:
                label = f"{int(delta_seconds // 3600)}h ago"
        else:
            watcher_active = False
            label = "No activity yet"

        return ProjectStatus(
            secondsRemaining=seconds_remaining,
            readiness=readiness,
            watcherActive=watcher_active,
            lastActivityLabel=label,
        )
    finally:
        await db.close()
