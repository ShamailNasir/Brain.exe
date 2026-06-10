from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from typing import List, Optional
from auth_utils import get_current_user

router = APIRouter()

class TaskModel(BaseModel):
    id: str
    title: str
    type: str
    category: str
    completedDates: list
    date: Optional[str] = None
    createdAt: int
    priority: Optional[str] = 'p4'
    description: Optional[str] = ''
    subtasks: Optional[list] = []
    tags: Optional[list] = []

class StatsModel(BaseModel):
    xp: int
    level: int

@router.get("/tasks")
def get_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tasks = db.query(models.Task).filter(models.Task.user_id == current_user.id).all()
    return tasks

@router.post("/tasks")
def sync_tasks(tasks: List[TaskModel], db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db.query(models.Task).filter(models.Task.user_id == current_user.id).delete()
    for t in tasks:
        db_task = models.Task(
            id=t.id, title=t.title, type=t.type, category=t.category,
            completedDates=t.completedDates, date=t.date, createdAt=t.createdAt,
            priority=t.priority, description=t.description, subtasks=t.subtasks, tags=t.tags,
            user_id=current_user.id
        )
        db.add(db_task)
    db.commit()
    return {"status": "success"}

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    stats = db.query(models.UserStats).filter(models.UserStats.user_id == current_user.id).first()
    if not stats:
        stats = models.UserStats(xp=0, level=1, user_id=current_user.id)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return {"xp": stats.xp, "level": stats.level}

@router.post("/stats")
def sync_stats(stats: StatsModel, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_stats = db.query(models.UserStats).filter(models.UserStats.user_id == current_user.id).first()
    if not db_stats:
        db_stats = models.UserStats(xp=stats.xp, level=stats.level, user_id=current_user.id)
        db.add(db_stats)
    else:
        db_stats.xp = stats.xp
        db_stats.level = stats.level
    db.commit()
    return {"status": "success"}
