from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

from ..db.models import UserProfileModel, ContentRatingModel, ProjectModel, WorkflowDefinitionModel
from ..schemas.user import UserProfileCreate, UserProfileUpdate, ContentRatingCreate, UserStats

def get_user_profile(db: Session, user_id: str) -> Optional[UserProfileModel]:
    return db.query(UserProfileModel).filter(UserProfileModel.user_id == user_id).first()

def get_or_create_user_profile(db: Session, user_id: str, profile_in: Optional[UserProfileCreate] = None) -> UserProfileModel:
    """Gets a user profile or creates one if it doesn't exist."""
    db_user_profile = get_user_profile(db, user_id)
    if db_user_profile:
        return db_user_profile

    # If profile_in is provided, use its data, otherwise create a minimal profile
    create_data = {"user_id": user_id}
    if profile_in:
        create_data.update(profile_in.model_dump(exclude_unset=True))

    # Ensure default values for JSON fields if not provided
    create_data.setdefault("style_preferences_json", {})
    create_data.setdefault("writing_habits_json", {})
    # Default float values are handled by the SQLAlchemy model if not provided here

    new_profile = UserProfileModel(
        **create_data,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile


def update_user_profile(db: Session, user_id: str, user_profile_update_in: UserProfileUpdate) -> Optional[UserProfileModel]:
    db_user_profile = get_user_profile(db, user_id)
    if db_user_profile:
        update_data = user_profile_update_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user_profile, key, value)
        db_user_profile.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_user_profile)
    return db_user_profile

def save_content_rating(db: Session, user_id: str, rating_in: ContentRatingCreate) -> ContentRatingModel:
    # Ensure user profile exists before saving a rating for them
    get_or_create_user_profile(db, user_id) # Auto-creates a default profile if none exists

    db_rating = ContentRatingModel(
        id=str(uuid.uuid4()), # Model default also handles this
        user_id=user_id,
        content_type=rating_in.content_type,
        content_preview=rating_in.content_preview,
        rating=rating_in.rating,
        specific_feedback_json=rating_in.specific_feedback_json if rating_in.specific_feedback_json is not None else {},
        project_id=rating_in.project_id,
        timestamp=datetime.utcnow() # Model default also handles this
    )
    db.add(db_rating)
    db.commit()
    db.refresh(db_rating)
    return db_rating

def get_user_stats(db: Session, user_id: str) -> UserStats:
    # Ensure user profile exists, even if it's just to confirm the user_id is valid for stats
    get_or_create_user_profile(db, user_id)

    total_projects = db.query(ProjectModel).filter(ProjectModel.user_id == user_id).count()

    total_workflows = db.query(WorkflowDefinitionModel).filter(
        WorkflowDefinitionModel.user_identifier == user_id
    ).count()

    ratings_query = db.query(ContentRatingModel).filter(ContentRatingModel.user_id == user_id)
    total_ratings = ratings_query.count()

    average_rating = None
    if total_ratings > 0:
        # Use SQLAlchemy's func.avg for database-side averaging
        avg_rating_result = db.query(func.avg(ContentRatingModel.rating)).filter(ContentRatingModel.user_id == user_id).scalar()
        if avg_rating_result is not None:
            average_rating = float(avg_rating_result)

    return UserStats(
        user_id=user_id,
        total_projects_created=total_projects,
        total_workflows_created=total_workflows,
        total_content_ratings_given=total_ratings,
        average_content_rating=average_rating
    )
