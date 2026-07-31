"""
Autonomy loop — the heartbeat that makes Cairn agentic.

Runs as an asyncio background task during FastAPI's lifespan. Every tick,
it evaluates project state against deadlines and generates proactive
watchdog alerts without user interaction.
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone

from backend.config import settings
from backend.database import get_db, get_active_project


async def autonomy_loop() -> None:
    """Main loop — runs indefinitely, sleeping between ticks."""
    while True:
        try:
            db = await get_db()
            try:
                project = await get_active_project(db)
                if project and project["council_status"] == "done":
                    await _check_watcher_inactivity(db, project)
                    await _check_milestone_drift(db, project)
                    await _check_deadline_warning(db, project)
            finally:
                await db.close()
        except Exception as exc:
            # Never crash the loop — log and continue
            print(f"[autonomy] tick error: {exc}")

        await asyncio.sleep(settings.autonomy_interval_seconds)


async def _recent_alert_exists(
    db, project_id: str, keyword: str, cooldown_minutes: int
) -> bool:
    """Check if an alert containing `keyword` was posted within the cooldown window."""
    cursor = await db.execute(
        "SELECT created_at FROM feed_entries "
        "WHERE project_id = ? AND kind = 'alert' AND body LIKE ? "
        "ORDER BY created_at DESC LIMIT 1",
        (project_id, f"%{keyword}%"),
    )
    row = await cursor.fetchone()
    if row is None:
        return False

    last = datetime.fromisoformat(row["created_at"])
    delta = (datetime.now(timezone.utc) - last).total_seconds()
    return delta < cooldown_minutes * 60


async def _insert_alert(db, project_id: str, body: str) -> None:
    """Insert a watchdog alert into the feed."""
    now = datetime.now(timezone.utc)
    await db.execute(
        "INSERT INTO feed_entries (id, project_id, kind, author, timestamp, body, created_at) "
        "VALUES (?, ?, 'alert', 'Cairn Watchdog', ?, ?, ?)",
        (
            str(uuid.uuid4()),
            project_id,
            now.strftime("%H:%M"),
            body,
            now.isoformat(),
        ),
    )
    await db.commit()


async def _check_watcher_inactivity(db, project: dict) -> None:
    """Alert if the filesystem watcher hasn't pinged in too long."""
    last_seen = project.get("watcher_last_seen")
    if not last_seen:
        return

    delta_minutes = (
        datetime.now(timezone.utc) - datetime.fromisoformat(last_seen)
    ).total_seconds() / 60

    if delta_minutes < settings.inactivity_threshold_minutes:
        return

    if await _recent_alert_exists(
        db, project["id"], "No code saved", settings.alert_cooldown_minutes
    ):
        return

    await _insert_alert(
        db,
        project["id"],
        f"⚠️ Warning: No code saved in {int(delta_minutes)}m. "
        "Is the current task blocked or parked?",
    )


async def _check_milestone_drift(db, project: dict) -> None:
    """Alert if an active milestone block is falling behind schedule."""
    now = datetime.now(timezone.utc)
    created = datetime.fromisoformat(project["created_at"])
    total_hours = project["hours"]
    elapsed_hours = (now - created).total_seconds() / 3600

    cursor = await db.execute(
        "SELECT id, window, title, status, sort_order FROM milestones "
        "WHERE project_id = ? ORDER BY sort_order ASC",
        (project["id"],),
    )
    milestones = await cursor.fetchall()
    if not milestones:
        return

    total = len(milestones)
    done = sum(1 for m in milestones if m["status"] == "done")

    # Find the currently active block
    active = [m for m in milestones if m["status"] == "active"]
    if not active:
        return

    current = active[0]
    # Estimate: each block gets an equal slice of total hours
    block_duration = total_hours / total
    block_index = current["sort_order"]
    block_start = block_duration * block_index
    block_elapsed_fraction = (
        (elapsed_hours - block_start) / block_duration if block_duration > 0 else 0
    )

    if block_elapsed_fraction < 0.6:
        return

    if await _recent_alert_exists(
        db, project["id"], "slip risk", settings.alert_cooldown_minutes
    ):
        return

    pct = int(block_elapsed_fraction * 100)
    await _insert_alert(
        db,
        project["id"],
        f"⚠️ {current['window']} block is {pct}% elapsed with "
        f"{done}/{total} subtasks closed. Roadmap slip risk: high.",
    )


async def _check_deadline_warning(db, project: dict) -> None:
    """Alert if under 1 hour remains with low readiness."""
    now = datetime.now(timezone.utc)
    deadline = datetime.fromisoformat(project["deadline_at"])
    remaining = (deadline - now).total_seconds()

    if remaining > 3600:
        return

    cursor = await db.execute(
        "SELECT status FROM milestones WHERE project_id = ?",
        (project["id"],),
    )
    milestones = await cursor.fetchall()
    if not milestones:
        return

    done = sum(1 for m in milestones if m["status"] == "done")
    readiness = round((done / len(milestones)) * 100)

    if readiness >= 70:
        return

    if await _recent_alert_exists(
        db, project["id"], "Under 1 hour", settings.alert_cooldown_minutes
    ):
        return

    await _insert_alert(
        db,
        project["id"],
        f"⚠️ Under 1 hour remaining with readiness at {readiness}%. "
        "Focus on the demo path only.",
    )
