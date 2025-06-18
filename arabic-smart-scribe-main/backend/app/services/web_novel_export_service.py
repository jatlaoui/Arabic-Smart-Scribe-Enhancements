import logging
import json
import re # For Smart Linking
from typing import List, Dict, Any, Optional, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

# Assuming DB models are correctly imported - paths might need adjustment
from app.db.models import (
    Project,
    # Chapter, # Assuming a Chapter model if text is stored per chapter
    UnifiedKnowledgeBase, # This model might not exist as named, or its entities are directly on Project
    Character,
    Place,
    Event,
    # Asset
    # TextContent
)
# Schemas might be useful for structuring entity data if not directly from models
# from app.schemas.knowledge_base import CharacterResponse, PlaceResponse, EventResponse # Example

logger = logging.getLogger(__name__)

class WebNovelExportService:

    def __init__(self, db: AsyncSession): # db session passed to constructor
        self.db = db

    async def _fetch_project_data(self, project_id: str) -> Optional[Project]:
        """Fetches the project. In a real scenario, this would also eager load related
        novel text (e.g., chapters) and knowledge base entities."""
        logger.info(f"Fetching project data for project_id: {project_id}")

        # Example of a real query (adjust to your actual models and relationships)
        # stmt = (
        #     select(Project)
        #     .where(Project.id == project_id)
        #     .options(
        #         selectinload(Project.chapters), # If Project has 'chapters' relationship
        #         selectinload(Project.knowledge_base).options( # If Project has 'knowledge_base' relationship
        #             selectinload(UnifiedKnowledgeBase.characters), # And KB has these relationships
        #             selectinload(UnifiedKnowledgeBase.places),
        #             selectinload(UnifiedKnowledgeBase.events)
        #         )
        #     )
        # )
        # result = await self.db.execute(stmt)
        # project = result.scalar_one_or_none()
        # if not project:
        #     logger.error(f"Project with id {project_id} not found.")
        # return project

        # MOCK IMPLEMENTATION for now:
        if project_id == "test_project_for_web_novel":
            logger.warning("Using MOCK project data for _fetch_project_data")
            # Simulate a Project object. In a real case, this would be a SQLAlchemy model instance.
            # For simplicity of mocking, we'll use a dictionary-like structure for chapters and entities.

            # If Project is a SQLAlchemy model, it should be instantiated.
            # For mocking complex objects, consider using MagicMock or actual instances if simple.
            # This mock assumes 'project.title' and direct access to chapter/entity data.

            # A more realistic mock if Project is a class:
            mock_project = Project() # Assuming Project can be instantiated simply
            mock_project.id = project_id
            mock_project.title = "رياح الشرق (تجريبي)"
            # Storing chapters and entities directly on the mock object for this test
            mock_project.mock_chapters_data = [ # Using a custom attribute for mock data
                {"title": "الفصل الأول: بذرة الغضب", "content": "كان الهواء في زقاق سيدي بن عروس... التقى يوسف الصادق بصديقه المنصف في جامع الزيتونة... ثم ذهب يوسف إلى المقهى."},
                {"title": "الفصل الثاني: عاصفة وشيكة", "content": "في اليوم التالي، ناقش المنصف مع يوسف ما حدث. كان جامع الزيتونة هادئًا."}
            ]
            mock_project.mock_knowledge_base_entities = {
                "char-youssef-uuid": {"id": "char-youssef-uuid", "name": "يوسف الصادق", "type": "character", "description": "طالب زيتوني مثالي وثائر.", "image_url": "/assets/mock/youssef.jpg"},
                "char-moncef-uuid": {"id": "char-moncef-uuid", "name": "المنصف", "type": "character", "description": "صديق يوسف العملي والهادئ.", "image_url": None},
                "place-zaytouna-uuid": {"id": "place-zaytouna-uuid", "name": "جامع الزيتونة", "type": "place", "description": "مركز العلم والنضال.", "latitude": 36.798, "longitude": 10.170},
                "place-cafe-uuid": {"id": "place-cafe-uuid", "name": "المقهى", "type": "place", "description": "مقهى شعبي.", "latitude": 36.799, "longitude": 10.171},
            }
            return mock_project

        logger.warning(f"Project with id {project_id} not found for web novel export (or mock not handled).")
        return None

    def _smart_link_text(self, text_content: str, entities_map: Dict[str, Dict[str, Any]]) -> str:
        """
        Identifies entity names in text and wraps them with <entity data-id="entity-id">name</entity> tags.
        Entities_map should be: { "entity_id": {"name": "Entity Name", ...}, ... }
        """
        if not text_content or not entities_map:
            return text_content

        # Create a list of (DisplayName, EntityID) tuples, sorted by length of DisplayName (longest first)
        entity_name_id_pairs = []
        for entity_id, entity_data in entities_map.items():
            name = entity_data.get("name")
            if name:
                entity_name_id_pairs.append((name, entity_id))

        sorted_entities_for_regex = sorted(entity_name_id_pairs, key=lambda x: len(x[0]), reverse=True)

        if not sorted_entities_for_regex:
            return text_content

        # Build regex pattern: (Name1|Name2|Name3)
        # Using word boundaries () might be problematic for Arabic if not handled carefully.
        # A simple non-boundary match might over-match but is safer for now.
        # Consider NLP techniques for robust Arabic entity linking.
        regex_pattern_parts = [re.escape(name) for name, _ in sorted_entities_for_regex]
        # Using a simpler pattern for now, without word boundaries for broader matching.
        # Word boundaries like \b might not work well with Arabic text in Python's re module.
        pattern = re.compile("(" + "|".join(regex_pattern_parts) + ")", re.IGNORECASE)

        # Create a temporary map from lowercased name to original name and ID for replacement
        lower_name_to_details_map = {name.lower(): (name, entity_id) for name, entity_id in sorted_entities_for_regex}

        def replace_match(match):
            matched_text_lower = match.group(1).lower()
            if matched_text_lower in lower_name_to_details_map:
                original_name, entity_id = lower_name_to_details_map[matched_text_lower]
                return f'<entity data-id="{entity_id}">{original_name}</entity>'
            return match.group(1) # Should not happen if pattern is built from map keys

        try:
            linked_text = pattern.sub(replace_match, text_content)
            return linked_text
        except Exception as e:
            logger.error(f"Error during smart linking regex substitution: {e}", exc_info=True)
            return text_content # Return original text on error


    async def generate_live_novel_data(self, project_id: str) -> Dict[str, Any]:
        """
        Generates a comprehensive JSON data structure for a live interactive novel.
        """
        logger.info(f"Generating live novel data for project_id: {project_id}")

        project = await self._fetch_project_data(project_id) # self.db is available via __init__
        if not project:
            logger.error(f"Project {project_id} not found for live novel data generation.")
            return {"error": "Project not found", "project_id": project_id}

        output_chapters = []
        # Adapt based on how chapters/text are stored on the Project model from DB
        # Using mock structure: project.mock_chapters_data
        raw_chapters_data = getattr(project, 'mock_chapters_data', [])

        # Adapt based on how entities are stored (e.g., from project.knowledge_base.entities)
        # Using mock structure: project.mock_knowledge_base_entities
        raw_entities_map = getattr(project, 'mock_knowledge_base_entities', {})

        # Reformat entities for the final JSON output (key by ID) and for smart linking
        output_entities_dict = {}
        for entity_id, entity_data_values in raw_entities_map.items():
            output_entities_dict[entity_id] = {
                "id": entity_id, # Ensure id is part of the dict
                "name": entity_data_values.get("name"),
                "type": entity_data_values.get("type"),
                "description": entity_data_values.get("description"),
                "image_url": entity_data_values.get("image_url"),
                "latitude": entity_data_values.get("latitude"),
                "longitude": entity_data_values.get("longitude"),
            }

        for chapter_item in raw_chapters_data: # chapter_item is a dict in mock
            chapter_title = chapter_item.get("title", "Untitled Chapter")
            original_content = chapter_item.get("content", "")

            # Pass the map {entity_id: {name: "Name", ...}} to _smart_link_text
            linked_content = self._smart_link_text(original_content, output_entities_dict)

            output_chapters.append({
                "title": chapter_title,
                "content": linked_content,
            })

        live_novel_json_output = {
            "project_id": project_id,
            "title": project.title if hasattr(project, 'title') else "Untitled Project",
            "chapters": output_chapters,
            "entities": output_entities_dict, # Keyed by entity_id
        }

        logger.info(f"Successfully generated live novel data for project {project_id}.")
        return live_novel_json_output
