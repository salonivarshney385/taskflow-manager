from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from .user import UserOut


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    deadline: Optional[date] = None
    project_id: int
    assignee_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[date] = None
    project_id: Optional[int] = None
    assignee_id: Optional[int] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    deadline: Optional[date] = None
    project_id: int
    assignee_id: Optional[int] = None
    created_at: Optional[datetime] = None
    assignee: Optional[UserOut] = None
    project_name: Optional[str] = None

    model_config = {"from_attributes": True}
