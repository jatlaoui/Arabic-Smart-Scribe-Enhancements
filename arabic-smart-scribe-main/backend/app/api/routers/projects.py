
from fastapi import APIRouter, HTTPException, Depends, status as http_status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import uuid
from pydantic import BaseModel

from ...schemas.project import ProjectCreate, ProjectUpdate, Project
from ...db.models import Project as ProjectModel
from ..dependencies import get_db

router = APIRouter(prefix="/api/projects", tags=["projects"])

# Helper function to convert ProjectModel to Project schema, calculating word_count
def model_to_schema(project_model: ProjectModel) -> Project:
    project_data = project_model.__dict__
    project_data["word_count"] = len(project_model.content.split()) if project_model.content else 0
    # Ensure created_at and updated_at are datetime objects if they are not already
    if isinstance(project_data.get("created_at"), str):
        project_data["created_at"] = datetime.fromisoformat(project_data["created_at"])
    if isinstance(project_data.get("updated_at"), str):
        project_data["updated_at"] = datetime.fromisoformat(project_data["updated_at"])

    # Handle potential None for tags before creating Project schema instance
    if project_data.get("tags") is None:
        project_data["tags"] = []

    return Project.model_validate(project_data)

class StageUpdate(BaseModel):
    stage: str

class MetadataUpdate(BaseModel):
    metadata: Dict[str, Any]

@router.post("", response_model=Project, status_code=http_status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user) # Example for user_id
):
    """Create new project"""
    db_project = ProjectModel(
        id=str(uuid.uuid4()),
        title=project.title,
        content=project.content,
        description=project.description,
        # user_id=current_user.id, # Assign user_id if auth is implemented
        # stage, metadata, status, tags will use default values from the model if not provided
        # However, ProjectCreate inherits from ProjectBase which has stage and metadata
        stage=project.stage if project.stage is not None else "initial", # Explicitly set from schema or default
        metadata=project.metadata if project.metadata is not None else {}, # Explicitly set from schema or default
        created_at=datetime.now(),
        updated_at=datetime.now()
        # word_count is not a DB column
        # status and tags use DB defaults
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return model_to_schema(db_project)

@router.get("", response_model=List[Project])
async def list_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List all projects"""
    projects_models = db.query(ProjectModel).offset(skip).limit(limit).all()
    return [model_to_schema(p) for p in projects_models]

@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific project by its ID"""
    project_model = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if project_model is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Project not found")
    return model_to_schema(project_model)

@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """Update a project's title, content, or description"""
    project_model = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if project_model is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project_model, key, value)

    project_model.updated_at = datetime.now()

    db.commit()
    db.refresh(project_model)
    return model_to_schema(project_model)

from fastapi.responses import StreamingResponse
import io

@router.get("/{project_id}/export_txt")
async def export_project_as_txt(
    project_id: str,
    db: Session = Depends(get_db)
):
    """Export project content as a TXT file."""
    project_model = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if project_model is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Assemble content
    # For now, primarily using project.content.
    # Future enhancements could involve assembling from chapters stored elsewhere, e.g., in KnowledgeBase or separate Chapter models.

    title = project_model.title if project_model.title else "Untitled_Project"
    description = project_model.description if project_model.description else "No description."
    main_content = project_model.content if project_model.content else "No main content available for this project."

    full_text_parts = [
        f"Title: {title}",
        f"Description: {description}",
        "\n" + "="*50 + "\n",
        "Content:",
        main_content
    ]
    full_text = "\n\n".join(full_text_parts)

    file_like_object = io.BytesIO(full_text.encode('utf-8'))

    # Clean the title for the filename
    safe_filename_title = "".join(c if c.isalnum() or c in " _-" else "_" for c in title)
    if not safe_filename_title: # handle empty or fully non-alphanumeric titles
        safe_filename_title = "project_export"

    response_headers = {
        "Content-Disposition": f"attachment; filename=\"{safe_filename_title}.txt\""
    }

    return StreamingResponse(file_like_object, media_type="text/plain", headers=response_headers)

@router.delete("/{project_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db)
):
    """Delete a project by its ID"""
    project_model = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if project_model is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project_model)
    db.commit()
    return None # FastAPI will return 204 No Content

@router.put("/{project_id}/stage", response_model=Project)
async def update_project_stage(
    project_id: str,
    stage_update: StageUpdate,
    db: Session = Depends(get_db)
):
    """Update a project's stage"""
    project_model = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if project_model is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Project not found")

    project_model.stage = stage_update.stage
    project_model.updated_at = datetime.now()

    db.commit()
    db.refresh(project_model)
    return model_to_schema(project_model)

@router.put("/{project_id}/metadata", response_model=Project)
async def update_project_metadata(
    project_id: str,
    metadata_update: MetadataUpdate,
    db: Session = Depends(get_db)
):
    """Update a project's metadata (replaces existing metadata)"""
    project_model = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if project_model is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Project not found")

    project_model.metadata = metadata_update.metadata
    project_model.updated_at = datetime.now()

    db.commit()
    db.refresh(project_model)
    return model_to_schema(project_model)
