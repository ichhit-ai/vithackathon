"""
Architect agent — technical feasibility analysis.
"""

from __future__ import annotations

from backend.agents.provider import llm_complete_json
from backend.agents.prompts import ARCHITECT_SYSTEM, format_briefing


async def run_architect(idea: str, hours: float, team: list[dict]) -> dict:
    """Evaluate the project idea and return feature analysis.

    Returns:
        dict with "verdict" (str) and "features" (list of dicts with
        title, bucket, rationale).
    """
    briefing = format_briefing(idea, hours, team)

    try:
        result = await llm_complete_json(ARCHITECT_SYSTEM, briefing)
    except Exception as exc:
        print(f"[architect] LLM call failed: {exc}")
        result = _fallback(idea, hours, team)

    # Validate minimal structure
    if "verdict" not in result or "features" not in result:
        result = _fallback(idea, hours, team)

    return result


def _fallback(idea: str, hours: float, team: list[dict]) -> dict:
    """Hardcoded fallback if the LLM fails."""
    return {
        "verdict": (
            f"With {hours}h and {len(team)} builders, focus on one core loop. "
            "Cut everything that isn't in the 3-minute demo."
        ),
        "features": [
            {"title": "Core feature loop", "bucket": "keep", "rationale": "This is the differentiator."},
            {"title": "Basic dashboard UI", "bucket": "keep", "rationale": "You need something to demo."},
            {"title": "Seed/demo data", "bucket": "keep", "rationale": "Guarantees a populated demo on stage."},
            {"title": "Authentication system", "bucket": "cut", "rationale": "Judges never log in. Hardcode a session."},
            {"title": "User settings page", "bucket": "cut", "rationale": "Nobody configures anything during a demo."},
            {"title": "Complex integrations", "bucket": "pivot", "rationale": "Mock the external service; demo the UX."},
        ],
    }
