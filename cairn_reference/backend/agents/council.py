"""
Council orchestrator — fans out to three agents, synthesizes results,
and writes everything to the database.

This runs as a BackgroundTask triggered by POST /api/project/init.
Each agent's verdict is logged to the war room as it completes,
giving the frontend SSE stream a natural "debate" cadence.
"""

from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime, timezone

from backend.database import get_db
from backend.models import ProjectInitRequest
from backend.agents.architect import run_architect
from backend.agents.pragmatist import run_pragmatist
from backend.agents.pitch_coach import run_pitch_coach


async def convene_council(project_id: str, briefing: ProjectInitRequest) -> None:
    """Run the full council pipeline and persist all results.

    This function is called in a BackgroundTask — it must not raise
    unhandled exceptions.
    """
    team_dicts = [{"name": m.name, "role": m.role} for m in briefing.team]
    log_counter = 0

    async def log_to_war_room(
        agent: str, message: str, *, delay: float = 0.0
    ) -> None:
        """Insert a war room log entry with an optional delay for cadence."""
        nonlocal log_counter
        if delay > 0:
            await asyncio.sleep(delay)

        log_counter += 1
        now = datetime.now(timezone.utc)
        display_ts = now.strftime("%H:%M:%S")

        db = await get_db()
        try:
            await db.execute(
                "INSERT INTO war_room_logs (id, project_id, agent, timestamp, message, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), project_id, agent, display_ts, message, now.isoformat()),
            )
            await db.commit()
        finally:
            await db.close()

    try:
        # --- Phase 1: Opening ---
        team_count = len(briefing.team)
        hours = briefing.hours
        await log_to_war_room(
            "master",
            f"Council convened. Reading intake briefing — {hours}h on the clock, "
            f"{team_count} builder{'s' if team_count != 1 else ''}.",
        )

        # --- Phase 2: Architect ---
        await asyncio.sleep(1.5)  # Breathing room for SSE clients
        architect_result = await run_architect(briefing.idea, hours, team_dicts)
        await log_to_war_room("architect", architect_result["verdict"], delay=1.0)

        # --- Phase 3: Pragmatist ---
        pragmatist_result = await run_pragmatist(
            briefing.idea, hours, team_dicts, architect_result
        )
        await log_to_war_room("slasher", pragmatist_result["verdict"], delay=1.5)

        # --- Phase 4: Pitch Coach ---
        pitch_result = await run_pitch_coach(
            briefing.idea, hours, team_dicts, pragmatist_result
        )
        await log_to_war_room("pitch", pitch_result["verdict"], delay=1.5)

        # --- Phase 5: Persist structured data ---
        db = await get_db()
        try:
            # Critique cards (from pragmatist's feature triage)
            features = pragmatist_result.get("features", [])
            for i, feat in enumerate(features):
                await db.execute(
                    "INSERT INTO critique_cards (id, project_id, bucket, title, rationale, sort_order) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        str(uuid.uuid4()),
                        project_id,
                        feat.get("bucket", "cut"),
                        feat.get("title", "Untitled"),
                        feat.get("rationale", ""),
                        _bucket_sort_key(feat.get("bucket", "cut")) * 100 + i,
                    ),
                )

            # Milestones (from pragmatist)
            milestones = pragmatist_result.get("milestones", [])
            for i, ms in enumerate(milestones):
                await db.execute(
                    "INSERT INTO milestones (id, project_id, window, title, description, status, assignees, sort_order) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        str(uuid.uuid4()),
                        project_id,
                        ms.get("window", f"Block {i+1}"),
                        ms.get("title", "Untitled"),
                        ms.get("description", ""),
                        ms.get("status", "pending"),
                        json.dumps(ms.get("assignees", [])),
                        i,
                    ),
                )

            # Pitch slides (from pitch coach)
            slides = pitch_result.get("slides", [])
            for i, slide in enumerate(slides):
                await db.execute(
                    "INSERT INTO pitch_slides (id, project_id, name, minutes, beats, sort_order) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        str(uuid.uuid4()),
                        project_id,
                        slide.get("name", f"Slide {i+1}"),
                        slide.get("minutes", 0.5),
                        json.dumps(slide.get("beats", [])),
                        i,
                    ),
                )

            # Mark council as done
            await db.execute(
                "UPDATE projects SET council_status = 'done' WHERE id = ?",
                (project_id,),
            )
            await db.commit()
        finally:
            await db.close()

        # --- Phase 6: Closing ruling ---
        kept = len([f for f in features if f.get("bucket") == "keep"])
        total = len(features)
        await log_to_war_room(
            "master",
            f"Ruling: {kept} features survive out of {total}. "
            f"Roadmap locked at {len(milestones)} blocks. Ship the demo.",
            delay=2.0,
        )

    except Exception as exc:
        print(f"[council] fatal error: {exc}")
        # Mark council as done even on failure so the frontend isn't stuck
        db = await get_db()
        try:
            await db.execute(
                "UPDATE projects SET council_status = 'done' WHERE id = ?",
                (project_id,),
            )
            await db.commit()
        finally:
            await db.close()

        await log_to_war_room(
            "master",
            "Council encountered an error. Falling back to default roadmap.",
        )


def _bucket_sort_key(bucket: str) -> int:
    """Ensure keep < cut < pivot ordering."""
    return {"keep": 0, "cut": 1, "pivot": 2}.get(bucket, 3)
