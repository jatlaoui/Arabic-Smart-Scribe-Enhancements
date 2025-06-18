import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Path # Added Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.web_novel import LiveNovelDataResponse
from app.db.models import User, Project
from app.services.web_novel_export_service import WebNovelExportService
from app.api.dependencies.database import get_db
from app.api.dependencies.users import get_current_active_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get(
    "/projects/{project_id}/live-novel-data",
    response_model=LiveNovelDataResponse,
    summary="Get Live Interactive Novel Data",
    description="Retrieves a comprehensive JSON package for a project, suitable for rendering an interactive web novel."
)
async def get_live_novel_data_endpoint(
    project_id: str = Path(..., description="The ID of the project to retrieve data for", min_length=1), # Added min_length
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> LiveNovelDataResponse: # Use specific response model for type hint
    logger.info(f"User {current_user.id} requesting live novel data for project_id: {project_id}")

    project = await db.get(Project, project_id)
    if not project:
        logger.warning(f"Project not found: {project_id} for user {current_user.id}")
        raise HTTPException(status_code=404, detail=f"Project with id {project_id} not found.")

    if project.user_id != current_user.id: # Basic ownership check
         logger.warning(f"User {current_user.id} attempted to access unauthorized project {project_id}.")
         raise HTTPException(status_code=403, detail="Not authorized to access this project.")

    try:
        export_service = WebNovelExportService(db=db)
        live_data_dict = await export_service.generate_live_novel_data(project_id=project_id)

        if live_data_dict.get("error"):
            logger.error(f"Service error for live novel data, project {project_id}: {live_data_dict['error']}")
            # Determine status code based on error type if possible
            status_code = 404 if "not found" in live_data_dict["error"].lower() else 500
            raise HTTPException(status_code=status_code, detail=live_data_dict["error"])

        # FastAPI will validate against LiveNovelDataResponse due to response_model
        return live_data_dict

    except HTTPException:
        raise
    except Exception as e:
        # Do not rollback here if all operations in service were read-only.
        # await db.rollback()
        logger.error(f"Unexpected error generating live novel data for project {project_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
