"""
Pitch Coach agent — demo narrative and slide structure.
"""

from __future__ import annotations

import json

from backend.agents.provider import llm_complete_json
from backend.agents.prompts import PITCH_COACH_SYSTEM, format_briefing


async def run_pitch_coach(
    idea: str,
    hours: float,
    team: list[dict],
    pragmatist_result: dict,
) -> dict:
    """Design a 3-minute pitch outline.

    Returns:
        dict with "verdict" (str) and "slides" (list of dicts with
        name, minutes, beats).
    """
    briefing = format_briefing(idea, hours, team)

    kept = [f for f in pragmatist_result.get("features", []) if f.get("bucket") == "keep"]
    milestones = pragmatist_result.get("milestones", [])

    context = (
        f"{briefing}\n\n"
        f"SURVIVING FEATURES (keep):\n"
        f"{json.dumps(kept, indent=2)}\n\n"
        f"MILESTONE ROADMAP:\n"
        f"{json.dumps(milestones, indent=2)}"
    )

    try:
        result = await llm_complete_json(PITCH_COACH_SYSTEM, context)
    except Exception as exc:
        print(f"[pitch_coach] LLM call failed: {exc}")
        result = _fallback()

    if "verdict" not in result or "slides" not in result:
        result = _fallback()

    return result


def _fallback() -> dict:
    """Standard 3-minute pitch structure."""
    return {
        "verdict": "Lead with the pain, demo the fix live, end on the ask. Three minutes flat.",
        "slides": [
            {
                "name": "Hook",
                "minutes": 0.5,
                "beats": [
                    "Open with the one-sentence problem.",
                    "Hold for two seconds. Let it land.",
                ],
            },
            {
                "name": "Problem",
                "minutes": 0.5,
                "beats": [
                    "Name the failure mode everyone in the room has felt.",
                    "Quantify the cost if you can.",
                ],
            },
            {
                "name": "Architecture",
                "minutes": 0.5,
                "beats": [
                    "One diagram. Maximum three boxes.",
                    "Say why your approach is different in one sentence.",
                ],
            },
            {
                "name": "Demo Flow",
                "minutes": 1.0,
                "beats": [
                    "Walk through the core loop live.",
                    "Trigger the key moment the judges will remember.",
                ],
            },
            {
                "name": "Ask",
                "minutes": 0.5,
                "beats": [
                    "State what you need (users, funding, mentorship).",
                    "End on the strongest visual.",
                ],
            },
        ],
    }
