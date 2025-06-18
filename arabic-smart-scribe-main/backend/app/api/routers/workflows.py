from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from ...db.session import get_db
from ...schemas.workflow import (
    WorkflowDefinition,
    WorkflowDefinitionCreate,
    WorkflowDefinitionUpdate,
    WorkflowRunRequest
)
from ...services import workflow_service

router = APIRouter(
    prefix="/api/workflows",
    tags=["workflows"],
    responses={404: {"description": "Not found"}},
)

@router.post("", response_model=WorkflowDefinition, status_code=status.HTTP_201_CREATED)
def create_new_workflow(
    workflow_in: WorkflowDefinitionCreate,
    user_id: Optional[str] = Body(None, embed=True), # Example of getting user_id, replace with auth later
    db: Session = Depends(get_db)
):
    return workflow_service.create_workflow(db=db, workflow_in=workflow_in, user_id=user_id)

@router.get("/public", response_model=List[WorkflowDefinition])
def read_public_workflows(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return workflow_service.get_public_workflows(db, skip=skip, limit=limit)

# This might be protected and use Depends(get_current_user) in a real app
@router.get("/user/{user_id_param}", response_model=List[WorkflowDefinition])
def read_user_workflows(
    user_id_param: str, # Renamed to avoid conflict with user_id from Body/Auth
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # In a real app, user_id_param might be ignored and current authenticated user's ID used.
    return workflow_service.get_workflows_by_user(db, user_id=user_id_param, skip=skip, limit=limit)


@router.get("/{workflow_id}", response_model=WorkflowDefinition)
def read_single_workflow(workflow_id: str, db: Session = Depends(get_db)):
    db_workflow = workflow_service.get_workflow(db, workflow_id=workflow_id)
    if db_workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    return db_workflow

@router.put("/{workflow_id}", response_model=WorkflowDefinition)
def update_existing_workflow(
    workflow_id: str,
    workflow_update: WorkflowDefinitionUpdate,
    user_id: Optional[str] = Body(None, embed=True), # For ownership check, replace with auth
    db: Session = Depends(get_db)
):
    updated_workflow = workflow_service.update_workflow(
        db, workflow_id=workflow_id, workflow_update=workflow_update, user_id=user_id
    )
    if updated_workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    return updated_workflow

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_workflow(
    workflow_id: str,
    user_id: Optional[str] = Body(None, embed=True), # For ownership check, replace with auth
    db: Session = Depends(get_db)
):
    deleted = workflow_service.delete_workflow(db, workflow_id=workflow_id, user_id=user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found or not authorized to delete")
    return

@router.post("/{workflow_id}/run", response_model=Dict[str, Any])
async def run_workflow_endpoint( # Made async as the service function is async
    workflow_id: str,
    run_request: WorkflowRunRequest, # Contains initial_data
    db: Session = Depends(get_db)
):
    try:
        result = await workflow_service.run_workflow_simplified(
            db, workflow_id=workflow_id, initial_data=run_request.initial_data
        )
        return result
    except HTTPException as e:
        raise e # Re-raise HTTPException from service (e.g., 404, 400, 501)
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error running workflow: {str(e)}")
