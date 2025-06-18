from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class WorkflowDefinitionBase(BaseModel):
    name: str
    description: Optional[str] = None
    workflow_json: Dict[str, Any] # For nodes, edges, positions etc.
    is_template: bool = False
    is_public: bool = False
    tags_json: Optional[List[str]] = None
    complexity_level: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None

class WorkflowDefinitionCreate(WorkflowDefinitionBase):
    pass

class WorkflowDefinitionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    workflow_json: Optional[Dict[str, Any]] = None
    is_template: Optional[bool] = None
    is_public: Optional[bool] = None
    tags_json: Optional[List[str]] = None
    complexity_level: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None

class WorkflowDefinition(WorkflowDefinitionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_identifier: Optional[str] = None
    usage_count: int
    created_at: datetime
    updated_at: datetime

class WorkflowRunRequest(BaseModel):
    initial_data: Optional[Dict[str, Any]] = {} # e.g. {"project_id": "xyz", "input_text": "..."}
