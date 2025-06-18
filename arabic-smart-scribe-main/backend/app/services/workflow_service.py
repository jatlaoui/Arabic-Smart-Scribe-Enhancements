from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

from ..db.models import WorkflowDefinitionModel
from ..schemas.workflow import WorkflowDefinitionCreate, WorkflowDefinitionUpdate
from fastapi import HTTPException, status

# Import Celery tasks - adjust paths as necessary
# Assuming tasks are structured in a way that they can be imported like this.
# If tasks are not found, the run_workflow_simplified will need adjustment or those specific cases removed.
try:
    from ..tasks.narrative_tasks import architectural_analysis_task
except ImportError:
    architectural_analysis_task = None
    print("Warning: architectural_analysis_task not found. Workflow execution for it will fail.")

try:
    from ..tasks.video_tasks import process_video_to_book_task # Placeholder name
except ImportError:
    process_video_to_book_task = None
    print("Warning: process_video_to_book_task not found. Workflow execution for it will fail.")


def create_workflow(db: Session, workflow_in: WorkflowDefinitionCreate, user_id: Optional[str]) -> WorkflowDefinitionModel:
    db_workflow = WorkflowDefinitionModel(
        id=str(uuid.uuid4()),
        name=workflow_in.name,
        description=workflow_in.description,
        workflow_json=workflow_in.workflow_json,
        user_identifier=user_id,
        is_template=workflow_in.is_template,
        is_public=workflow_in.is_public,
        tags_json=workflow_in.tags_json,
        complexity_level=workflow_in.complexity_level,
        estimated_duration_minutes=workflow_in.estimated_duration_minutes,
        usage_count=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def get_workflow(db: Session, workflow_id: str) -> Optional[WorkflowDefinitionModel]:
    return db.query(WorkflowDefinitionModel).filter(WorkflowDefinitionModel.id == workflow_id).first()

def get_workflows_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[WorkflowDefinitionModel]:
    return db.query(WorkflowDefinitionModel).filter(WorkflowDefinitionModel.user_identifier == user_id).order_by(desc(WorkflowDefinitionModel.updated_at)).offset(skip).limit(limit).all()

def get_public_workflows(db: Session, skip: int = 0, limit: int = 100) -> List[WorkflowDefinitionModel]:
    """Fetches public workflows, typically used as templates."""
    return db.query(WorkflowDefinitionModel).filter(WorkflowDefinitionModel.is_public == True).order_by(desc(WorkflowDefinitionModel.usage_count)).offset(skip).limit(limit).all()

def update_workflow(db: Session, workflow_id: str, workflow_update: WorkflowDefinitionUpdate, user_id: Optional[str]) -> Optional[WorkflowDefinitionModel]:
    db_workflow = get_workflow(db, workflow_id)
    if not db_workflow:
        return None

    # Optional: Check ownership if user_id is provided and workflow is not public/template
    # if db_workflow.user_identifier != user_id and not db_workflow.is_public:
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this workflow")

    update_data = workflow_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_workflow, key, value)

    db_workflow.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def delete_workflow(db: Session, workflow_id: str, user_id: Optional[str]) -> bool:
    db_workflow = get_workflow(db, workflow_id)
    if not db_workflow:
        return False

    # Optional: Check ownership
    # if db_workflow.user_identifier != user_id and not db_workflow.is_public: # Or some admin role check
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this workflow")

    db.delete(db_workflow)
    db.commit()
    return True

def increment_workflow_usage(db: Session, workflow_id: str) -> Optional[WorkflowDefinitionModel]:
    db_workflow = get_workflow(db, workflow_id)
    if db_workflow:
        db_workflow.usage_count = (db_workflow.usage_count or 0) + 1
        db_workflow.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_workflow)
    return db_workflow

async def run_workflow_simplified(db: Session, workflow_id: str, initial_data: Dict[str, Any]) -> Dict[str, Any]:
    workflow = get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow definition not found")

    increment_workflow_usage(db, workflow_id)

    # Determine task based on workflow properties
    # This is a simplified mapping logic. A more robust system might use a dedicated field in workflow_json.
    task_to_run = None
    task_args = []
    task_kwargs = {}

    # Example: Use a field in workflow_json or the name to map to a task
    workflow_type = workflow.workflow_json.get("execution_type", workflow.name) # Prefer execution_type if present

    if "Architectural Analysis" in workflow_type or "architectural_analysis" in workflow_type:
        if architectural_analysis_task:
            content = initial_data.get("content")
            project_id = initial_data.get("project_id")
            if not content or not project_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing 'content' or 'project_id' in initial_data for Architectural Analysis.")
            task_to_run = architectural_analysis_task
            task_args = [content, project_id]
        else:
            return {"error": "Architectural Analysis task is not configured."}

    elif "Video to Book" in workflow_type or "video_to_book" in workflow_type:
        if process_video_to_book_task:
            # Example: Extract parameters for this task from initial_data
            raw_transcript = initial_data.get("raw_transcript")
            style_guide = initial_data.get("style_guide", "default_style") # Default if not provided
            project_id = initial_data.get("project_id") # Assuming it might need project_id
            if not raw_transcript or not project_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing 'raw_transcript' or 'project_id' in initial_data for Video to Book.")
            task_to_run = process_video_to_book_task
            task_args = [raw_transcript, style_guide, project_id] # Adjust args as per actual task signature
        else:
            return {"error": "Video to Book task is not configured."}

    # Add more mappings here for other workflow types / Celery tasks

    if task_to_run:
        task_instance = task_to_run.apply_async(args=task_args, kwargs=task_kwargs)
        return {"task_id": task_instance.id, "status": "started", "message": f"Workflow '{workflow.name}' task started."}
    else:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED,
                            detail=f"No execution logic defined for workflow type: {workflow_type}")
