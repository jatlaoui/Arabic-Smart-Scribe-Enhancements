from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...db.session import get_db
from ...schemas.agent import Agent, AgentCreate, AgentUpdate, AgentMessage, AgentMessageCreate # Added message schemas
from ...services import agent_service
from ...services import message_service # Added message service

router = APIRouter(
    prefix="/api/agents", # Keep existing prefix for agent CRUD
    tags=["agents"],
    responses={404: {"description": "Not found"}},
)

@router.post("", response_model=Agent, status_code=status.HTTP_201_CREATED)
def create_new_agent(
    agent: AgentCreate, db: Session = Depends(get_db)
):
    return agent_service.create_agent(db=db, agent=agent)

@router.get("", response_model=List[Agent])
def read_all_agents(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    agents = agent_service.get_agents(db, skip=skip, limit=limit)
    return agents

@router.get("/{agent_id}", response_model=Agent)
def read_single_agent(agent_id: str, db: Session = Depends(get_db)):
    db_agent = agent_service.get_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return db_agent

@router.put("/{agent_id}", response_model=Agent)
def update_existing_agent(
    agent_id: str, agent: AgentUpdate, db: Session = Depends(get_db)
):
    db_agent = agent_service.update_agent(db, agent_id=agent_id, agent_update=agent)
    if db_agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return db_agent

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_agent(agent_id: str, db: Session = Depends(get_db)):
    deleted = agent_service.delete_agent(db, agent_id=agent_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return # No content for 204


# Agent Messaging Endpoints
# Adding them here to keep agent-related functionalities grouped.
# Alternatively, a new router for messages could be created.

@router.post("/messages", response_model=AgentMessage, status_code=status.HTTP_201_CREATED, tags=["agent messages"])
def send_agent_message(
    message: AgentMessageCreate, db: Session = Depends(get_db)
):
    # Optional: Validate that from_agent_id and to_agent_id exist
    from_agent = agent_service.get_agent(db, agent_id=message.from_agent_id)
    if not from_agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sender agent with id {message.from_agent_id} not found")

    to_agent = agent_service.get_agent(db, agent_id=message.to_agent_id)
    if not to_agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Recipient agent with id {message.to_agent_id} not found")

    return message_service.create_message(db=db, message_in=message)

@router.get("/{agent_id}/messages", response_model=List[AgentMessage], tags=["agent messages"])
def read_messages_for_agent(
    agent_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    # Check if agent exists
    db_agent = agent_service.get_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    messages = message_service.get_messages_by_agent_id(db, agent_id=agent_id, skip=skip, limit=limit)
    return messages

# Endpoint for messages by session_id - might be better in a separate /sessions router if that concept grows
@router.get("/messages/session/{session_id}", response_model=List[AgentMessage], tags=["agent messages session"])
def read_messages_by_session( # Added distinct function name
    session_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    messages = message_service.get_messages_by_session_id(db, session_id=session_id, skip=skip, limit=limit)
    if not messages: # Optional: raise 404 if no messages found for session, or return empty list
        # raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No messages found for this session or session does not exist")
        pass # Current service method returns empty list if none found
    return messages
