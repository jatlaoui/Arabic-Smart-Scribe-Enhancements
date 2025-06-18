import logging
from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid # For generating IDs if models don't auto-generate str/uuid correctly via default

# Schemas
from app.schemas.knowledge_entity import (
    CharacterCreate, CharacterUpdate, CharacterResponse,
    PlaceCreate, PlaceUpdate, PlaceResponse
)
# Models
from app.db.models import Character, Place, User, Project # User for auth, Project for linking
# Dependencies
from app.api.dependencies.database import get_db # Ensure this provides AsyncSession
from app.api.dependencies.users import get_current_active_user

logger = logging.getLogger(__name__)
router = APIRouter()

# --- Character Endpoints ---

@router.post("/characters", response_model=CharacterResponse, status_code=status.HTTP_201_CREATED, summary="Create Character")
async def create_character_endpoint( # Renamed to avoid conflict if Character model is imported directly
    character_in: CharacterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Character:
    # Check if project exists
    project = await db.get(Project, character_in.project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project with id {character_in.project_id} not found.")
    if project.user_id != current_user.id: # Basic ownership check
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add character to this project.")

    # Assuming Character model's ID is auto-generated (e.g. default=lambda: str(uuid.uuid4()))
    # And Character model has user_id field to store creator. This needs to be in the model.
    # If Character model needs explicit user_id set:
    # db_character_data = character_in.model_dump()
    # db_character_data['user_id'] = current_user.id # Add if model has user_id
    # db_character = Character(**db_character_data)
    # Else if no user_id on Character model directly:
    db_character = Character(**character_in.model_dump())

    db.add(db_character)
    await db.commit()
    await db.refresh(db_character)
    logger.info(f"Character '{db_character.name}' (ID: {db_character.id}) created by user {current_user.id} for project {character_in.project_id}")
    return db_character

@router.get("/projects/{project_id}/characters", response_model=List[CharacterResponse], summary="List Characters for Project")
async def list_characters_for_project_endpoint(
    project_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[Character]:
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    if project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view characters for this project.")

    stmt = select(Character).where(Character.project_id == project_id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    characters = result.scalars().all()
    return characters

@router.get("/characters/{character_id}", response_model=CharacterResponse, summary="Get Character by ID")
async def get_character_endpoint( # Renamed
    character_id: str, # Assuming ID is string, adjust if UUID object directly
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Character:
    db_character = await db.get(Character, character_id) # get by PK
    if not db_character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found.")

    project = await db.get(Project, db_character.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this character.")
    return db_character

@router.put("/characters/{character_id}", response_model=CharacterResponse, summary="Update Character")
async def update_character_endpoint( # Renamed
    character_id: str,
    character_in: CharacterUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Character:
    db_character = await db.get(Character, character_id)
    if not db_character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found.")

    project = await db.get(Project, db_character.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this character.")

    update_data = character_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_character, key, value)

    await db.commit()
    await db.refresh(db_character)
    logger.info(f"Character ID {character_id} updated by user {current_user.id}")
    return db_character

@router.delete("/characters/{character_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Character")
async def delete_character_endpoint( # Renamed
    character_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_character = await db.get(Character, character_id)
    if not db_character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found.")

    project = await db.get(Project, db_character.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this character.")

    await db.delete(db_character)
    await db.commit()
    logger.info(f"Character ID {character_id} deleted by user {current_user.id}")
    # For 204, FastAPI expects no content. Return None or use Response(status_code=204)
    return None


# --- Place Endpoints ---

@router.post("/places", response_model=PlaceResponse, status_code=status.HTTP_201_CREATED, summary="Create Place")
async def create_place_endpoint( # Renamed
    place_in: PlaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Place:
    project = await db.get(Project, place_in.project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    if project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add place to this project.")

    # Similar to Character, assuming Place model might need user_id if tracking creator
    # db_place_data = place_in.model_dump()
    # db_place_data['user_id'] = current_user.id # If Place model has user_id
    # db_place = Place(**db_place_data)
    db_place = Place(**place_in.model_dump())

    db.add(db_place)
    await db.commit()
    await db.refresh(db_place)
    logger.info(f"Place '{db_place.name}' (ID: {db_place.id}) created by user {current_user.id} for project {place_in.project_id}")
    return db_place

@router.get("/projects/{project_id}/places", response_model=List[PlaceResponse], summary="List Places for Project")
async def list_places_for_project_endpoint(
    project_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[Place]:
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
    if project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view places for this project.")

    stmt = select(Place).where(Place.project_id == project_id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    places = result.scalars().all()
    return places

@router.get("/places/{place_id}", response_model=PlaceResponse, summary="Get Place by ID")
async def get_place_endpoint( # Renamed
    place_id: str, # Assuming ID is string
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Place:
    db_place = await db.get(Place, place_id)
    if not db_place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found.")

    project = await db.get(Project, db_place.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this place.")
    return db_place

@router.put("/places/{place_id}", response_model=PlaceResponse, summary="Update Place")
async def update_place_endpoint( # Renamed
    place_id: str,
    place_in: PlaceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Place:
    db_place = await db.get(Place, place_id)
    if not db_place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found.")

    project = await db.get(Project, db_place.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this place.")

    update_data = place_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_place, key, value)

    await db.commit()
    await db.refresh(db_place)
    logger.info(f"Place ID {place_id} updated by user {current_user.id}")
    return db_place

@router.delete("/places/{place_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Place")
async def delete_place_endpoint( # Renamed
    place_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_place = await db.get(Place, place_id)
    if not db_place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found.")

    project = await db.get(Project, db_place.project_id)
    if not project or project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this place.")

    await db.delete(db_place)
    await db.commit()
    logger.info(f"Place ID {place_id} deleted by user {current_user.id}")
    return None
