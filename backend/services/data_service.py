"""
Central data service - reads/writes JSON files in /data/current/.
Falls back to /data/examples/ when current data does not exist.
"""
import json
import os
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CURRENT_DIR = BASE_DIR / "data" / "current"
EXAMPLES_DIR = BASE_DIR / "data" / "examples"

FILES = ["tasks.json", "leaves.json", "sprints.json", "holidays.json"]


def _ensure_current_dir() -> None:
    CURRENT_DIR.mkdir(parents=True, exist_ok=True)


def _load(filename: str) -> dict:
    current_path = CURRENT_DIR / filename
    if current_path.exists():
        with open(current_path) as f:
            return json.load(f)
    example_path = EXAMPLES_DIR / filename
    if example_path.exists():
        with open(example_path) as f:
            return json.load(f)
    return {}


def _save(filename: str, data: dict) -> None:
    _ensure_current_dir()
    with open(CURRENT_DIR / filename, "w") as f:
        json.dump(data, f, indent=2)


def get_tasks() -> dict:
    return _load("tasks.json")


def get_leaves() -> dict:
    return _load("leaves.json")


def get_sprints() -> dict:
    return _load("sprints.json")


def get_holidays() -> dict:
    return _load("holidays.json")


def save_tasks(data: dict) -> None:
    _save("tasks.json", data)


def save_leaves(data: dict) -> None:
    _save("leaves.json", data)


def save_sprints(data: dict) -> None:
    _save("sprints.json", data)


def save_holidays(data: dict) -> None:
    _save("holidays.json", data)


def get_all() -> dict:
    return {
        "tasks": get_tasks(),
        "leaves": get_leaves(),
        "sprints": get_sprints(),
        "holidays": get_holidays(),
    }
