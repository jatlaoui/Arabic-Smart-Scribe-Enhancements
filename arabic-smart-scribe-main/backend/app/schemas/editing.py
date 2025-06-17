
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EditingRequest(BaseModel):
    text: str
    tool_type: str
    context: Optional[str] = None
    target_length: Optional[int] = None

class EditingResponse(BaseModel):
    original_text: str
    edited_text: str
    tool_used: str
    processing_time: float
    confidence_score: float
    suggestions: List[str]

class EditingTool(BaseModel):
    id: str
    name: str
    category: str
    description: str
    icon: str
    color: str

class TextAnalysisRequest(BaseModel):
    text: str
    analysis_type: Optional[str] = "comprehensive"
    include_suggestions: Optional[bool] = True

class SmartSuggestionsRequest(BaseModel):
    content: str
    selected_text: Optional[str] = None
    suggestion_types: List[str] = ["context", "vocabulary", "flow", "content"]
    max_suggestions: Optional[int] = 10
