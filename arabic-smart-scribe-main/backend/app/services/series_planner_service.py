import logging
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

# Assuming GeminiService is used for LLM calls
from app.services.gemini_service import GeminiService
# Assuming DB models are correctly imported - adjust paths as per actual structure
from app.db.models import Event, Project, KnowledgeBase
# from app.schemas.event import Event as EventSchema # If using Pydantic schemas

logger = logging.getLogger(__name__)

class SeriesPlannerService:
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service

    async def _fetch_events_for_project(self, db: AsyncSession, project_id: str) -> List[Event]:
        """
        Fetches and sorts all relevant events for a given project.
        This is a placeholder and needs to be adapted to how Events are stored and linked.
        Events might be part of a KnowledgeBase linked to the project, or directly linked.
        The 'Event' model used here needs to have 'id', 'name', 'description', 'timestamp' (for sorting),
        and potentially 'significance_level' attributes as used in mock data.
        """
        logger.info(f"Fetching events for project_id: {project_id}")

        # Actual database query would be something like this (needs schema adjustment):
        # stmt = (
        #     select(Event)
        #     .join(KnowledgeBase, KnowledgeBase.id == Event.knowledge_base_id) # Example join
        #     .where(KnowledgeBase.project_id == project_id)
        #     .order_by(Event.timestamp) # Or some other sequence determining field
        # )
        # result = await db.execute(stmt)
        # events = result.scalars().all()
        # if events:
        #     return list(events) # Ensure it's a list

        # MOCK IMPLEMENTATION for now:
        if project_id == "test_project_with_events": # Use a specific ID for mock testing
            logger.warning("Using MOCK event data for _fetch_events_for_project")
            # Ensure the mock Event objects have the attributes accessed later
            mock_events_data = [
                {"id":"evt1", "name":"Inciting Incident", "description":"The hero receives a call to adventure.", "timestamp":1, "significance_level":8},
                {"id":"evt2", "name":"First Challenge", "description":"The hero faces their first real test.", "timestamp":2, "significance_level":6},
                {"id":"evt3", "name":"Midpoint", "description":"A major turning point changes the stakes.", "timestamp":3, "significance_level":9},
                {"id":"evt4", "name":"Climax Setup", "description":"All paths converge towards the final confrontation.", "timestamp":4, "significance_level":7},
                {"id":"evt5", "name":"Final Battle", "description":"The hero confronts the antagonist.", "timestamp":5, "significance_level":10},
                {"id":"evt6", "name":"Resolution", "description":"The aftermath of the final battle.", "timestamp":6, "significance_level":5},
            ]
            # Create mock Event instances. A proper mock object might be better.
            # For simplicity, using dicts that mimic Event structure if Event model is complex.
            # If Event is a simple class, instantiate it: Event(**data)
            # This part assumes Event can be constructed or represented by these dicts for the service logic.
            # For the service logic to work, these need to behave like Event objects.
            # Let's assume Event model can be instantiated like this for mocking:
            mock_events_obj = []
            for data in mock_events_data:
                mock_event = Event() # Create empty Event
                for key, value in data.items():
                    setattr(mock_event, key, value) # Set attributes
                mock_events_obj.append(mock_event)

            return sorted(mock_events_obj, key=lambda e: e.timestamp if hasattr(e, 'timestamp') else 0)

        logger.warning(f"No specific event fetching logic or mock data for project {project_id}, returning empty list.")
        return []

    async def _generate_episode_metadata_with_gemini(
        self,
        episode_events_descriptions: List[str],
        episode_number: int,
        series_context: str = ""
    ) -> Dict[str, str]:
        """
        Uses GeminiService to generate title, logline, and cliffhanger for an episode.
        """
        if not episode_events_descriptions:
            return {
                "title": f"الحلقة {episode_number}: أحداث غير محددة",
                "logline": "لم يتم تحديد أحداث لهذه الحلقة.",
                "cliffhanger_description": "نهاية غامضة."
            }

        events_summary = "\n- ".join(episode_events_descriptions)

        prompt = f\"\"\"
        السياق العام للمسلسل: {series_context}

        أحداث الحلقة رقم {episode_number}:
        - {events_summary}

        بناءً على هذه الأحداث، قم بتوليد ما يلي لهذه الحلقة:
        1. عنوان جذاب للحلقة (title).
        2. ملخص من جملة أو جملتين يصف جوهر الحلقة (logline).
        3. وصف لنقطة تشويق أو نهاية مفتوحة إذا كانت الأحداث تسمح بذلك (cliffhanger_description). إذا لم يكن هناك تشويق واضح، اترك هذا الحقل فارغاً أو صف نهاية الحلقة بشكل عام.

        الرجاء إرجاع الإجابة بتنسيق JSON صالح بالمفاتيح التالية: "title", "logline", "cliffhanger_description".
        مثال: {{"title": "عنوان الحلقة", "logline": "ملخص الحلقة...", "cliffhanger_description": "وصف النهاية المشوقة..."}}
        \"\"\"

        logger.debug(f"Prompt for Gemini (episode {episode_number} metadata):\n{prompt[:300]}...")

        try:
            # This assumes GeminiService has a method like 'generate_structured_data' or similar.
            # If it only has 'edit_text', we might need to adapt how we call it or parse its response.
            # For now, this is a conceptual call to a method that returns JSON.
            # response_json_str = await self.gemini_service.generate_text_for_prompt(prompt, output_format="json")
            # response_data = json.loads(response_json_str)

            # MOCK IMPLEMENTATION
            logger.warning(f"Using MOCK Gemini response for episode {episode_number} metadata generation.")
            mock_json_response_str = json.dumps({
                "title": f"الحلقة {episode_number}: ذروة التوتر (مُنشأ)",
                "logline": f"في الحلقة {episode_number}, تصل الأحداث إلى نقطة حرجة وتتكشف الأسرار (مُنشأ).",
                "cliffhanger_description": f"يُترك البطل في مواجهة قرار مصيري مع نهاية الحلقة {episode_number} (مُنشأ)."
            })
            response_data = json.loads(mock_json_response_str)

            return {
                "title": response_data.get("title", f"الحلقة {episode_number}"),
                "logline": response_data.get("logline", "وصف الحلقة."),
                "cliffhanger_description": response_data.get("cliffhanger_description", "")
            }
        except Exception as e:
            logger.error(f"Error generating metadata for episode {episode_number} with Gemini: {e}", exc_info=True)
            return {
                "title": f"الحلقة {episode_number}: خطأ في التوليد",
                "logline": "حدث خطأ أثناء توليد ملخص الحلقة.",
                "cliffhanger_description": "خطأ."
            }

    async def distribute_events_to_episodes(
        self,
        db: AsyncSession,
        project_id: str,
        num_episodes: int,
        target_episode_duration: int,
        series_title_suggestion: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Distributes project events across a specified number of episodes
        and generates metadata (title, logline, cliffhanger) for each.
        """
        logger.info(f"Distributing events for project {project_id} into {num_episodes} episodes.")

        all_events = await self._fetch_events_for_project(db, project_id)
        if not all_events:
            logger.warning(f"No events found for project {project_id}. Cannot plan series.")
            return {
                "series_title": series_title_suggestion or f"مسلسل لمشروع {project_id} (لا توجد أحداث)",
                "total_episodes": num_episodes,
                "episodes": [],
                "target_episode_duration_minutes": target_episode_duration
            }

        events_per_episode_ratio = len(all_events) / num_episodes if num_episodes > 0 else len(all_events)

        final_episodes_outline: List[Dict[str, Any]] = []
        series_context = series_title_suggestion or f"مسلسل لمشروع {project_id}"
        series_context_for_gemini = f"مسلسل بعنوان مبدئي '{series_context}' مكون من {num_episodes} حلقات."

        event_idx_start = 0
        for i in range(num_episodes):
            episode_number = i + 1
            # Determine slice for this episode's events
            event_idx_end = round(episode_number * events_per_episode_ratio)
            if i == num_episodes - 1: # Ensure last episode gets all remaining events
                event_idx_end = len(all_events)

            current_episode_events_models = all_events[event_idx_start:event_idx_end]
            event_idx_start = event_idx_end # For next iteration

            current_episode_event_descriptions = [
                event.description or (event.name if hasattr(event, 'name') else str(event)) # Fallback
                for event in current_episode_events_models if hasattr(event, 'description')
            ]

            if not current_episode_event_descriptions:
                logger.info(f"No descriptive events assigned to episode {episode_number}, creating placeholder metadata.")
                episode_metadata = {
                    "title": f"الحلقة {episode_number}: فاصل أو حلقة ربط",
                    "logline": "حلقة انتقالية أو بدون أحداث رئيسية محددة.",
                    "cliffhanger_description": ""
                }
            else:
                episode_metadata = await self._generate_episode_metadata_with_gemini(
                    current_episode_event_descriptions,
                    episode_number,
                    series_context_for_gemini
                )

            final_episodes_outline.append({
                "episode_number": episode_number,
                "title": episode_metadata["title"],
                "logline": episode_metadata["logline"],
                "key_events_json": json.dumps(current_episode_event_descriptions),
                "cliffhanger_description": episode_metadata["cliffhanger_description"],
            })
            logger.info(f"Planned metadata for Episode {episode_number}: {episode_metadata['title']}")

        final_series_title = series_title_suggestion or f"مخطط مسلسل لمشروع {project_id}"
        if not series_title_suggestion and final_episodes_outline:
            first_episode_title = final_episodes_outline[0].get("title", "")
            if first_episode_title and "الحلقة 1:" in first_episode_title:
                 final_series_title = first_episode_title.replace("الحلقة 1:", "").strip() + " (مسلسل)"

        return {
            "series_title": final_series_title,
            "total_episodes": num_episodes,
            "episodes": final_episodes_outline,
            "target_episode_duration_minutes": target_episode_duration
        }
