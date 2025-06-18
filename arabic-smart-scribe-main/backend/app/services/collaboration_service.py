from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

from ..db.models import AgentCollaborationSessionModel, AgentModel # Added AgentModel
from ..schemas.collaboration import CollaborationSessionCreate, CollaborationSessionUpdate, BrainstormRequest # Added Update schema
from fastapi import HTTPException, status # For raising exceptions

def _validate_agents_exist(db: Session, agent_ids: List[str]) -> bool:
    """Helper function to validate if all agent_ids exist."""
    if not agent_ids: # Must have at least one agent
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="agent_ids list cannot be empty.")

    found_agents_count = db.query(AgentModel).filter(AgentModel.id.in_(agent_ids)).count()
    if found_agents_count != len(set(agent_ids)): # Use set to count unique IDs provided
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more agents specified in agent_ids not found.")
    return True

def create_session(db: Session, session_in: CollaborationSessionCreate) -> AgentCollaborationSessionModel:
    _validate_agents_exist(db, session_in.agent_ids)

    db_session = AgentCollaborationSessionModel(
        id=str(uuid.uuid4()),
        name=session_in.name,
        purpose=session_in.purpose,
        agent_ids=list(set(session_in.agent_ids)), # Store unique agent IDs
        status="active", # Default status
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_session(db: Session, session_id: str) -> Optional[AgentCollaborationSessionModel]:
    return db.query(AgentCollaborationSessionModel).filter(AgentCollaborationSessionModel.id == session_id).first()

def update_session_status(db: Session, session_id: str, new_status: str) -> Optional[AgentCollaborationSessionModel]:
    db_session = get_session(db, session_id)
    if db_session:
        db_session.status = new_status
        db_session.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_session)
    return db_session

def update_session_details(db: Session, session_id: str, session_update: CollaborationSessionUpdate) -> Optional[AgentCollaborationSessionModel]:
    """More general update function for a session."""
    db_session = get_session(db, session_id)
    if not db_session:
        return None

    update_data = session_update.model_dump(exclude_unset=True)

    if "agent_ids" in update_data and update_data["agent_ids"] is not None:
        _validate_agents_exist(db, update_data["agent_ids"])
        # Ensure uniqueness if agent_ids are updated
        update_data["agent_ids"] = list(set(update_data["agent_ids"]))


    for key, value in update_data.items():
        setattr(db_session, key, value)

    db_session.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_session)
    return db_session


def start_brainstorm(db: Session, session_id: str, brainstorm_data: BrainstormRequest) -> Optional[AgentCollaborationSessionModel]:
    db_session = get_session(db, session_id)
    if db_session:
        if db_session.status != "active": # Example: only allow starting brainstorm on active sessions
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot start brainstorm. Session status is '{db_session.status}', must be 'active'."
            )
        db_session.current_activity = "brainstorming"
        db_session.activity_data = {
            "topic": brainstorm_data.topic,
            "duration_minutes": brainstorm_data.duration_minutes,
            "rounds": brainstorm_data.rounds,
            "start_time": datetime.utcnow().isoformat()
        }
        db_session.status = "brainstorming" # Also update session status
        db_session.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_session)
    return db_session
