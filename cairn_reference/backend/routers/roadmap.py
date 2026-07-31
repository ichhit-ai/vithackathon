"""
Roadmap routes: fetch milestones and toggle status.
"""

from __future__ import annotations

import json

from fastapi import APIRouter, HTTPException

from backend.database import get_db, get_active_project
from backend.models import Milestone, MilestoneUpdateRequest

router = APIRouter(prefix="/api", tags=["roadmap"])


@router.get("/roadmap", response_model=list[Milestone])
async def get_roadmap():
    """Return all milestones for the active project."""
    db = await get_db()
    try:
        project = await get_active_project(db)
        if project is None:
            raise HTTPException(status_code=404, detail="No active project")

        cursor = await db.execute(
            "SELECT id, window, title, description, status, assignees "
            "FROM milestones WHERE project_id = ? ORDER BY sort_order ASC",
            (project["id"],),
        )
        rows = await cursor.fetchall()
        return [
            Milestone(**{**dict(row), "assignees": json.loads(row["assignees"])})
            for row in rows
        ]
    finally:
        await db.close()


@router.patch("/roadmap/{milestone_id}", response_model=Milestone)
async def update_milestone(milestone_id: str, body: MilestoneUpdateRequest):
    """Toggle a milestone's status (done ↔ active ↔ pending)."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, window, title, description, status, assignees "
            "FROM milestones WHERE id = ?",
            (milestone_id,),
        )
        row = await cursor.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Milestone not found")

        await db.execute(
            "UPDATE milestones SET status = ? WHERE id = ?",
            (body.status.value, milestone_id),
        )
        await db.commit()

        updated = dict(row)
        updated["status"] = body.status.value
        updated["assignees"] = json.loads(updated["assignees"])
        return Milestone(**updated)
    finally:
        await db.close()
