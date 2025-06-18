from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# Writing Session Schemas
class WritingSessionBase(BaseModel):
    project_id: Optional[str] = None
    stage_number_snapshot: Optional[int] = None # Snapshot of project stage when session starts/ends

class WritingSessionCreate(WritingSessionBase):
    # user_id will be a path parameter or from auth
    pass

class WritingSessionEnd(BaseModel):
    words_written: Optional[int] = 0
    edits_made: Optional[int] = 0
    quality_score_snapshot: Optional[float] = None
    active_duration_seconds: Optional[int] = 0

class WritingSession(WritingSessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    session_start_time: datetime
    session_end_time: Optional[datetime] = None
    words_written: Optional[int] = 0
    edits_made: Optional[int] = 0
    quality_score_snapshot: Optional[float] = None
    active_duration_seconds: Optional[int] = 0


# Style Analysis Snapshot Schemas
class StyleAnalysisSnapshotBase(BaseModel):
    project_id: Optional[str] = None
    session_id: Optional[str] = None # Link to a specific writing session
    text_snapshot_preview: Optional[str] = None
    metaphor_density: Optional[float] = None
    vocabulary_complexity: Optional[float] = None
    formality_score: Optional[float] = None
    creativity_score: Optional[float] = None
    coherence_score: Optional[float] = None
    avg_sentence_length: Optional[float] = None
    cultural_references_count: Optional[int] = None

class StyleAnalysisSnapshotCreate(StyleAnalysisSnapshotBase):
    # user_id will be path param or from auth
    text_to_analyze: str # The actual text to perform analysis on for this snapshot

class StyleAnalysisSnapshot(StyleAnalysisSnapshotBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    analysis_date: datetime


# Analytics Response Schemas (based on Flask app's expected outputs and available data)

class DailyProgress(BaseModel):
    date: datetime
    words_written: int
    sessions_count: int
    active_time_minutes: float

class ProgressAnalyticsResponse(BaseModel):
    user_id: str
    project_id: Optional[str] = None
    total_words_written: int
    total_sessions: int
    total_active_time_minutes: float
    average_words_per_session: float
    daily_progress: List[DailyProgress] = [] # Trend data

class PersonalReportSection(BaseModel):
    title: str
    content: str # Could be markdown or plain text summary
    # charts_data: Optional[List[Dict[str, Any]]] = None # For potential charts

class PersonalReportResponse(BaseModel):
    user_id: str
    project_id: Optional[str] = None
    report_date: datetime
    summary: str # Overall summary
    sections: List[PersonalReportSection] # e.g., "Productivity", "Style Improvement", "Common Issues"

class StyleEvolutionDataPoint(BaseModel):
    date: datetime
    metaphor_density: Optional[float] = None
    vocabulary_complexity: Optional[float] = None
    formality_score: Optional[float] = None
    creativity_score: Optional[float] = None
    coherence_score: Optional[float] = None
    avg_sentence_length: Optional[float] = None
    # Add other tracked style metrics

class StyleEvolutionResponse(BaseModel):
    user_id: str
    project_id: Optional[str] = None
    evolution_data: List[StyleEvolutionDataPoint]

class ProductivityStat(BaseModel):
    metric_name: str
    current_value: float
    previous_value: Optional[float] = None # For comparison
    change_percentage: Optional[float] = None

class DashboardStatsResponse(BaseModel):
    user_id: str
    overall_writing_consistency: Optional[float] = None # e.g., 0-1 score based on regular activity
    average_session_duration_minutes: Optional[float] = None
    words_per_day_average: Optional[float] = None
    most_productive_day_of_week: Optional[str] = None
    style_improvement_highlights: Optional[List[str]] = None # Key areas of style improvement
    productivity_metrics: List[ProductivityStat] = [] # e.g., words this week vs last week
    # active_projects_count: int # Could be added if project status is tracked
    # recent_achievements: List[Any] # If an achievement system is integrated
