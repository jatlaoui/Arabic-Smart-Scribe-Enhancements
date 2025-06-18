from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict # Added Dict, Any for broader use if needed
import uuid # For type hint uuid.UUID if preferred for id, though models use str

# --- Base Schemas (common fields) ---

class KnowledgeEntityBase(BaseModel):
    name: str = Field(..., min_length=1, description="Name of the entity")
    # project_id: str = Field(..., description="ID of the project this entity belongs to")
    # project_id might not be needed in create/update if entity is created via project context
    # For response, it's good. For create, it might be path param or from parent.
    description: Optional[str] = Field(None, description="Detailed description of the entity.")
    aliases: Optional[List[str]] = Field(default_factory=list, description="List of alternative names or aliases for the entity.")
    color: Optional[str] = Field(None, pattern=r"^#(?:[0-9a-fA-F]{3}){1,2}$", description="Hex color code associated with the entity, e.g., '#RRGGBB' or '#RGB'.")
    link_url: Optional[str] = Field(None, description="An external URL related to this entity.")
    is_external_link: bool = Field(False, description="Indicates if the link_url is to an external resource not managed by this system.")

# --- Character Schemas ---

class CharacterBase(KnowledgeEntityBase):
    # type: str = Field("character", Literal="character", description="Type of the entity, fixed to 'character'")
    # Literal import would be: from typing import Literal
    # For simplicity without adding Literal now, can be validated in API or with Enum
    type: str = Field("character", description="Type of the entity, should be 'character'.")
    role: Optional[str] = Field(None, description="Role of the character in the narrative (e.g., protagonist, antagonist, supporting).")
    # personality_traits: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Key-value pairs for personality traits.")
    # backstory_summary: Optional[str] = Field(None, description="A brief summary of the character's backstory.")

class CharacterCreate(CharacterBase):
    project_id: str # Required when creating a character directly linked to a project

class CharacterUpdate(BaseModel): # Allow partial updates for all fields from CharacterBase
    name: Optional[str] = None
    description: Optional[str] = None
    aliases: Optional[List[str]] = None
    color: Optional[str] = None
    link_url: Optional[str] = None
    is_external_link: Optional[bool] = None
    role: Optional[str] = None
    # personality_traits: Optional[Dict[str, Any]] = None
    # backstory_summary: Optional[str] = None
    # Note: project_id is typically not updatable this way. Type also fixed.

class CharacterResponse(CharacterBase):
    id: str
    project_id: str # Include project_id in response

    class Config:
        orm_mode = True

# --- Place Schemas ---

class PlaceBase(KnowledgeEntityBase):
    type: str = Field("place", description="Type of the entity, should be 'place'.")
    latitude: Optional[float] = Field(None, description="Latitude coordinate for the place.")
    longitude: Optional[float] = Field(None, description="Longitude coordinate for the place.")
    # atmosphere_description: Optional[str] = Field(None, description="Description of the place's atmosphere.")
    # significance_to_story: Optional[str] = Field(None, description="Significance of the place to the narrative.")

class PlaceCreate(PlaceBase):
    project_id: str # Required when creating

class PlaceUpdate(BaseModel): # Allow partial updates
    name: Optional[str] = None
    description: Optional[str] = None
    aliases: Optional[List[str]] = None
    color: Optional[str] = None
    link_url: Optional[str] = None
    is_external_link: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    # atmosphere_description: Optional[str] = None
    # significance_to_story: Optional[str] = None

class PlaceResponse(PlaceBase):
    id: str
    project_id: str

    class Config:
        orm_mode = True

# Example for a generic Entity response if needed for mixed lists
class KnowledgeEntityResponse(KnowledgeEntityBase):
    id: str
    project_id: str
    type: str # character, place, event, etc.
    # Include fields from CharacterResponse/PlaceResponse that are common or union them
    # This is a simplified version. For true polymorphism, Pydantic has other patterns.
    role: Optional[str] = None # From Character
    latitude: Optional[float] = None # From Place
    longitude: Optional[float] = None # From Place

    class Config:
        orm_mode = True
