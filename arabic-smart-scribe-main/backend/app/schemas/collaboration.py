from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# For Brainstorming
class BrainstormRequest(BaseModel):
    topic: str
    duration_minutes: Optional[int] = 60
    rounds: Optional[int] = 3

# For Collaboration Session
class CollaborationSessionBase(BaseModel):
    name: str
    purpose: Optional[str] = None
    agent_ids: List[str] # List of agent string UUIDs

class CollaborationSessionCreate(CollaborationSessionBase):
    pass

class CollaborationSessionUpdate(BaseModel):
    name: Optional[str] = None
    purpose: Optional[str] = None
    status: Optional[str] = None
    agent_ids: Optional[List[str]] = None # Allow updating participants
    current_activity: Optional[str] = None
    activity_data: Optional[Dict[str, Any]] = None

class CollaborationSession(CollaborationSessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str
    current_activity: Optional[str] = None
    activity_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
