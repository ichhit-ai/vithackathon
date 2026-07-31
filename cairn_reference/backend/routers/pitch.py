"""
Pitch Outline route.
"""

from __future__ import annotations

import json

from fastapi import APIRouter, HTTPException

from backend.database import get_db, get_active_project
from backend.models import PitchSlide

router = APIRouter(prefix="/api", tags=["pitch"])


@router.get("/pitch", response_model=list[PitchSlide])
async def get_pitch():
    """Return pitch slides for the active project."""
    db = await get_db()
    try:
        project = await get_active_project(db)
        if project is None:
            raise HTTPException(status_code=404, detail="No active project")

        cursor = await db.execute(
            "SELECT id, name, minutes, beats FROM pitch_slides "
            "WHERE project_id = ? ORDER BY sort_order ASC",
            (project["id"],),
        )
        rows = await cursor.fetchall()
        return [
            PitchSlide(**{**dict(row), "beats": json.loads(row["beats"])})
            for row in rows
        ]
    finally:
        await db.close()
