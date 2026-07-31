"""
War Room (Council) routes: log retrieval and SSE stream.
"""

from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, HTTPException, Query, Request
from sse_starlette.sse import EventSourceResponse

from backend.database import get_db, get_active_project
from backend.models import WarRoomLog

router = APIRouter(prefix="/api/warroom", tags=["warroom"])


@router.get("/logs", response_model=list[WarRoomLog])
async def get_war_room_logs():
    """Return all war room logs for the active project."""
    db = await get_db()
    try:
        project = await get_active_project(db)
        if project is None:
            raise HTTPException(status_code=404, detail="No active project")

        cursor = await db.execute(
            "SELECT id, agent, timestamp, message FROM war_room_logs "
            "WHERE project_id = ? ORDER BY created_at ASC",
            (project["id"],),
        )
        rows = await cursor.fetchall()
        return [WarRoomLog(**dict(row)) for row in rows]
    finally:
        await db.close()


@router.get("/stream")
async def stream_war_room(request: Request, after: str = Query(default="")):
    """SSE endpoint — pushes new war room logs as they arrive.

    The client can pass ?after=<last_log_id> to only receive logs
    created after a known point (reconnection resilience).
    """

    async def event_generator():
        last_id = after
        while True:
            if await request.is_disconnected():
                break

            db = await get_db()
            try:
                project = await get_active_project(db)
                if project is None:
                    await asyncio.sleep(2)
                    continue

                if last_id:
                    # Get the created_at of the cursor log
                    cursor = await db.execute(
                        "SELECT created_at FROM war_room_logs WHERE id = ?",
                        (last_id,),
                    )
                    ref = await cursor.fetchone()
                    if ref:
                        cursor = await db.execute(
                            "SELECT id, agent, timestamp, message FROM war_room_logs "
                            "WHERE project_id = ? AND created_at > ? ORDER BY created_at ASC",
                            (project["id"], ref["created_at"]),
                        )
                    else:
                        cursor = await db.execute(
                            "SELECT id, agent, timestamp, message FROM war_room_logs "
                            "WHERE project_id = ? ORDER BY created_at ASC",
                            (project["id"],),
                        )
                else:
                    cursor = await db.execute(
                        "SELECT id, agent, timestamp, message FROM war_room_logs "
                        "WHERE project_id = ? ORDER BY created_at ASC",
                        (project["id"],),
                    )

                rows = await cursor.fetchall()
                for row in rows:
                    log = WarRoomLog(**dict(row))
                    last_id = log.id
                    yield {
                        "event": "log",
                        "id": log.id,
                        "data": log.model_dump_json(by_alias=True),
                    }
            finally:
                await db.close()

            await asyncio.sleep(2)

    return EventSourceResponse(event_generator())
