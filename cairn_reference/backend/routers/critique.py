"""
Scope Critique route.
"""

from __future__ import annotations

import json

from fastapi import APIRouter, HTTPException

from backend.database import get_db, get_active_project
from backend.models import CritiqueCard

router = APIRouter(prefix="/api", tags=["critique"])


@router.get("/critique", response_model=list[CritiqueCard])
async def get_critique():
    """Return scope critique cards for the active project.

    Returns an empty list if the council hasn't finished yet (the
    frontend can poll until cards appear).
    """
    db = await get_db()
    try:
        project = await get_active_project(db)
        if project is None:
            raise HTTPException(status_code=404, detail="No active project")

        cursor = await db.execute(
            "SELECT id, bucket, title, rationale FROM critique_cards "
            "WHERE project_id = ? ORDER BY sort_order ASC",
            (project["id"],),
        )
        rows = await cursor.fetchall()
        return [CritiqueCard(**dict(row)) for row in rows]
    finally:
        await db.close()
