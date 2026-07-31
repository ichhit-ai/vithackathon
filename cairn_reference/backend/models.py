"""
Pydantic models for API request/response schemas.

Every response model mirrors a TypeScript type from the frontend's
cairn-mock.ts — field names use camelCase via model_config to match
the frontend JSON contract exactly.
"""

from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


# ---------- Enums ----------

class AgentId(str, Enum):
    architect = "architect"
    slasher = "slasher"
    pitch = "pitch"
    master = "master"


class CritiqueBucket(str, Enum):
    keep = "keep"
    cut = "cut"
    pivot = "pivot"


class MilestoneStatus(str, Enum):
    done = "done"
    active = "active"
    pending = "pending"


class FeedKind(str, Enum):
    update = "update"
    alert = "alert"


# ---------- Response Models ----------

class ProjectStatus(BaseModel):
    """GET /api/project/status — CommandBar props."""
    seconds_remaining: int = Field(alias="secondsRemaining")
    readiness: int
    watcher_active: bool = Field(alias="watcherActive")
    last_activity_label: str = Field(alias="lastActivityLabel")

    model_config = {"populate_by_name": True, "by_alias": True}


class WarRoomLog(BaseModel):
    """GET /api/warroom/logs — WarRoomDrawer entries."""
    id: str
    agent: AgentId
    timestamp: str
    message: str

    model_config = {"populate_by_name": True, "by_alias": True}


class CritiqueCard(BaseModel):
    """GET /api/critique — ScopeCritique cards."""
    id: str
    bucket: CritiqueBucket
    title: str
    rationale: str

    model_config = {"populate_by_name": True, "by_alias": True}


class Milestone(BaseModel):
    """GET /api/roadmap — MilestoneRoadmap entries."""
    id: str
    window: str
    title: str
    description: str
    status: MilestoneStatus
    assignees: list[str]

    model_config = {"populate_by_name": True, "by_alias": True}


class PitchSlide(BaseModel):
    """GET /api/pitch — PitchOutline entries."""
    id: str
    name: str
    minutes: float
    beats: list[str]

    model_config = {"populate_by_name": True, "by_alias": True}


class FeedEntry(BaseModel):
    """GET /api/feed — CheckInFeed entries."""
    id: str
    kind: FeedKind
    author: str
    timestamp: str
    body: str

    model_config = {"populate_by_name": True, "by_alias": True}


# ---------- Request Models ----------

class TeamMemberInput(BaseModel):
    name: str
    role: str


class ProjectInitRequest(BaseModel):
    """POST /api/project/init — IntakeBriefing from the form."""
    idea: str
    hours: float
    team: list[TeamMemberInput]


class ProjectInitResponse(BaseModel):
    """POST /api/project/init — Response."""
    project_id: str = Field(alias="projectId")
    council_status: str = Field(alias="councilStatus")

    model_config = {"populate_by_name": True, "by_alias": True}


class FeedPostRequest(BaseModel):
    """POST /api/feed — New check-in from the user."""
    body: str


class MilestoneUpdateRequest(BaseModel):
    """PATCH /api/roadmap/{id} — Toggle milestone status."""
    status: MilestoneStatus


class HeartbeatRequest(BaseModel):
    """POST /api/watcher/heartbeat — From the filesystem daemon."""
    file: str = ""
    event: str = "modified"
