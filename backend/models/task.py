from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class Task(BaseModel):
    id: str
    summary: str
    issue_type: str  # Task, Milestone, Story, Spike, Initiative, Bug, Epic
    status: str
    assignee: str
    squad: str
    project: str
    epic: Optional[str] = None
    epic_name: Optional[str] = None
    start_date: str
    end_date: str
    last_updated: Optional[str] = None
    quarter: Optional[str] = None
    business_scope: Optional[str] = None
    priority: Optional[str] = None
    blocks: list[str] = []
    blocked_by: list[str] = []
    description: Optional[str] = None


class Epic(BaseModel):
    id: str
    name: str
    project: str
    start_date: str
    end_date: str
    status: str
    squad: Optional[str] = None
    quarter: Optional[str] = None


class TasksData(BaseModel):
    tasks: list[Task]
    epics: list[Epic] = []


class Leave(BaseModel):
    id: str
    assignee: str
    leave_type: str
    start_date: str
    end_date: str
    approved: bool = True
    notes: Optional[str] = None


class LeavesData(BaseModel):
    leaves: list[Leave]


class Sprint(BaseModel):
    id: str
    name: str
    label: str
    start_date: str
    end_date: str
    project: Optional[str] = None
    status: str = "Active"
    color: str = "#4F46E5"
    is_drp: bool = False


class SprintsData(BaseModel):
    sprints: list[Sprint]


class Holiday(BaseModel):
    id: str
    name: str
    date: str
    country: Optional[str] = None
    applies_to: list[str] = ["All"]


class HolidaysData(BaseModel):
    holidays: list[Holiday]
