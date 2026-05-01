"""
Rank service - manages local rank.json.

INVARIANT: rank is NEVER overwritten by sync operations.
Sync calls reapply_rank() after updating data.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_DIR = BASE_DIR / "data" / "config"
EXAMPLES_DIR = BASE_DIR / "data" / "examples"
RANK_FILE = CONFIG_DIR / "rank.json"


def _load_rank() -> dict:
    if RANK_FILE.exists():
        with open(RANK_FILE) as f:
            return json.load(f)
    example = EXAMPLES_DIR / "rank.json"
    if example.exists():
        with open(example) as f:
            return json.load(f)
    return {"epics": {}, "milestones": {}, "tasks": {}, "_meta": {}}


def _save_rank(rank: dict) -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    rank.setdefault("_meta", {})
    rank["_meta"]["last_modified"] = datetime.now(timezone.utc).isoformat()
    with open(RANK_FILE, "w") as f:
        json.dump(rank, f, indent=2)


def get_rank() -> dict:
    return _load_rank()


def update_rank(category: str, ordered_ids: list[str]) -> dict:
    """
    Assign sequential rank values to ids in the given category.
    category: 'epics' | 'milestones' | 'tasks'
    """
    rank = _load_rank()
    rank.setdefault(category, {})
    for position, item_id in enumerate(ordered_ids, start=1):
        rank[category][item_id] = position
    _save_rank(rank)
    return rank


def reapply_rank(items: list[dict], category: str) -> list[dict]:
    """
    Sort items by their rank value. Items with no rank go to the end,
    preserving their relative order.
    """
    rank = _load_rank()
    category_rank = rank.get(category, {})

    def sort_key(item):
        item_id = item.get("id", "")
        return category_rank.get(item_id, 99999)

    return sorted(items, key=sort_key)


def ensure_rank_entry(item_id: str, category: str) -> None:
    """Add a new item to rank at the end if it doesn't exist yet."""
    rank = _load_rank()
    rank.setdefault(category, {})
    if item_id not in rank[category]:
        existing_max = max(rank[category].values(), default=0)
        rank[category][item_id] = existing_max + 1
        _save_rank(rank)
