from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import uuid
from datetime import datetime

from ..db.models import AgentMessageModel
from ..schemas.agent import AgentMessageCreate # Corrected schema import path if schemas are in agent.py

def create_message(db: Session, message_in: AgentMessageCreate) -> AgentMessageModel:
    db_message = AgentMessageModel(
        id=str(uuid.uuid4()), # Model now handles default UUID
        from_agent_id=message_in.from_agent_id,
        to_agent_id=message_in.to_agent_id,
        session_id=message_in.session_id,
        content=message_in.content,
        metadata=message_in.metadata if message_in.metadata is not None else {},
        timestamp=datetime.utcnow() # Model now handles default timestamp
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_by_agent_id(db: Session, agent_id: str, skip: int = 0, limit: int = 100) -> List[AgentMessageModel]:
    """
    Fetches messages where the agent is either the sender or the receiver.
    Orders messages by timestamp descending (newest first).
    """
    return db.query(AgentMessageModel).filter(
        or_(
            AgentMessageModel.from_agent_id == agent_id,
            AgentMessageModel.to_agent_id == agent_id
        )
    ).order_by(AgentMessageModel.timestamp.desc()).offset(skip).limit(limit).all()

def get_messages_by_session_id(db: Session, session_id: str, skip: int = 0, limit: int = 100) -> List[AgentMessageModel]:
    """
    Fetches messages for a specific session_id.
    Orders messages by timestamp ascending (chronological).
    """
    return db.query(AgentMessageModel).filter(
        AgentMessageModel.session_id == session_id
    ).order_by(AgentMessageModel.timestamp.asc()).offset(skip).limit(limit).all()
