"""SQLite audit log. Every search is recorded; blocked input text is never stored."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    detective_id TEXT NOT NULL,
    query_json TEXT,
    config_version TEXT,
    embedder TEXT,
    n_results INTEGER,
    outcome TEXT NOT NULL,
    listing_ids TEXT
)"""


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


class AuditLog:
    def __init__(self, path: str | Path):
        self.path = str(path)
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        with self._conn() as c:
            c.execute(SCHEMA)

    def _conn(self):
        return sqlite3.connect(self.path)

    def log_search(self, detective_id: str, query: dict, config_version: str, embedder: str, result) -> None:
        with self._conn() as c:
            c.execute(
                "INSERT INTO audit (timestamp, detective_id, query_json, config_version, embedder, n_results, outcome, listing_ids)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (_now(), detective_id, json.dumps(query, sort_keys=True), config_version, embedder,
                 len(result.leads), result.outcome, json.dumps(result.listing_ids)),
            )

    def log_blocked(self, detective_id: str) -> None:
        """Only the fact that a blocked attempt happened. The blocked text is not passed in at all."""
        with self._conn() as c:
            c.execute("INSERT INTO audit (timestamp, detective_id, outcome) VALUES (?, ?, 'blocked')", (_now(), detective_id))

    def rows(self) -> list[dict]:
        with self._conn() as c:
            c.row_factory = sqlite3.Row
            return [dict(r) for r in c.execute("SELECT * FROM audit ORDER BY id DESC")]
