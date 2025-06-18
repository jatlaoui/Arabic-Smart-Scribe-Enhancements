from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from ...db.session import get_db
from ...schemas.analytics import (
    WritingSession, WritingSessionCreate, WritingSessionEnd,
    StyleAnalysisSnapshot, StyleAnalysisSnapshotCreate,
    ProgressAnalyticsResponse, PersonalReportResponse, StyleEvolutionResponse, DashboardStatsResponse
)
from ...services.analytics_service import AnalyticsService
from ...services.gemini_service import GeminiService # For dependency injection into AnalyticsService

router = APIRouter(
    prefix="/api/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)

# Dependency for AnalyticsService
def get_gemini_service_dependency(): # Renamed to avoid conflict if used elsewhere
    return GeminiService()

def get_analytics_service(
    db: Session = Depends(get_db),
    gemini_service: GeminiService = Depends(get_gemini_service_dependency)
) -> AnalyticsService:
    return AnalyticsService(db=db, gemini_service=gemini_service)


@router.post("/users/{user_id}/projects/{project_id}/sessions/start", response_model=WritingSession, status_code=status.HTTP_201_CREATED)
def start_user_writing_session(
    user_id: str,
    project_id: str, # Can be made Optional if sessions can be non-project specific
    session_data: WritingSessionCreate, # Contains other optional fields like stage_number
    service: AnalyticsService = Depends(get_analytics_service)
):
    # Ensure project_id from path is consistent or used from session_data
    if session_data.project_id and session_data.project_id != project_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project ID in path and body do not match.")

    # Use project_id from path if not in body, or ensure they match
    if not session_data.project_id:
        session_data.project_id = project_id

    return service.start_writing_session(user_id=user_id, session_data=session_data)

@router.post("/users/{user_id}/sessions/{session_id}/end", response_model=WritingSession)
def end_user_writing_session(
    user_id: str, # user_id could be validated against session owner if auth was in place
    session_id: str,
    session_end_data: WritingSessionEnd,
    service: AnalyticsService = Depends(get_analytics_service)
):
    ended_session = service.end_writing_session(session_id=session_id, session_end_data=session_end_data)
    if not ended_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Writing session not found or already ended.")
    return ended_session

@router.post("/users/{user_id}/style-analyses", response_model=StyleAnalysisSnapshot, status_code=status.HTTP_201_CREATED)
async def record_user_text_style_analysis( # Made async as service method is async
    user_id: str,
    analysis_create_data: StyleAnalysisSnapshotCreate,
    service: AnalyticsService = Depends(get_analytics_service)
):
    return await service.record_text_style_analysis(user_id=user_id, data=analysis_create_data)

@router.get("/users/{user_id}/projects/{project_id}/progress", response_model=ProgressAnalyticsResponse)
def get_user_project_progress(
    user_id: str,
    project_id: str, # Can be made optional if we want overall user progress too
    days_history: Optional[int] = 30,
    service: AnalyticsService = Depends(get_analytics_service)
):
    return service.get_writing_progress_analytics(user_id=user_id, project_id=project_id, days_history=days_history)

@router.get("/users/{user_id}/projects/{project_id}/personal-report", response_model=PersonalReportResponse)
def get_user_project_personal_report(
    user_id: str,
    project_id: str, # Can be made optional
    service: AnalyticsService = Depends(get_analytics_service)
):
    return service.generate_personalized_report(user_id=user_id, project_id=project_id)

@router.get("/users/{user_id}/projects/{project_id}/style-evolution", response_model=StyleEvolutionResponse)
def get_user_project_style_evolution(
    user_id: str,
    project_id: str, # Can be made optional
    limit: Optional[int] = 30,
    service: AnalyticsService = Depends(get_analytics_service)
):
    return service.get_style_evolution(user_id=user_id, project_id=project_id, limit=limit)

@router.get("/users/{user_id}/projects/{project_id}/sessions", response_model=List[WritingSession])
def get_user_project_writing_sessions(
    user_id: str,
    project_id: str, # Can be made optional
    skip: int = 0,
    limit: int = 100,
    service: AnalyticsService = Depends(get_analytics_service)
):
    return service.get_writing_sessions(user_id=user_id, project_id=project_id, skip=skip, limit=limit)

@router.get("/users/{user_id}/dashboard-stats", response_model=DashboardStatsResponse)
def get_user_dashboard_stats(
    user_id: str,
    days_history: Optional[int] = 7, # Default to 7 days for dashboard
    service: AnalyticsService = Depends(get_analytics_service)
):
    return service.get_dashboard_stats(user_id=user_id, days_history=days_history)
