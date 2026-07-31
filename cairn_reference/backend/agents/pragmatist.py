"""
Pragmatist (Scope Slasher) agent — ruthless feature triage + roadmap.
"""

from __future__ import annotations

import json
import math

from backend.agents.provider import llm_complete_json
from backend.agents.prompts import PRAGMATIST_SYSTEM, format_briefing


async def run_pragmatist(
    idea: str,
    hours: float,
    team: list[dict],
    architect_result: dict,
) -> dict:
    """Re-evaluate features and produce a milestone roadmap.

    Returns:
        dict with "verdict" (str), "features" (list), and "milestones" (list).
    """
    briefing = format_briefing(idea, hours, team)
    context = (
        f"{briefing}\n\n"
        f"ARCHITECT'S ANALYSIS:\n"
        f"Verdict: {architect_result.get('verdict', 'N/A')}\n"
        f"Features: {json.dumps(architect_result.get('features', []), indent=2)}"
    )

    try:
        result = await llm_complete_json(PRAGMATIST_SYSTEM, context)
    except Exception as exc:
        print(f"[pragmatist] LLM call failed: {exc}")
        result = _fallback(hours, team, architect_result)

    if "verdict" not in result or "features" not in result or "milestones" not in result:
        result = _fallback(hours, team, architect_result)

    return result


def _fallback(hours: float, team: list[dict], architect_result: dict) -> dict:
    """Generate a reasonable roadmap from the architect's features."""
    features = architect_result.get("features", [])
    if not features:
        features = [
            {"title": "Core feature", "bucket": "keep", "rationale": "Ship the minimum."},
            {"title": "Polish", "bucket": "cut", "rationale": "Demo first, polish never."},
        ]

    names = [m["name"] for m in team] if team else ["Builder"]
    block_count = min(6, max(4, math.ceil(hours / 2)))
    block_hours = hours / block_count

    milestones = []
    for i in range(block_count):
        start = round(block_hours * i)
        end = round(block_hours * (i + 1))
        if i == 0:
            title, desc = "Skeleton + contracts", "Routes and payload shapes agreed before code branches."
        elif i == block_count - 1:
            title, desc = "Rehearse the demo", "Three clean passes. Hands off the keyboard after the second."
        elif i == block_count - 2:
            title, desc = "Seed demo data", "Deterministic fixtures for the stage run."
        else:
            title, desc = f"Build block {i}", "Implement core features for this window."

        milestones.append({
            "window": f"Hours {start}–{end}",
            "title": title,
            "description": desc,
            "status": "pending",
            "assignees": [names[i % len(names)]],
        })

    return {
        "verdict": f"Cut to {len([f for f in features if f['bucket'] == 'keep'])} features. Ship a demo or ship nothing.",
        "features": features,
        "milestones": milestones,
    }
