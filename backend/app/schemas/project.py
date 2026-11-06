from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from .user import UserOut


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "pending"
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    completion_percentage: int = 0
    manager_id: Optional[int] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    completion_percentage: Optional[int] = None
    manager_id: Optional[int] = None


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    completion_percentage: int
    manager_id: Optional[int] = None
    created_at: Optional[datetime] = None
    manager: Optional[UserOut] = None
    member_count: int = 0
    task_count: int = 0

    model_config = {"from_attributes": True}
