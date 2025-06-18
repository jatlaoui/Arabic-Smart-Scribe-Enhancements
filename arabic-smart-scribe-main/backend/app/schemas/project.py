
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    content: Optional[str] = ""
    description: Optional[str] = None
    stage: Optional[str] = "initial"
    metadata: Optional[Dict[str, Any]] = {}

class ProjectCreate(ProjectBase):
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None

class Project(ProjectBase):
    id: str
    created_at: datetime
    updated_at: datetime
    word_count: int
    status: str
    tags: List[str]

    class Config:
        from_attributes = True
