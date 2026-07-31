"""
SQLite database layer using aiosqlite.

Provides async connection management, schema initialization, and
low-level CRUD helpers. Every table mirrors a frontend data type from
cairn-mock.ts.
"""

from __future__ import annotations

import aiosqlite
from pathlib import Path

from backend.config import settings

_SCHEMA = """
CREATE TABLE IF NOT EXISTS projects (
    id              TEXT PRIMARY KEY,
    idea            TEXT NOT NULL,
    hours           REAL NOT NULL,
    created_at      TEXT NOT NULL,
    deadline_at     TEXT NOT NULL,
    watcher_last_seen TEXT,
    council_status  TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS team_members (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    role        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS milestones (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    window      TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',
    assignees   TEXT NOT NULL DEFAULT '[]',
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS critique_cards (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    bucket      TEXT NOT NULL,
    title       TEXT NOT NULL,
    rationale   TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pitch_slides (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    minutes     REAL NOT NULL,
    beats       TEXT NOT NULL DEFAULT '[]',
    sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS war_room_logs (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agent       TEXT NOT NULL,
    timestamp   TEXT NOT NULL,
    message     TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feed_entries (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL,
    author      TEXT NOT NULL,
    timestamp   TEXT NOT NULL,
    body        TEXT NOT NULL,
    created_at  TEXT NOT NULL
);
"""


async def get_db() -> aiosqlite.Connection:
    """Open a connection to the SQLite database.

    Callers are responsible for closing the connection (or using it as
    an async context manager).
    """
    db_path = Path(settings.db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    db = await aiosqlite.connect(str(db_path))
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    return db


async def init_db() -> None:
    """Create all tables if they don't already exist."""
    db = await get_db()
    try:
        await db.executescript(_SCHEMA)
        await db.commit()
    finally:
        await db.close()


async def get_active_project(db: aiosqlite.Connection) -> dict | None:
    """Return the most recently created project, or None."""
    cursor = await db.execute(
        "SELECT * FROM projects ORDER BY created_at DESC LIMIT 1"
    )
    row = await cursor.fetchone()
    if row is None:
        return None
    return dict(row)
