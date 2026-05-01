import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from backend.services import rank_service

router = APIRouter(prefix="/api/config", tags=["config"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_DIR = BASE_DIR / "data" / "config"
EXAMPLES_DIR = BASE_DIR / "data" / "examples"


def _load_filter_options() -> dict:
    config_path = CONFIG_DIR / "filter_options.json"
    if config_path.exists():
        with open(config_path) as f:
            return json.load(f)
    example_path = EXAMPLES_DIR / "filter_options.json"
    if example_path.exists():
        with open(example_path) as f:
            return json.load(f)
    return {}


@router.get("/filters")
def get_filter_options():
    return _load_filter_options()


@router.get("/rank")
def get_rank():
    return rank_service.get_rank()


@router.post("/rank/{category}")
def update_rank(category: str, ordered_ids: list[str]):
    if category not in ("epics", "milestones", "tasks"):
        raise HTTPException(status_code=400, detail="Invalid category")
    return rank_service.update_rank(category, ordered_ids)
