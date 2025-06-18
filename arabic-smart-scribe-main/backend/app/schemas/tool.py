from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class ToolBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    function_name: str
    config: Optional[Dict[str, Any]] = {}

class ToolCreate(ToolBase):
    pass

class ToolUpdate(ToolBase):
    name: Optional[str] = None
    function_name: Optional[str] = None
    # Similar to AgentUpdate, config updates assume full replacement if provided.

class Tool(ToolBase):
    model_config = ConfigDict(from_attributes=True) # Replaces orm_mode = True

    id: str # Kept as str
    created_at: datetime
    updated_at: datetime
