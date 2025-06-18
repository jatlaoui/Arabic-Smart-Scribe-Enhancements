from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from ..db.models import ToolModel
from ..schemas.tool import ToolCreate, ToolUpdate

def create_tool(db: Session, tool: ToolCreate) -> ToolModel:
    db_tool = ToolModel(
        id=str(uuid.uuid4()),
        name=tool.name,
        category=tool.category,
        description=tool.description,
        function_name=tool.function_name,
        config=tool.config if tool.config is not None else {},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    return db_tool

def get_tool(db: Session, tool_id: str) -> Optional[ToolModel]:
    return db.query(ToolModel).filter(ToolModel.id == tool_id).first()

def get_tools(db: Session, skip: int = 0, limit: int = 100) -> List[ToolModel]:
    return db.query(ToolModel).offset(skip).limit(limit).all()

def update_tool(db: Session, tool_id: str, tool_update: ToolUpdate) -> Optional[ToolModel]:
    db_tool = get_tool(db, tool_id)
    if db_tool:
        update_data = tool_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_tool, key, value)
        db_tool.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_tool)
    return db_tool

def delete_tool(db: Session, tool_id: str) -> bool:
    db_tool = get_tool(db, tool_id)
    if db_tool:
        db.delete(db_tool)
        db.commit()
        return True
    return False
