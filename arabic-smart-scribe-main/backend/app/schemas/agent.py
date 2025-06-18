from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class AgentBase(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = {}

class AgentCreate(AgentBase):
    pass

class AgentUpdate(AgentBase):
    name: Optional[str] = None
    type: Optional[str] = None
    # config can be updated, so no Optional needed here if we expect full updates
    # If partial updates for config are allowed, then this might need more thought (e.g. JSON Patch)
    # For now, assume full replacement if config is provided in update.

class Agent(AgentBase):
    model_config = ConfigDict(from_attributes=True) # Replaces orm_mode = True

    id: str # Kept as str, will be populated with UUID string from model
    created_at: datetime
    updated_at: datetime


# Schemas for Agent Messages
class AgentMessageBase(BaseModel):
    from_agent_id: str
    to_agent_id: str
    content: str
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AgentMessageCreate(AgentMessageBase):
    pass

class AgentMessage(AgentMessageBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    timestamp: datetime
