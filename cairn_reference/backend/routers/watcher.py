"""
Watcher heartbeat webhook — receives pings from the filesystem daemon.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Response

from backend.database import get_db, get_active_project
from backend.models import HeartbeatRequest

router = APIRouter(prefix="/api/watcher", tags=["watcher"])


@router.post("/heartbeat", status_code=204)
async def receive_heartbeat(body: HeartbeatRequest):
    """Update watcher_last_seen on the active project.

    This is the cheapest possible write — a single UPDATE on one row.
    The daemon calls this after debouncing filesystem events.
    """
    db = await get_db()
    try:
        project = await get_active_project(db)
        if project is None:
            return Response(status_code=204)

        now = datetime.now(timezone.utc).isoformat()
        await db.execute(
            "UPDATE projects SET watcher_last_seen = ? WHERE id = ?",
            (now, project["id"]),
        )
        await db.commit()
    finally:
        await db.close()

    return Response(status_code=204)
