from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.dependencies import (
    get_current_active_user,
    require_admin,
    require_manager_or_admin,
)
from ..crud.project import (
    add_member,
    create_project,
    delete_project,
    get_project,
    get_project_members,
    get_projects,
    remove_member,
    update_project,
)
from ..database import get_db
from ..models.user import User
from ..schemas.project import ProjectCreate, ProjectOut, ProjectUpdate
from ..schemas.user import UserOut

router = APIRouter(prefix="/projects", tags=["projects"])


def _build_project_out(project) -> ProjectOut:
    """Attach computed member_count and task_count to a Project ORM object."""
    data = ProjectOut.model_validate(project)
    data.member_count = len(project.members)
    data.task_count = len(project.tasks)
    return data


@router.get("/", response_model=List[ProjectOut])
def list_projects(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List projects. Employees see only their assigned projects; managers/admins see all."""
    projects = get_projects(db, skip=skip, limit=limit, status=status)
    if current_user.role == "employee":
        projects = [
            p for p in projects
            if current_user in p.members or (p.assignee_id if hasattr(p, 'assignee_id') else False)
        ]
    return [_build_project_out(p) for p in projects]


@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project_endpoint(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    """Create a new project. Manager or admin only."""
    project = create_project(db, project_in)
    return _build_project_out(project)


@router.get("/{project_id}", response_model=ProjectOut)
def read_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a single project by ID."""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return _build_project_out(project)


@router.put("/{project_id}", response_model=ProjectOut)
def update_project_endpoint(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a project. Manager (of that project) or admin."""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if current_user.role == "employee":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    if current_user.role == "manager" and project.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the manager of this project",
        )
    updated = update_project(db, project_id, project_update)
    return _build_project_out(updated)


@router.delete("/{project_id}", response_model=ProjectOut)
def delete_project_endpoint(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a project. Admin or manager (of that project) only."""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if current_user.role == "employee":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    if current_user.role == "manager" and project.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the manager of this project",
        )
    # Capture data before deletion for response
    out = _build_project_out(project)
    delete_project(db, project_id)
    return out


@router.post("/{project_id}/members", response_model=ProjectOut)
def add_project_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    """Add a member to a project."""
    project = add_member(db, project_id, user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project or user not found",
        )
    return _build_project_out(project)


@router.delete("/{project_id}/members/{user_id}", response_model=ProjectOut)
def remove_project_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager_or_admin),
):
    """Remove a member from a project."""
    project = remove_member(db, project_id, user_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return _build_project_out(project)


@router.get("/{project_id}/members", response_model=List[UserOut])
def list_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """List all members of a project."""
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return get_project_members(db, project_id)
