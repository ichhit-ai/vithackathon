"""
Check-in Feed routes: read feed and post updates.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from backend.database import get_db, get_active_project
from backend.models import FeedEntry, FeedPostRequest

router = APIRouter(prefix="/api", tags=["feed"])


@router.get("/feed", response_model=list[FeedEntry])
async def get_feed():
    """Return all feed entries (human check-ins + watchdog alerts) for the active project."""
    db = await get_db()
    try:
        project = await get_active_project(db)
        if project is None:
            raise HTTPException(status_code=404, detail="No active project")

        cursor = await db.execute(
            "SELECT id, kind, author, timestamp, body FROM feed_entries "
            "WHERE project_id = ? ORDER BY created_at ASC",
            (project["id"],),
        )
        rows = await cursor.fetchall()
        return [FeedEntry(**dict(row)) for row in rows]
    finally:
        await db.close()


@router.post("/feed", response_model=FeedEntry, status_code=201)
async def post_feed(body: FeedPostRequest):
    """Post a new check-in update from the user."""
    db = await get_db()
    try:
        project = await get_active_project(db)
        if project is None:
            raise HTTPException(status_code=404, detail="No active project")

        now = datetime.now(timezone.utc)
        entry_id = str(uuid.uuid4())
        display_time = now.strftime("%H:%M")

        await db.execute(
            "INSERT INTO feed_entries (id, project_id, kind, author, timestamp, body, created_at) "
            "VALUES (?, ?, 'update', 'You', ?, ?, ?)",
            (entry_id, project["id"], display_time, body.body, now.isoformat()),
        )
        await db.commit()

        return FeedEntry(
            id=entry_id,
            kind="update",
            author="You",
            timestamp=display_time,
            body=body.body,
        )
    finally:
        await db.close()
