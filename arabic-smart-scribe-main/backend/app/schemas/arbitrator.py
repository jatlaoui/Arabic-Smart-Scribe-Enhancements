from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List

class ArbitratorRequest(BaseModel):
    content: str
    criteria: Optional[Dict[str, Any]] = None # Example: {"style": true, "grammar": true, "coherence": true}
    # llm_config: Optional[Dict[str, Any]] = None # For future flexibility

class EvaluationCriterionResult(BaseModel):
    criterion: str # Name of the criterion e.g., "style", "grammar"
    score: float   # Score for this criterion (e.g., 0.0 to 1.0)
    feedback: str  # Specific feedback for this criterion

class EvaluationResult(BaseModel):
    overall_score: float # An aggregated overall score
    detailed_feedback: str # General textual feedback
    criteria_results: Optional[List[EvaluationCriterionResult]] = None # Breakdown by criteria if available

class ContentEvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    original_content: str
    evaluation: EvaluationResult

class ContentRefinementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    original_content: str
    refined_content: str
    changes_made: Optional[List[str]] = None # Summary of changes
    # Or perhaps a diff:
    # diff_report: Optional[str] = None
