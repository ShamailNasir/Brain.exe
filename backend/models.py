from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    tasks = relationship("Task", back_populates="owner")
    stats = relationship("UserStats", back_populates="owner", uselist=False)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    type = Column(String)
    category = Column(String)
    completedDates = Column(JSON)
    date = Column(String, nullable=True)
    createdAt = Column(Integer)
    priority = Column(String, nullable=True, default='p4')
    description = Column(String, nullable=True, default='')
    subtasks = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="tasks")

class UserStats(Base):
    __tablename__ = "user_stats"
    id = Column(Integer, primary_key=True, index=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="stats")
