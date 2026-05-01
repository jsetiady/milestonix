"""
Archive service - stores snapshots per sync, keeps max 10 versions.
"""
import json
import shutil
from pathlib import Path
from datetime import datetime, timezone

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CURRENT_DIR = BASE_DIR / "data" / "current"
ARCHIVE_DIR = BASE_DIR / "data" / "archive"
MAX_VERSIONS = 10


def create_snapshot(data: dict) -> str:
    """Save a full data snapshot. Returns the snapshot directory name."""
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    snapshot_dir = ARCHIVE_DIR / timestamp
    snapshot_dir.mkdir(parents=True, exist_ok=True)

    for filename, content in data.items():
        with open(snapshot_dir / f"{filename}.json", "w") as f:
            json.dump(content, f, indent=2)

    _prune_old_snapshots()
    return timestamp


def _prune_old_snapshots() -> None:
    """Delete oldest snapshots beyond MAX_VERSIONS."""
    snapshots = sorted(ARCHIVE_DIR.iterdir(), key=lambda p: p.name)
    while len(snapshots) > MAX_VERSIONS:
        oldest = snapshots.pop(0)
        if oldest.is_dir():
            shutil.rmtree(oldest)


def list_snapshots() -> list[str]:
    if not ARCHIVE_DIR.exists():
        return []
    return sorted(
        [p.name for p in ARCHIVE_DIR.iterdir() if p.is_dir()],
        reverse=True,
    )


def load_snapshot(timestamp: str) -> dict:
    snapshot_dir = ARCHIVE_DIR / timestamp
    if not snapshot_dir.exists():
        raise FileNotFoundError(f"Snapshot {timestamp} not found")
    result = {}
    for json_file in snapshot_dir.glob("*.json"):
        with open(json_file) as f:
            result[json_file.stem] = json.load(f)
    return result
