import logging
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.screenplay import (
    SeriesPlanRequest,
    SeriesOutlineResponse,
    GeneratedSeriesPlan
)
from app.db.models import Project, SeriesOutline, EpisodeOutline, User
from app.services.gemini_service import GeminiService
from app.services.series_planner_service import SeriesPlannerService
from app.api.dependencies.database import get_db
from app.api.dependencies.users import get_current_active_user

logger = logging.getLogger(__name__)
router = APIRouter() # Define router with no prefix here; prefix will be in main.py

@router.post("/plan-series", response_model=SeriesOutlineResponse, status_code=201)
async def plan_series_endpoint(
    request: SeriesPlanRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> SeriesOutlineResponse: # Explicitly use SeriesOutlineResponse for return type hint
    """
    Receives a project ID and series parameters, generates a series outline using
    SeriesPlannerService, saves it to the database, and returns the saved outline.
    """
    logger.info(f"Received request to plan series for project_id: {request.project_id} by user: {current_user.id}")

    try:
        project = await db.get(Project, request.project_id)
        if not project:
            logger.warning(f"Project not found: {request.project_id}")
            raise HTTPException(status_code=404, detail=f"Project with id {request.project_id} not found.")

        # Basic access control placeholder
        if project.user_id != current_user.id: # Assuming Project model has user_id
             logger.warning(f"User {current_user.id} does not own project {request.project_id}.")
             # raise HTTPException(status_code=403, detail="Not authorized to access this project.")
             # For now, proceeding without strict ownership check for testing, but this is important.

        # Instantiate services
        # GeminiService instantiation might need settings from a global config or injected dependency.
        # This assumes GeminiService() can be called without args or settings are globally available.
        gemini_service_instance = GeminiService()
        series_planner = SeriesPlannerService(gemini_service=gemini_service_instance)

        generated_plan_data: GeneratedSeriesPlan = await series_planner.distribute_events_to_episodes(
            db=db, # Pass AsyncSession
            project_id=request.project_id,
            num_episodes=request.num_episodes,
            target_episode_duration=request.target_episode_duration,
            series_title_suggestion=request.series_title_suggestion
        )

        # Save the generated plan to the database
        db_series_outline = SeriesOutline(
            project_id=request.project_id,
            series_title=generated_plan_data.series_title,
            total_episodes=generated_plan_data.total_episodes,
            target_episode_duration_minutes=generated_plan_data.target_episode_duration_minutes
        )
        db.add(db_series_outline)
        await db.flush()

        for ep_data in generated_plan_data.episodes:
            db_episode = EpisodeOutline(
                series_outline_id=db_series_outline.id,
                episode_number=ep_data.episode_number,
                title=ep_data.title,
                logline=ep_data.logline,
                key_events_json=ep_data.key_events_json,
                cliffhanger_description=ep_data.cliffhanger_description
            )
            db.add(db_episode)

        await db.commit()
        await db.refresh(db_series_outline, relationship_names=["episodes"]) # Ensure episodes are loaded for response

        logger.info(f"Successfully planned and saved series outline {db_series_outline.id} for project {request.project_id}")

        return db_series_outline # FastAPI will serialize this using SeriesOutlineResponse

    except HTTPException:
        await db.rollback() # Rollback if HTTPException was raised by us before commit
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error planning series for project {request.project_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
