"""
Sync router - POST /sync triggers data refresh from external sources.

In production this would call Jira, Google Sheets, and Google Calendar.
For local use it normalizes data and reapplies rank without touching rank.json.
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from backend.services import data_service, rank_service, archive_service

router = APIRouter(prefix="/api/sync", tags=["sync"])


def _mock_fetch_jira() -> dict:
    """Placeholder - replace with real Jira API call."""
    return data_service.get_tasks()


def _mock_fetch_leaves() -> dict:
    """Placeholder - replace with Google Sheets API call."""
    return data_service.get_leaves()


def _mock_fetch_calendar() -> dict:
    """Placeholder - replace with Google Calendar API call."""
    sprints = data_service.get_sprints()
    holidays = data_service.get_holidays()
    return {"sprints": sprints, "holidays": holidays}


def _normalize_task(raw: dict) -> dict:
    """Ensure all required fields have defaults."""
    raw.setdefault("blocks", [])
    raw.setdefault("blocked_by", [])
    raw.setdefault("priority", "Medium")
    raw.setdefault("business_scope", "Internal")
    return raw


@router.post("")
def run_sync():
    try:
        # 1. Fetch from sources (mocked; wire real APIs here)
        tasks_data = _mock_fetch_jira()
        leaves_data = _mock_fetch_leaves()
        calendar_data = _mock_fetch_calendar()

        # 2. Normalize
        tasks_data["tasks"] = [_normalize_task(t) for t in tasks_data.get("tasks", [])]

        # 3. Ensure rank entries exist for all items (new items go to end)
        for task in tasks_data.get("tasks", []):
            category = "milestones" if task.get("issue_type") == "Milestone" else "tasks"
            rank_service.ensure_rank_entry(task["id"], category)
        for epic in tasks_data.get("epics", []):
            rank_service.ensure_rank_entry(epic["id"], "epics")

        # 4. Save snapshot before overwriting current
        snapshot_payload = {
            "tasks": tasks_data,
            "leaves": leaves_data,
            "sprints": calendar_data["sprints"],
            "holidays": calendar_data["holidays"],
        }
        snapshot_id = archive_service.create_snapshot(snapshot_payload)

        # 5. Save to current (rank.json is untouched — only data files change)
        data_service.save_tasks(tasks_data)
        data_service.save_leaves(leaves_data)
        data_service.save_sprints(calendar_data["sprints"])
        data_service.save_holidays(calendar_data["holidays"])

        return {
            "status": "ok",
            "snapshot": snapshot_id,
            "synced_at": datetime.now(timezone.utc).isoformat(),
            "counts": {
                "tasks": len(tasks_data.get("tasks", [])),
                "epics": len(tasks_data.get("epics", [])),
                "leaves": len(leaves_data.get("leaves", [])),
                "sprints": len(calendar_data["sprints"].get("sprints", [])),
                "holidays": len(calendar_data["holidays"].get("holidays", [])),
            },
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/archives")
def list_archives():
    return {"snapshots": archive_service.list_snapshots()}


@router.get("/archives/{timestamp}")
def get_archive(timestamp: str):
    try:
        return archive_service.load_snapshot(timestamp)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Snapshot not found")
