from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from ..db.models import AgentModel
from ..schemas.agent import AgentCreate, AgentUpdate

def create_agent(db: Session, agent: AgentCreate) -> AgentModel:
    db_agent = AgentModel(
        id=str(uuid.uuid4()),
        name=agent.name,
        type=agent.type,
        description=agent.description,
        config=agent.config if agent.config is not None else {},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

def get_agent(db: Session, agent_id: str) -> Optional[AgentModel]:
    return db.query(AgentModel).filter(AgentModel.id == agent_id).first()

def get_agents(db: Session, skip: int = 0, limit: int = 100) -> List[AgentModel]:
    return db.query(AgentModel).offset(skip).limit(limit).all()

def update_agent(db: Session, agent_id: str, agent_update: AgentUpdate) -> Optional[AgentModel]:
    db_agent = get_agent(db, agent_id)
    if db_agent:
        update_data = agent_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_agent, key, value)
        db_agent.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_agent)
    return db_agent

def delete_agent(db: Session, agent_id: str) -> bool:
    db_agent = get_agent(db, agent_id)
    if db_agent:
        db.delete(db_agent)
        db.commit()
        return True
    return False
