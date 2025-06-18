from app.celery_worker import celery_app # Updated import
from app.services.advanced_context_engine import AdvancedContextEngine
# Import DatabaseService - assuming it might be moved or accessed differently by a task
# For now, direct DB operations or a simplified service access might be needed if circular deps arise
# from app.api.routers.narrative_engine import DatabaseService # This might cause circular dependency
from app.db.session import SessionLocal
from app.db.models import Project, Character, Event, Place, KnowledgeBase # Assuming these are the correct model names
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@celery_app.task(name="architectural_analysis_task")
def architectural_analysis_task(content: str, project_id: str) -> Dict[str, Any]:
    logger.info(f"Starting architectural analysis for project_id: {project_id}")
    db: Session = SessionLocal()
    engine = AdvancedContextEngine()
    # Removed duplicated engine instantiation and analysis_data = {} and try:

    try:
        # Call the synchronous analysis method from AdvancedContextEngine
        parsed_llm_data = engine.analyze_text_for_db_population(content)
        logger.info(f"LLM analysis received for project_id: {project_id}. Keys: {parsed_llm_data.keys()}")

        if "error" in parsed_llm_data:
            logger.error(f"LLM analysis failed for project {project_id}: {parsed_llm_data.get('error')}. Raw: {parsed_llm_data.get('raw_response')}")
            # Task might fail or return error status
            return {"project_id": project_id, "status": "LLM analysis failed", "error": parsed_llm_data.get('error')}

        # Update Project model
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            logger.error(f"Project with id {project_id} not found.")
            # Depending on requirements, could create it or raise error
            # For now, let's assume project must exist, as per narrative_engine.py logic
            raise ValueError(f"Project with id {project_id} not found.")

        project.title = parsed_llm_data.get("title", project.title) # Project.author is not being set as it's not in the model
        project.updated_at = datetime.utcnow()

        # Upsert KnowledgeBase
        kb = db.query(KnowledgeBase).filter(KnowledgeBase.project_id == project_id).first()
        if not kb:
            kb = KnowledgeBase(
                id=str(uuid.uuid4()),
                project_id=project_id,
                created_at=datetime.utcnow()
            )
            db.add(kb)

        # Assuming LLM returns simple lists for characters, events, places if they are not main entities
        # The DatabaseService.save_knowledge_base in narrative_engine.py saves these as JSON strings in KB
        # and also as separate table entries. Replicating that pattern:

        # Store raw/summary JSON in KnowledgeBase table
        # The `analyze_text_for_db_population` returns characters, events, places as top-level keys
        # KnowledgeBase model has `entities`, `events`, `places`, `claims`, `themes`
        # We should decide if "characters" from LLM go into KB.entities or if KB.events should store LLM events.
        # For now, let's put the LLM's "events", "places", "themes" into the KB JSON fields.
        # And "characters" will be saved into the Character table.
        # "entities" and "claims" are not explicitly asked from LLM in the new prompt for simplicity for now.

        kb.events = json.dumps(parsed_llm_data.get('events', []), ensure_ascii=False)
        kb.places = json.dumps(parsed_llm_data.get('places', []), ensure_ascii=False)
        kb.themes = json.dumps(parsed_llm_data.get('themes', []), ensure_ascii=False) # Save themes
        kb.entities = json.dumps(parsed_llm_data.get('entities', []), ensure_ascii=False) # If LLM provides it
        kb.claims = json.dumps(parsed_llm_data.get('claims', []), ensure_ascii=False) # If LLM provides it
        kb.updated_at = datetime.utcnow()

        # Clear existing related entities before adding new ones
        db.query(Character).filter(Character.project_id == project_id).delete(synchronize_session=False)
        db.query(Event).filter(Event.project_id == project_id).delete(synchronize_session=False)
        db.query(Place).filter(Place.project_id == project_id).delete(synchronize_session=False)
        # Not deleting Claims as they are not part of this specific LLM extraction flow yet

        for char_data in parsed_llm_data.get('characters', []):
            if not isinstance(char_data, dict):
                logger.warning(f"Skipping invalid character data: {char_data}")
                continue
            character = Character(
                id=str(uuid.uuid4()),
                project_id=project_id,
                name=char_data.get('name', 'اسم غير معروف'),
                description=char_data.get('description'),
                role=char_data.get('role'),
                # personality_traits, backstory, importance_score are available in Character model
                # but not in the current simplified LLM output structure.
                created_at=datetime.utcnow()
            )
            db.add(character)

        for event_data in parsed_llm_data.get('events', []):
            if not isinstance(event_data, dict):
                logger.warning(f"Skipping invalid event data: {event_data}")
                continue
            event = Event(
                id=str(uuid.uuid4()),
                project_id=project_id,
                title=event_data.get('title', 'حدث غير مسمى'),
                description=event_data.get('description'),
                timeline_position=event_data.get('timeline_position'),
                # importance_score, related_characters are available in Event model
                created_at=datetime.utcnow()
            )
            db.add(event)

        for place_data in parsed_llm_data.get('places', []):
            if not isinstance(place_data, dict):
                logger.warning(f"Skipping invalid place data: {place_data}")
                continue
            place = Place(
                id=str(uuid.uuid4()),
                project_id=project_id,
                name=place_data.get('name', 'مكان غير معروف'),
                description=place_data.get('description'),
                significance=place_data.get('significance'),
                # atmosphere is available in Place model
                created_at=datetime.utcnow()
            )
            db.add(place)

        db.commit()
        logger.info(f"Successfully saved analysis data for project_id: {project_id}")

        return {
            "project_id": project_id,
            "status": "Analysis complete, data saved.",
            "characters_found": len(parsed_llm_data.get('characters', [])),
            "events_found": len(parsed_llm_data.get('events', [])),
            "places_found": len(parsed_llm_data.get('places', []))
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error in architectural_analysis_task for project_id {project_id}: {e}", exc_info=True)
        return {"project_id": project_id, "status": "Error during analysis", "error": str(e)}
    finally:
        db.close()
        logger.info(f"DB session closed for project_id: {project_id}")

# Note: The direct DB save logic here is an alternative to using DatabaseService.
# If DatabaseService were refactored to be Celery-friendly (no FastAPI Depends), it could be used.
# The fields saved for Character, Event, Place are based on the new LLM prompt structure.
# More fields can be added if the LLM prompt is expanded and models support them.
import uuid # Ensure uuid is imported for generating IDs.
# The SQLAlchemy models (Project, Character, Event, Place, KnowledgeBase)
# are assumed to be defined as in app.db.models and imported correctly.
# The fields used here for Character, Event, Place are simplified based on the
# LLM output structure. They should match the actual model definitions.
# For example, `personality_traits` for Character is commented out as it might be JSON.
# The `DatabaseService.save_knowledge_base` in narrative_engine.py uses more fields.
# This task's direct DB save logic should be made consistent with the models or use a refined DatabaseService.

```python
# Placeholder for the actual AdvancedContextEngine.analyze_text_sync or similar
# This would be in advanced_context_engine.py
# def analyze_text_sync(self, text: str) -> Dict[str, Any]:
#     prompt = f"""
#     Analyze the following novel text and extract the specified information.
#     Return the output STRICTLY in the following JSON format:
#     {{
#       "title": "Novel Title",
#       "author": "Author Name",
#       "themes": ["Theme 1", "Theme 2"],
#       "characters": [
#         {{"name": "Character Name", "description": "Character description", "role": "protagonist/antagonist/supporting"}},
#         ...
#       ],
#       "events": [
#         {{"title": "Event Title", "description": "Event description", "timeline_position": "e.g., Chapter 1, Early part"}},
#         ...
#       ],
#       "places": [
#         {{"name": "Place Name", "description": "Place description", "significance": "Key location, Minor setting"}},
#         ...
#       ]
#     }}

#     Novel Text:
#     {text[:15000]} # Limiting text length for the prompt
#     """
#     llm_response_str = asyncio.run(self.gemini_service.generate_content(prompt)) # Assuming gemini_service can be run sync here for simplicity
#     try:
#         return json.loads(llm_response_str)
#     except json.JSONDecodeError as e:
#         logger.error(f"Failed to parse LLM JSON response: {e}")
#         logger.error(f"LLM Response String: {llm_response_str}")
#         # Return a default/error structure or raise an exception
#         # For now, returning a dict that indicates failure to parse
#         return {"error": "Failed to parse LLM response", "raw_response": llm_response_str}

```

I've added a placeholder for the `analyze_text_sync` method that would be in `AdvancedContextEngine`. This method needs to be implemented there.
I've also used a simplified version of saving entities, directly in the task. This part would be cleaner if `DatabaseService` was refactored to be independent of FastAPI routers and usable by Celery tasks, or if dedicated CRUD functions were available.

Next, I need to update `celery_app.py` to include this new task module and then modify `AdvancedContextEngine`.
