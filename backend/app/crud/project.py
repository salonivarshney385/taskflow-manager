from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.project import Project, project_members
from ..models.user import User
from ..schemas.project import ProjectCreate, ProjectUpdate


def get_project(db: Session, project_id: int) -> Optional[Project]:
    return db.query(Project).filter(Project.id == project_id).first()


def get_projects(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
) -> List[Project]:
    query = db.query(Project)
    if status:
        query = query.filter(Project.status == status)
    return query.offset(skip).limit(limit).all()


def create_project(db: Session, project: ProjectCreate) -> Project:
    db_project = Project(
        name=project.name,
        description=project.description,
        status=project.status,
        start_date=project.start_date,
        deadline=project.deadline,
        completion_percentage=project.completion_percentage,
        manager_id=project.manager_id,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(
    db: Session, project_id: int, project_update: ProjectUpdate
) -> Optional[Project]:
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_project, field, value)
    db.commit()
    db.refresh(db_project)
    return db_project


def delete_project(db: Session, project_id: int) -> Optional[Project]:
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    db.delete(db_project)
    db.commit()
    return db_project


def add_member(db: Session, project_id: int, user_id: int) -> Optional[Project]:
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    if user not in db_project.members:
        db_project.members.append(user)
        db.commit()
        db.refresh(db_project)
    return db_project


def remove_member(db: Session, project_id: int, user_id: int) -> Optional[Project]:
    db_project = get_project(db, project_id)
    if not db_project:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    if user and user in db_project.members:
        db_project.members.remove(user)
        db.commit()
        db.refresh(db_project)
    return db_project


def get_project_members(db: Session, project_id: int) -> List[User]:
    db_project = get_project(db, project_id)
    if not db_project:
        return []
    return db_project.members
