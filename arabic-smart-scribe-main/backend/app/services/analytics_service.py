from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import logging

from ..db.models import (
    WritingSessionModel,
    StyleAnalysisSnapshotModel,
    UserProfileModel, # To ensure user exists
    ProjectModel, # For stats
    WorkflowDefinitionModel # For stats
)
from ..schemas.analytics import (
    WritingSessionCreate,
    WritingSessionEnd,
    StyleAnalysisSnapshotCreate,
    ProgressAnalyticsResponse,
    PersonalReportResponse,
    PersonalReportSection,
    StyleEvolutionDataPoint,
    StyleEvolutionResponse,
    DashboardStatsResponse,
    ProductivityStat,
    DailyProgress,
    WritingSession as WritingSessionSchema # For response
)
from ..schemas.user import UserProfileCreate # To create user profile if not exists
from .user_service import get_or_create_user_profile # Re-use user_service logic
from .gemini_service import GeminiService # For LLM-based style analysis
# from .text_analysis_service import TextAnalysisService # If basic metrics are needed

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self, db: Session, gemini_service: Optional[GeminiService] = None):
        self.db = db
        self.gemini_service = gemini_service if gemini_service else GeminiService() # Default instance

    def start_writing_session(self, user_id: str, session_data: WritingSessionCreate) -> WritingSessionModel:
        # Ensure user profile exists
        get_or_create_user_profile(self.db, user_id=user_id, profile_in=UserProfileCreate(user_id=user_id))

        db_session = WritingSessionModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            project_id=session_data.project_id,
            session_start_time=datetime.utcnow(),
            stage_number_snapshot=session_data.stage_number_snapshot
        )
        self.db.add(db_session)
        self.db.commit()
        self.db.refresh(db_session)
        logger.info(f"Started writing session {db_session.id} for user {user_id}")
        return db_session

    def end_writing_session(self, session_id: str, session_end_data: WritingSessionEnd) -> Optional[WritingSessionModel]:
        db_session = self.db.query(WritingSessionModel).filter(WritingSessionModel.id == session_id).first()
        if db_session:
            db_session.session_end_time = datetime.utcnow()
            db_session.words_written = session_end_data.words_written
            db_session.edits_made = session_end_data.edits_made
            db_session.quality_score_snapshot = session_end_data.quality_score_snapshot
            db_session.active_duration_seconds = session_end_data.active_duration_seconds

            if db_session.session_start_time and db_session.active_duration_seconds == 0: # if not provided
                 calculated_duration = (db_session.session_end_time - db_session.session_start_time).total_seconds()
                 db_session.active_duration_seconds = int(calculated_duration)

            self.db.commit()
            self.db.refresh(db_session)
            logger.info(f"Ended writing session {session_id}.")
        return db_session

    async def record_text_style_analysis(self, user_id: str, data: StyleAnalysisSnapshotCreate) -> StyleAnalysisSnapshotModel:
        get_or_create_user_profile(self.db, user_id=user_id, profile_in=UserProfileCreate(user_id=user_id))

        # Placeholder for LLM-based style metrics extraction
        # This would involve constructing a detailed prompt for GeminiService
        prompt = f"""
        Analyze the following text for detailed stylistic features. Extract metrics for:
        - Metaphor Density (0.0 to 1.0)
        - Vocabulary Complexity (0.0 to 1.0, e.g., based on word rarity or length)
        - Formality Score (0.0 informal to 1.0 very formal)
        - Creativity Score (0.0 to 1.0, how unique or imaginative the writing is)
        - Coherence Score (0.0 to 1.0, how well the text flows and ideas connect)
        - Average Sentence Length (float)
        - Cultural References Count (integer, count of specific cultural references if any)

        Text to analyze:
        ---
        {data.text_to_analyze}
        ---

        Return the response as a JSON object with keys: "metaphor_density", "vocabulary_complexity",
        "formality_score", "creativity_score", "coherence_score", "avg_sentence_length", "cultural_references_count".
        If a metric cannot be determined, use null or 0.
        """

        style_metrics = {
            "metaphor_density": 0.0, "vocabulary_complexity": 0.0, "formality_score": 0.0,
            "creativity_score": 0.0, "coherence_score": 0.0, "avg_sentence_length": 0.0,
            "cultural_references_count": 0
        } # Default/fallback values

        try:
            response_str = await self.gemini_service.generate_content(prompt)
            # Clean response
            if response_str.strip().startswith("```json"):
                response_str = response_str.strip()[7:-3].strip()
            elif response_str.strip().startswith("```"):
                response_str = response_str.strip()[3:-3].strip()

            llm_data = json.loads(response_str)
            style_metrics.update(llm_data) # Update defaults with any values LLM provides
        except Exception as e:
            logger.error(f"Error getting style metrics from LLM for user {user_id}: {e}. Response: {response_str[:200]}")
            # Proceed with default/zeroed metrics on LLM failure for this snapshot

        db_snapshot = StyleAnalysisSnapshotModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            project_id=data.project_id,
            session_id=data.session_id,
            analysis_date=datetime.utcnow(),
            text_snapshot_preview=data.text_to_analyze[:255], # Store a preview
            metaphor_density=style_metrics.get("metaphor_density"),
            vocabulary_complexity=style_metrics.get("vocabulary_complexity"),
            formality_score=style_metrics.get("formality_score"),
            creativity_score=style_metrics.get("creativity_score"),
            coherence_score=style_metrics.get("coherence_score"),
            avg_sentence_length=style_metrics.get("avg_sentence_length"),
            cultural_references_count=style_metrics.get("cultural_references_count")
        )
        self.db.add(db_snapshot)
        self.db.commit()
        self.db.refresh(db_snapshot)
        logger.info(f"Recorded style analysis snapshot {db_snapshot.id} for user {user_id}")
        return db_snapshot

    def get_writing_sessions(self, user_id: str, project_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[WritingSessionModel]:
        query = self.db.query(WritingSessionModel).filter(WritingSessionModel.user_id == user_id)
        if project_id:
            query = query.filter(WritingSessionModel.project_id == project_id)
        return query.order_by(WritingSessionModel.session_start_time.desc()).offset(skip).limit(limit).all()

    def get_style_evolution(self, user_id: str, project_id: Optional[str] = None, limit: int = 30) -> StyleEvolutionResponse:
        query = self.db.query(StyleAnalysisSnapshotModel).filter(StyleAnalysisSnapshotModel.user_id == user_id)
        if project_id:
            query = query.filter(StyleAnalysisSnapshotModel.project_id == project_id)

        snapshots = query.order_by(StyleAnalysisSnapshotModel.analysis_date.asc()).limit(limit).all()

        evolution_data = [
            StyleEvolutionDataPoint(
                date=s.analysis_date,
                metaphor_density=s.metaphor_density,
                vocabulary_complexity=s.vocabulary_complexity,
                formality_score=s.formality_score,
                creativity_score=s.creativity_score,
                coherence_score=s.coherence_score,
                avg_sentence_length=s.avg_sentence_length
            ) for s in snapshots
        ]
        return StyleEvolutionResponse(user_id=user_id, project_id=project_id, evolution_data=evolution_data)

    def get_writing_progress_analytics(self, user_id: str, project_id: Optional[str] = None, days_history: int = 30) -> ProgressAnalyticsResponse:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days_history)

        sessions_query = self.db.query(WritingSessionModel).filter(
            WritingSessionModel.user_id == user_id,
            WritingSessionModel.session_start_time >= start_date
        )
        if project_id:
            sessions_query = sessions_query.filter(WritingSessionModel.project_id == project_id)

        sessions = sessions_query.all()

        total_words = sum(s.words_written or 0 for s in sessions)
        total_sessions = len(sessions)
        total_active_time_minutes = sum(s.active_duration_seconds or 0 for s in sessions) / 60.0
        avg_words_per_session = total_words / total_sessions if total_sessions > 0 else 0

        # Daily progress
        daily_progress_data: List[DailyProgress] = []
        # For a more performant daily aggregation, a GROUP BY query would be better
        # This is a simplified Python-side aggregation for now
        sessions_by_date: Dict[datetime.date, Dict[str, Any]] = {}
        for s in sessions:
            day = s.session_start_time.date()
            if day not in sessions_by_date:
                sessions_by_date[day] = {"words": 0, "sessions_count": 0, "active_time": 0}
            sessions_by_date[day]["words"] += s.words_written or 0
            sessions_by_date[day]["sessions_count"] += 1
            sessions_by_date[day]["active_time"] += s.active_duration_seconds or 0

        for day, data in sorted(sessions_by_date.items()):
            daily_progress_data.append(DailyProgress(
                date=datetime.combine(day, datetime.min.time()), # Keep it datetime for schema
                words_written=data["words"],
                sessions_count=data["sessions_count"],
                active_time_minutes=data["active_time"] / 60.0
            ))

        return ProgressAnalyticsResponse(
            user_id=user_id,
            project_id=project_id,
            total_words_written=total_words,
            total_sessions=total_sessions,
            total_active_time_minutes=round(total_active_time_minutes, 2),
            average_words_per_session=round(avg_words_per_session, 2),
            daily_progress=daily_progress_data
        )

    def generate_personalized_report(self, user_id: str, project_id: Optional[str] = None) -> PersonalReportResponse:
        # Simplified version: Could be expanded with LLM summaries of progress, style, etc.
        progress = self.get_writing_progress_analytics(user_id, project_id, days_history=30)
        style_evo = self.get_style_evolution(user_id, project_id, limit=5) # Get last 5 style snapshots

        summary_parts = [f"تقرير أداء الكتابة للمستخدم {user_id}"]
        if project_id:
            summary_parts.append(f"للمشروع {project_id}")
        summary_parts.append(f"خلال آخر 30 يومًا:")
        summary_parts.append(f"- إجمالي الكلمات المكتوبة: {progress.total_words_written}")
        summary_parts.append(f"- إجمالي الجلسات: {progress.total_sessions}")
        summary_parts.append(f"- متوسط الكلمات لكل جلسة: {progress.average_words_per_session:.2f}")

        sections = [
            PersonalReportSection(title="ملخص الإنتاجية", content="\n".join(summary_parts))
        ]

        if style_evo.evolution_data:
            style_summary = "تطور الأسلوب (آخر 5 تحليلات):\n"
            for dp in style_evo.evolution_data:
                style_summary += f"- {dp.date.strftime('%Y-%m-%d')}: تعقيد المفردات: {dp.vocabulary_complexity or 'N/A'}, الترابط: {dp.coherence_score or 'N/A'}\n"
            sections.append(PersonalReportSection(title="تطور الأسلوب", content=style_summary))

        return PersonalReportResponse(
            user_id=user_id,
            project_id=project_id,
            report_date=datetime.utcnow(),
            summary="هذا تقرير موجز عن نشاطك الكتابي وتطور أسلوبك.",
            sections=sections
        )

    def get_dashboard_stats(self, user_id: str, days_history: int = 7) -> DashboardStatsResponse:
        # This is a simplified version. More complex trend analysis would be needed for some fields.
        progress_curr_period = self.get_writing_progress_analytics(user_id, None, days_history=days_history)
        progress_prev_period = self.get_writing_progress_analytics(user_id, None, days_history=days_history*2)
        # For prev period, filter out current period data to get a distinct previous period

        # Simplified prev_words for example
        prev_words_written = 0
        prev_start_date = datetime.utcnow() - timedelta(days=days_history*2)
        prev_end_date = datetime.utcnow() - timedelta(days=days_history)
        prev_sessions = self.db.query(WritingSessionModel).filter(
            WritingSessionModel.user_id == user_id,
            WritingSessionModel.session_start_time >= prev_start_date,
            WritingSessionModel.session_start_time < prev_end_date # Use < for end of period
        ).all()
        prev_words_written = sum(s.words_written or 0 for s in prev_sessions)


        productivity_metrics = []
        words_change = None
        if prev_words_written > 0:
            words_change = ((progress_curr_period.total_words_written - prev_words_written) / prev_words_written) * 100

        productivity_metrics.append(ProductivityStat(
            metric_name=f"الكلمات المكتوبة (آخر {days_history} أيام)",
            current_value=progress_curr_period.total_words_written,
            previous_value=prev_words_written,
            change_percentage=round(words_change,1) if words_change is not None else None
        ))

        # Most productive day of week (simplified)
        # A real version would group by day of week over a longer period.
        most_productive_day = None
        if progress_curr_period.daily_progress:
            best_day_data = max(progress_curr_period.daily_progress, key=lambda dp: dp.words_written, default=None)
            if best_day_data:
                days = ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]
                most_productive_day = days[best_day_data.date.weekday()]


        return DashboardStatsResponse(
            user_id=user_id,
            average_session_duration_minutes= (progress_curr_period.total_active_time_minutes / progress_curr_period.total_sessions) if progress_curr_period.total_sessions > 0 else 0,
            words_per_day_average= progress_curr_period.total_words_written / days_history if days_history > 0 else 0,
            most_productive_day_of_week=most_productive_day,
            productivity_metrics=productivity_metrics
        )

```python
# Helper for AnalyticsService, if needed for complex JSON default factories,
# but lambda: {} or lambda: [] is usually sufficient.
# def json_default_factory():
#     return {}
```
