from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ...db.session import get_db
from ...schemas.collaboration import (
    CollaborationSession,
    CollaborationSessionCreate,
    CollaborationSessionUpdate,
    BrainstormRequest
)
from ...schemas.agent import AgentMessage # For listing messages
from ...services import collaboration_service
from ...services import message_service # To get messages for a session

router = APIRouter(
    prefix="/api/collaborations",
    tags=["collaboration sessions"],
    responses={404: {"description": "Not found"}},
)

@router.post("", response_model=CollaborationSession, status_code=status.HTTP_201_CREATED)
def create_new_collaboration_session(
    session_in: CollaborationSessionCreate, db: Session = Depends(get_db)
):
    try:
        return collaboration_service.create_session(db=db, session_in=session_in)
    except HTTPException as e: # Catch validation errors from service
        raise e
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error creating session.")


@router.get("/{session_id}", response_model=CollaborationSession)
def read_collaboration_session(session_id: str, db: Session = Depends(get_db)):
    db_session = collaboration_service.get_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaboration session not found")
    return db_session

@router.put("/{session_id}/status", response_model=CollaborationSession)
def update_collaboration_session_status(
    session_id: str, status_update: Dict[str, str], db: Session = Depends(get_db) # Simple dict for status
):
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status field is required in request body.")

    db_session = collaboration_service.update_session_status(db, session_id=session_id, new_status=new_status)
    if db_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaboration session not found")
    return db_session

@router.put("/{session_id}", response_model=CollaborationSession)
def update_collaboration_session_details_endpoint( # More general update
    session_id: str, session_update: CollaborationSessionUpdate, db: Session = Depends(get_db)
):
    try:
        updated_session = collaboration_service.update_session_details(db, session_id=session_id, session_update=session_update)
        if updated_session is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaboration session not found")
        return updated_session
    except HTTPException as e: # Catch validation errors from service (e.g. agent not found)
        raise e
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error updating session.")


@router.get("/{session_id}/messages", response_model=List[AgentMessage])
def read_session_messages(
    session_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    # First, check if the session itself exists to provide a clear 404 for the session
    db_session = collaboration_service.get_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaboration session not found")

    messages = message_service.get_messages_by_session_id(db, session_id=session_id, skip=skip, limit=limit)
    # message_service.get_messages_by_session_id currently returns [] if no messages, which is fine.
    return messages

@router.post("/{session_id}/brainstorm", response_model=CollaborationSession)
def start_session_brainstorm(
    session_id: str, brainstorm_request: BrainstormRequest, db: Session = Depends(get_db)
):
    try:
        updated_session = collaboration_service.start_brainstorm(
            db, session_id=session_id, brainstorm_data=brainstorm_request
        )
        if updated_session is None: # Should be handled by service if session not found
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collaboration session not found to start brainstorm.")
        return updated_session
    except HTTPException as e: # Catch specific errors from service (e.g., session not active)
        raise e
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error starting brainstorm.")
