from datetime import date
from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_active_user
from ..database import get_db
from ..models.project import Project
from ..models.task import Task
from ..models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """Return high-level counts for the dashboard."""
    today = date.today()

    total_projects = db.query(func.count(Project.id)).scalar() or 0
    completed_projects = db.query(func.count(Project.id)).filter(Project.status == "completed").scalar() or 0
    ongoing_projects = db.query(func.count(Project.id)).filter(Project.status == "ongoing").scalar() or 0
    pending_projects = db.query(func.count(Project.id)).filter(Project.status == "pending").scalar() or 0

    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    completed_tasks = db.query(func.count(Task.id)).filter(Task.status == "completed").scalar() or 0
    pending_tasks = db.query(func.count(Task.id)).filter(Task.status == "pending").scalar() or 0
    in_progress_tasks = db.query(func.count(Task.id)).filter(Task.status == "in_progress").scalar() or 0
    overdue_tasks = (
        db.query(func.count(Task.id))
        .filter(Task.deadline < today, Task.status != "completed")
        .scalar()
        or 0
    )

    total_users = db.query(func.count(User.id)).scalar() or 0

    return {
        "total_projects": total_projects,
        "completed_projects": completed_projects,
        "ongoing_projects": ongoing_projects,
        "pending_projects": pending_projects,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "overdue_tasks": overdue_tasks,
        "total_users": total_users,
    }


@router.get("/charts")
def charts(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """Return chart-ready data derived from real DB queries."""
    today = date.today()

    # --- Project status distribution ---
    project_status_rows = (
        db.query(Project.status, func.count(Project.id))
        .group_by(Project.status)
        .all()
    )
    project_status_data = [{"status": row[0], "count": row[1]} for row in project_status_rows]

    # --- Task status distribution ---
    task_status_rows = (
        db.query(Task.status, func.count(Task.id))
        .group_by(Task.status)
        .all()
    )
    task_status_data = [{"status": row[0], "count": row[1]} for row in task_status_rows]

    # --- Project completion percentages ---
    projects = db.query(Project.id, Project.name, Project.completion_percentage).all()
    project_completion = [
        {"id": p.id, "name": p.name, "completion_percentage": p.completion_percentage}
        for p in projects
    ]

    # --- Employee performance: completed vs total tasks per user ---
    users = db.query(User).all()
    employee_performance: List[Dict[str, Any]] = []
    for user in users:
        total = db.query(func.count(Task.id)).filter(Task.assignee_id == user.id).scalar() or 0
        completed = (
            db.query(func.count(Task.id))
            .filter(Task.assignee_id == user.id, Task.status == "completed")
            .scalar()
            or 0
        )
        employee_performance.append(
            {
                "user_id": user.id,
                "full_name": user.full_name or user.email,
                "email": user.email,
                "total_tasks": total,
                "completed_tasks": completed,
            }
        )

    # --- Overdue tasks grouped by project ---
    overdue_rows = (
        db.query(Project.id, Project.name, func.count(Task.id).label("overdue_count"))
        .join(Task, Task.project_id == Project.id)
        .filter(Task.deadline < today, Task.status != "completed")
        .group_by(Project.id, Project.name)
        .all()
    )
    overdue_by_project = [
        {"project_id": row[0], "project_name": row[1], "overdue_count": row[2]}
        for row in overdue_rows
    ]

    # --- Overdue tasks list ---
    overdue_task_records = (
        db.query(Task)
        .filter(Task.deadline < today, Task.status != "completed")
        .limit(20)
        .all()
    )
    overdue_tasks = [
        {
            "id": t.id,
            "title": t.title,
            "deadline": str(t.deadline) if t.deadline else None,
            "project_name": t.project.name if t.project else None,
        }
        for t in overdue_task_records
    ]

    return {
        "project_status_data": project_status_data,
        "task_status_data": task_status_data,
        "project_completion": project_completion,
        "employee_performance": employee_performance,
        "overdue_by_project": overdue_by_project,
        "overdue_tasks": overdue_tasks,
    }
