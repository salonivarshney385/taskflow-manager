from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee")  # "admin" | "manager" | "employee"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Projects where this user is the manager
    managed_projects = relationship(
        "Project",
        back_populates="manager",
        foreign_keys="Project.manager_id",
    )

    # Projects where this user is a member (via association table)
    member_projects = relationship(
        "Project",
        secondary="project_members",
        back_populates="members",
        overlaps="managed_projects",
    )

    # Tasks assigned to this user
    assigned_tasks = relationship("Task", back_populates="assignee")
