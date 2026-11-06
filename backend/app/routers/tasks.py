from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_active_user
from ..crud.task import create_task, delete_task, get_task, get_tasks, update_task
from ..database import get_db
from ..models.user import User
from ..schemas.task import TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _build_task_out(task) -> TaskOut:
    """Attach project_name to a Task ORM object for response serialization."""
    data = TaskOut.model_validate(task)
    if task.project:
        data.project_name = task.project.name
    return data


@router.get("/", response_model=List[TaskOut])
def list_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    project_id: Optional[int] = None,
    assignee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List tasks with optional filters."""
    # Employees only see tasks assigned to them
    if current_user.role == "employee":
        assignee_id = current_user.id
    tasks = get_tasks(
        db,
        skip=skip,
        limit=limit,
        status=status,
        priority=priority,
        project_id=project_id,
        assignee_id=assignee_id,
    )
    return [_build_task_out(t) for t in tasks]


@router.post("/", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task_endpoint(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new task."""
    if current_user.role == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create tasks",
        )
    task = create_task(db, task_in)
    return _build_task_out(task)


@router.get("/{task_id}", response_model=TaskOut)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a single task by ID."""
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return _build_task_out(task)


@router.put("/{task_id}", response_model=TaskOut)
def update_task_endpoint(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a task. Employees can only update their own tasks' status."""
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if current_user.role == "employee":
        if task.assignee_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update tasks assigned to you",
            )
        # Employees may only change the status field
        allowed = TaskUpdate(status=task_update.status)
        task_update = allowed
    updated = update_task(db, task_id, task_update)
    return _build_task_out(updated)


@router.delete("/{task_id}", response_model=TaskOut)
def delete_task_endpoint(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a task. Manager or admin only."""
    if current_user.role == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete tasks",
        )
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    out = _build_task_out(task)
    delete_task(db, task_id)
    return out
