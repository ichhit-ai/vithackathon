"""
Filesystem watcher daemon — standalone process.

Monitors a target directory for code file modifications and sends
debounced heartbeat pings to the Cairn API.

Usage:
    python -m backend.watcher.daemon --path /path/to/project [--api http://localhost:8000]
"""

from __future__ import annotations

import argparse
import sys
import time
import threading
from datetime import datetime
from pathlib import Path

import httpx
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileModifiedEvent, FileCreatedEvent

# File extensions to watch
CODE_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".css", ".html",
    ".json", ".sql", ".rs", ".go", ".java", ".rb", ".vue",
    ".svelte", ".md",
}

DEBOUNCE_SECONDS = 5.0


class CairnWatcherHandler(FileSystemEventHandler):
    """Watches for code file saves and debounces heartbeat pings."""

    def __init__(self, api_url: str):
        super().__init__()
        self.api_url = api_url.rstrip("/")
        self._lock = threading.Lock()
        self._pending: dict | None = None
        self._timer: threading.Timer | None = None

    def on_modified(self, event):
        if event.is_directory:
            return
        self._handle(event.src_path, "modified")

    def on_created(self, event):
        if event.is_directory:
            return
        self._handle(event.src_path, "created")

    def _handle(self, path: str, event_type: str):
        ext = Path(path).suffix.lower()
        if ext not in CODE_EXTENSIONS:
            return

        # Skip hidden dirs and node_modules
        parts = Path(path).parts
        if any(p.startswith(".") or p == "node_modules" or p == "__pycache__" for p in parts):
            return

        with self._lock:
            self._pending = {"file": str(path), "event": event_type}

            # Reset debounce timer
            if self._timer is not None:
                self._timer.cancel()
            self._timer = threading.Timer(DEBOUNCE_SECONDS, self._send_heartbeat)
            self._timer.daemon = True
            self._timer.start()

    def _send_heartbeat(self):
        with self._lock:
            payload = self._pending
            self._pending = None

        if payload is None:
            return

        try:
            resp = httpx.post(
                f"{self.api_url}/api/watcher/heartbeat",
                json=payload,
                timeout=5.0,
            )
            now = datetime.now().strftime("%H:%M:%S")
            file_short = Path(payload["file"]).name
            print(f"[watcher] {now} — {payload['event']} {file_short} → heartbeat sent ({resp.status_code})")
        except Exception as exc:
            print(f"[watcher] heartbeat failed: {exc}")


def main():
    parser = argparse.ArgumentParser(description="Cairn filesystem watcher daemon")
    parser.add_argument(
        "--path",
        type=str,
        required=True,
        help="Directory to watch for code changes",
    )
    parser.add_argument(
        "--api",
        type=str,
        default="http://localhost:8000",
        help="Cairn API base URL (default: http://localhost:8000)",
    )
    args = parser.parse_args()

    watch_path = Path(args.path).resolve()
    if not watch_path.is_dir():
        print(f"Error: {watch_path} is not a directory")
        sys.exit(1)

    handler = CairnWatcherHandler(args.api)
    observer = Observer()
    observer.schedule(handler, str(watch_path), recursive=True)
    observer.start()

    print(f"[watcher] Monitoring: {watch_path}")
    print(f"[watcher] API target: {args.api}")
    print(f"[watcher] Watching extensions: {', '.join(sorted(CODE_EXTENSIONS))}")
    print(f"[watcher] Debounce: {DEBOUNCE_SECONDS}s")
    print(f"[watcher] Press Ctrl+C to stop\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[watcher] Shutting down...")
        observer.stop()
    observer.join()


if __name__ == "__main__":
    main()
