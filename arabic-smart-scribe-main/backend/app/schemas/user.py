from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Profile Schemas
class UserProfileBase(BaseModel):
    profile_name: Optional[str] = None
    style_preferences_json: Optional[Dict[str, Any]] = None
    writing_habits_json: Optional[Dict[str, Any]] = None
    jattlaoui_adaptation_level: Optional[float] = None
    preferred_vocabulary_complexity: Optional[float] = None
    preferred_sentence_length: Optional[float] = None
    preferred_cultural_depth: Optional[float] = None

    @field_validator('jattlaoui_adaptation_level', 'preferred_vocabulary_complexity', 'preferred_sentence_length', 'preferred_cultural_depth')
    def check_float_range(cls, v):
        if v is not None and not (0.0 <= v <= 1.0):
            raise ValueError('Float values for preferences must be between 0.0 and 1.0')
        return v

class UserProfileCreate(UserProfileBase):
    user_id: str # Must be provided on creation

class UserProfileUpdate(UserProfileBase):
    # All fields are already Optional in UserProfileBase, so this is fine for partial updates
    pass

class UserProfile(UserProfileBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    created_at: datetime
    updated_at: datetime

# Content Rating Schemas
class ContentRatingBase(BaseModel):
    content_type: Optional[str] = None
    content_preview: Optional[str] = None
    rating: int
    specific_feedback_json: Optional[Dict[str, Any]] = None
    project_id: Optional[str] = None

    @field_validator('rating')
    def check_rating_range(cls, v):
        if not (1 <= v <= 5): # Assuming a 1-5 star rating system
            raise ValueError('Rating must be between 1 and 5')
        return v

class ContentRatingCreate(ContentRatingBase):
    pass # user_id will be path parameter or from auth

class ContentRating(ContentRatingBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    timestamp: datetime

# User Statistics Schema
class UserStats(BaseModel):
    user_id: str
    total_projects_created: int
    total_workflows_created: int # Number of WorkflowDefinitionModel instances by user
    total_content_ratings_given: int
    average_content_rating: Optional[float] = None
    # Could add more, like:
    # last_activity_at: Optional[datetime] = None
    # most_used_feature: Optional[str] = None
