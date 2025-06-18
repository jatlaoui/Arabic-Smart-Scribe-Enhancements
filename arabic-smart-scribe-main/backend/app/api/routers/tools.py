from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...db.session import get_db # Assuming get_db is in db.session
from ...schemas.tool import Tool, ToolCreate, ToolUpdate
from ...services import tool_service

router = APIRouter(
    prefix="/api/tools",
    tags=["tools"],
    responses={404: {"description": "Not found"}},
)

@router.post("", response_model=Tool, status_code=status.HTTP_201_CREATED)
def create_new_tool(
    tool: ToolCreate, db: Session = Depends(get_db)
):
    # Check if function_name already exists (as it's unique in model)
    # This check should ideally be in the service or handled by DB unique constraint error
    # For now, adding a basic check here. A more robust app would have a specific exception for this.
    # existing_tool = db.query(tool_service.ToolModel).filter(tool_service.ToolModel.function_name == tool.function_name).first()
    # if existing_tool:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tool with this function_name already exists.")
    return tool_service.create_tool(db=db, tool=tool)

@router.get("", response_model=List[Tool])
def read_all_tools(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    tools = tool_service.get_tools(db, skip=skip, limit=limit)
    return tools

@router.get("/{tool_id}", response_model=Tool)
def read_single_tool(tool_id: str, db: Session = Depends(get_db)):
    db_tool = tool_service.get_tool(db, tool_id=tool_id)
    if db_tool is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    return db_tool

@router.put("/{tool_id}", response_model=Tool)
def update_existing_tool(
    tool_id: str, tool: ToolUpdate, db: Session = Depends(get_db)
):
    db_tool = tool_service.update_tool(db, tool_id=tool_id, tool_update=tool)
    if db_tool is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    return db_tool

@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_tool(tool_id: str, db: Session = Depends(get_db)):
    deleted = tool_service.delete_tool(db, tool_id=tool_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    return # No content for 204
