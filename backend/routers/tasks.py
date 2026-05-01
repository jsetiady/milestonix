from fastapi import APIRouter, HTTPException
from backend.services import data_service, rank_service

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("")
def get_tasks():
    data = data_service.get_tasks()
    tasks = data.get("tasks", [])
    epics = data.get("epics", [])
    tasks = rank_service.reapply_rank(tasks, "tasks")
    epics = rank_service.reapply_rank(epics, "epics")
    return {"tasks": tasks, "epics": epics}


@router.get("/all")
def get_all_data():
    tasks_data = data_service.get_tasks()
    tasks = rank_service.reapply_rank(tasks_data.get("tasks", []), "tasks")
    epics = rank_service.reapply_rank(tasks_data.get("epics", []), "epics")
    leaves = data_service.get_leaves().get("leaves", [])
    sprints = data_service.get_sprints().get("sprints", [])
    holidays = data_service.get_holidays().get("holidays", [])
    return {
        "tasks": tasks,
        "epics": epics,
        "leaves": leaves,
        "sprints": sprints,
        "holidays": holidays,
    }
