
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    content: Optional[str] = ""

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Project(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    word_count: int
    status: str
    tags: List[str]

    class Config:
        from_attributes = True
