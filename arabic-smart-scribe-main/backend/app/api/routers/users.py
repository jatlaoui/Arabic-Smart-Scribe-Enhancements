from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ...db.session import get_db
from ...schemas.user import (
    UserProfile,
    UserProfileCreate, # For creating profile if not exists via get_or_create
    UserProfileUpdate,
    ContentRating,
    ContentRatingCreate,
    UserStats
)
from ...services import user_service

router = APIRouter(
    prefix="/api/users",
    tags=["users & profiles"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{user_id}/profile", response_model=UserProfile)
def read_user_profile(user_id: str, db: Session = Depends(get_db)):
    # get_or_create_user_profile ensures a profile is returned or created with defaults
    db_user_profile = user_service.get_or_create_user_profile(db, user_id=user_id)
    # No need to check for None here as get_or_create handles it
    return db_user_profile

@router.put("/{user_id}/profile", response_model=UserProfile)
def update_user_profile_endpoint( # Renamed to avoid conflict
    user_id: str, profile_update: UserProfileUpdate, db: Session = Depends(get_db)
):
    updated_profile = user_service.update_user_profile(
        db, user_id=user_id, user_profile_update_in=profile_update
    )
    if updated_profile is None:
        # This case might indicate the profile didn't exist and creation on PUT is not desired
        # However, get_or_create_user_profile could be called first if auto-creation on PUT is desired
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found, cannot update.")
    return updated_profile

@router.post("/{user_id}/ratings", response_model=ContentRating, status_code=status.HTTP_201_CREATED)
def save_new_content_rating(
    user_id: str, rating_in: ContentRatingCreate, db: Session = Depends(get_db)
):
    # The user_service.save_content_rating handles user profile check (get_or_create)
    try:
        return user_service.save_content_rating(db=db, user_id=user_id, rating_in=rating_in)
    except Exception as e:
        # Catch potential errors, e.g., if project_id in rating_in is invalid ForeignKey
        # Or if rating value is out of Pydantic model validation (though that should give 422)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not save rating: {str(e)}")


@router.get("/{user_id}/stats", response_model=UserStats)
def read_user_stats(user_id: str, db: Session = Depends(get_db)):
    # The user_service.get_user_stats handles user profile check (get_or_create)
    stats = user_service.get_user_stats(db, user_id=user_id)
    # user_stats service function always returns a UserStats object,
    # so no need to check for None unless an error is raised from the service.
    return stats
