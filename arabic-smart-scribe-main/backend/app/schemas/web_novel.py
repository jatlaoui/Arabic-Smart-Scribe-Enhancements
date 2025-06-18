from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid

class LiveNovelEntity(BaseModel):
    id: str
    name: str
    type: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        orm_mode = True

class LiveNovelChapter(BaseModel):
    title: str
    content: str # HTML-like string with <entity> tags

class LiveNovelDataResponse(BaseModel):
    project_id: str
    title: str
    chapters: List[LiveNovelChapter]
    entities: Dict[str, LiveNovelEntity] # Keyed by entity ID
