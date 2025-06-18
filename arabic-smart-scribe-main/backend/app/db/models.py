
from sqlalchemy import Column, String, DateTime, Float, Text, Integer, JSON, ForeignKey, ForeignKeyConstraint, Boolean
from sqlalchemy.sql import func
from .base import Base
from typing import Optional, Dict, Any, List # Added List for Mapped typing
import uuid # For default ID generation in AgentMessageModel
from datetime import datetime # Ensure datetime is available for default values


class TextSession(Base):
    __tablename__ = "text_sessions"

    id = Column(String, primary_key=True, index=True)
    text_content = Column(Text)
    analysis_data = Column(Text)
    timestamp = Column(DateTime, default=func.now())
    user_id = Column(String, index=True)

class EditingSession(Base):
    __tablename__ = "editing_sessions"

    id = Column(String, primary_key=True, index=True)
    original_text = Column(Text, nullable=False)
    edited_text = Column(Text, nullable=False)
    edit_type = Column(String, index=True)
    confidence_score = Column(Float)
    timestamp = Column(DateTime, default=func.now())
    user_id = Column(String, index=True)

class UserBehavior(Base):
    __tablename__ = "user_behavior"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    action_type = Column(String)
    action_data = Column(Text)
    timestamp = Column(DateTime, default=func.now())

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    achievement_type = Column(String)
    title = Column(String)
    description = Column(Text)
    icon = Column(String)
    rarity = Column(String)
    date_earned = Column(DateTime, default=func.now())


# نماذج المحرك الروائي
class Project(Base):
    """مشروع كتابة إبداعية"""
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True) # Assuming content can also be optional like in schema
    user_id = Column(String, index=True, nullable=True) # Made nullable
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    # Restoring Project specific fields that were previously mixed up
    stage = Column(String, default="initial", nullable=True)
    metadata = Column(JSON, nullable=True, default=lambda: {})
    status = Column(String, default="draft", nullable=False)
    tags = Column(JSON, nullable=True, default=lambda: [])
    # word_count is a calculated field, will not be a DB column.
    
class KnowledgeBase(Base):
    """قاعدة المعرفة للمشروع"""
    __tablename__ = "knowledge_bases"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    entities = Column(Text)  # JSON للكيانات
    events = Column(Text)  # JSON للأحداث
    places = Column(Text)  # JSON للأماكن
    claims = Column(Text)  # JSON للادعاءات
    themes = Column(JSON, nullable=True, default=lambda: []) # Added themes
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now()) # Added updated_at for consistency

class Character(Base):
    """شخصيات القصة"""
    __tablename__ = "characters"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    role = Column(String)  # main, secondary, minor
    personality_traits = Column(Text)  # JSON
    backstory = Column(Text)
    importance_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())

class Event(Base):
    """أحداث القصة"""
    __tablename__ = "events"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    timeline_position = Column(String)
    importance_score = Column(Float, default=0.0)
    related_characters = Column(Text)  # JSON - معرفات الشخصيات المرتبطة
    created_at = Column(DateTime, default=func.now())

class Place(Base):
    """أماكن القصة"""
    __tablename__ = "places"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    significance = Column(Text)
    atmosphere = Column(String)
    created_at = Column(DateTime, default=func.now())

class Claim(Base):
    """ادعاءات ومعلومات مهمة"""
    __tablename__ = "claims"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    statement = Column(Text, nullable=False)
    evidence = Column(Text)
    reliability_score = Column(Float, default=0.0)
    source = Column(String)
    created_at = Column(DateTime, default=func.now())

class AnalysisResult(Base):
    """نتائج التحليل المعماري"""
    __tablename__ = "analysis_results"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    analysis_type = Column(String)  # architectural, development, refinement
    results = Column(Text)  # JSON لنتائج التحليل
    stage = Column(Integer, default=1)  # 1, 2, 3
    created_at = Column(DateTime, default=func.now())


# نماذج ناسج السرد متعدد الوسائط
class Source(Base):
    """مصادر متعددة الوسائط للمشروع"""
    __tablename__ = "sources"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # المسار في التخزين
    source_type = Column(String, nullable=False)  # 'video', 'audio', 'pdf', 'image', 'text'
    file_size = Column(Integer)  # بالبايت
    mime_type = Column(String)
    status = Column(String, default='uploaded')  # 'uploaded', 'processing', 'analyzed', 'error'
    analysis_results = Column(Text)  # JSON لنتائج التحليل
    metadata = Column(Text)  # JSON للمعلومات الإضافية
    created_at = Column(DateTime, default=func.now())
    analyzed_at = Column(DateTime)
    
class UnifiedKnowledgeBase(Base):
    """قاعدة المعرفة الموحدة من جميع المصادر"""
    __tablename__ = "unified_knowledge_bases"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    correlation_results = Column(Text)  # JSON لنتائج الربط بين المصادر
    confidence_scores = Column(Text)  # JSON لدرجات الثقة في الربط
    timeline_data = Column(Text)  # JSON للخط الزمني الموحد
    character_mapping = Column(Text)  # JSON لربط الشخصيات عبر المصادر
    location_mapping = Column(Text)  # JSON لربط الأماكن عبر المصادر
    cross_references = Column(Text)  # JSON للمراجع المتقاطعة
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now()) # Added updated_at for consistency

# User Profile and Analytics Models
class UserProfileModel(Base):
    __tablename__ = "user_profiles"

    user_id = Column(String, primary_key=True, index=True)
    profile_name = Column(String, nullable=True)
    style_preferences_json = Column(JSON, nullable=True, default=lambda: {})
    writing_habits_json = Column(JSON, nullable=True, default=lambda: {})
    jattlaoui_adaptation_level = Column(Float, nullable=True, default=0.5)
    preferred_vocabulary_complexity = Column(Float, nullable=True, default=0.5)
    preferred_sentence_length = Column(Float, nullable=True, default=0.5)
    preferred_cultural_depth = Column(Float, nullable=True, default=0.5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContentRatingModel(Base):
    __tablename__ = "content_ratings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("user_profiles.user_id"), index=True, nullable=False)
    content_type = Column(String, nullable=True)
    content_preview = Column(Text, nullable=True)
    rating = Column(Integer, nullable=False)
    specific_feedback_json = Column(JSON, nullable=True, default=lambda: {})
    project_id = Column(String, ForeignKey("projects.id"), index=True, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['user_profiles.user_id'], name='fk_rating_user'),
        ForeignKeyConstraint(['project_id'], ['projects.id'], name='fk_rating_project'),
    )

class WritingSessionModel(Base):
    __tablename__ = "writing_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("user_profiles.user_id"), index=True, nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), index=True, nullable=True)
    session_start_time = Column(DateTime, default=datetime.utcnow)
    session_end_time = Column(DateTime, nullable=True)
    words_written = Column(Integer, default=0)
    edits_made = Column(Integer, default=0) # Number of edits/actions during the session
    quality_score_snapshot = Column(Float, nullable=True) # Overall quality score at end of session
    stage_number_snapshot = Column(Integer, nullable=True) # Project stage at end of session
    active_duration_seconds = Column(Integer, default=0) # Calculated active time

    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['user_profiles.user_id'], name='fk_writingsession_user'),
        ForeignKeyConstraint(['project_id'], ['projects.id'], name='fk_writingsession_project'),
    )

class StyleAnalysisSnapshotModel(Base):
    __tablename__ = "style_analysis_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("user_profiles.user_id"), index=True, nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), index=True, nullable=True)
    session_id = Column(String, ForeignKey("writing_sessions.id"), index=True, nullable=True) # Link to a specific writing session
    analysis_date = Column(DateTime, default=datetime.utcnow)
    text_snapshot_preview = Column(Text, nullable=True) # Preview of the text analyzed

    metaphor_density = Column(Float, nullable=True)
    vocabulary_complexity = Column(Float, nullable=True)
    formality_score = Column(Float, nullable=True)
    creativity_score = Column(Float, nullable=True)
    coherence_score = Column(Float, nullable=True)
    avg_sentence_length = Column(Float, nullable=True)
    cultural_references_count = Column(Integer, nullable=True)

    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['user_profiles.user_id'], name='fk_styleanalysis_user'),
        ForeignKeyConstraint(['project_id'], ['projects.id'], name='fk_styleanalysis_project'),
        ForeignKeyConstraint(['session_id'], ['writing_sessions.id'], name='fk_styleanalysis_session'),
    )

# Agent Studio Models
class AgentCollaborationSessionModel(Base):
    __tablename__ = "agent_collaboration_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    purpose = Column(Text, nullable=True)
    agent_ids = Column(JSON, nullable=False) # Stores list of agent IDs
    status = Column(String, default="active", nullable=False) # e.g., active, brainstorming, completed, archived
    current_activity = Column(String, nullable=True)
    activity_data = Column(JSON, nullable=True) # For storing data related to current_activity, e.g., brainstorm topic
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WorkflowDefinitionModel(Base):
    __tablename__ = "workflow_definitions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    workflow_json = Column(JSON, nullable=False) # To store nodes, edges, positions, etc.
    user_identifier = Column(String, index=True, nullable=True)
    is_template = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    tags_json = Column(JSON, nullable=True) # Storing List[str] as JSON
    complexity_level = Column(String, nullable=True)
    estimated_duration_minutes = Column(Integer, nullable=True)
    usage_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AudiobookGeneration(Base):
    """توليد الكتب الصوتية"""
    __tablename__ = "audiobook_generations"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    voice_mapping = Column(Text)  # JSON لربط الأصوات بالشخصيات
    generation_status = Column(String, default='pending')  # 'pending', 'generating', 'completed', 'error'
    audio_file_path = Column(String)  # مسار الملف الصوتي النهائي
    duration_seconds = Column(Integer)  # مدة الكتاب الصوتي
    chapters_data = Column(Text)  # JSON لبيانات الفصول
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)

class MovieTreatment(Base):
    """الموجز السينمائي"""
    __tablename__ = "movie_treatments"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    treatment_content = Column(Text)  # محتوى الموجز السينمائي
    genre = Column(String)  # النوع السينمائي
    logline = Column(Text)  # الملخص في جملة واحدة
    main_characters = Column(Text)  # JSON للشخصيات الرئيسية
    key_scenes = Column(Text)  # JSON للمشاهد الرئيسية
    three_act_structure = Column(Text)  # JSON لهيكل الثلاث فصول
    created_at = Column(DateTime, default=func.now())

class InteractiveMap(Base):
    """الخريطة التفاعلية"""
    __tablename__ = "interactive_maps"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    geojson_data = Column(Text)  # بيانات GeoJSON للخريطة
    location_details = Column(Text)  # JSON لتفاصيل الأماكن
    event_markers = Column(Text)  # JSON لعلامات الأحداث
    narrative_snippets = Column(Text)  # JSON لمقتطفات السرد لكل مكان
    map_center_lat = Column(Float)  # مركز الخريطة - خط العرض
    map_center_lng = Column(Float)  # مركز الخريطة - خط الطول
    zoom_level = Column(Integer, default=10)  # مستوى التكبير الافتراضي
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# تحديث علاقة Project
# يجب إضافة هذا إلى نموذج Project الموجود
class ProjectUpdated(Base):
    """تحديث نموذج المشروع لدعم المصادر المتعددة"""
    __tablename__ = "projects_updated"
    
    # كل الحقول الأصلية + الجديدة
    multimedia_status = Column(String, default='single_source')  # 'single_source', 'multi_source', 'analyzed'
    sources_count = Column(Integer, default=0)  # عدد المصادر المرفوعة
    analysis_progress = Column(Float, default=0.0)  # تقدم التحليل (0-100)
    last_analysis_date = Column(DateTime)  # تاريخ آخر تحليل
    
    # العلاقات
    # sources = relationship("Source", backref="project")
    # unified_kb = relationship("UnifiedKnowledgeBase", backref="project", uselist=False)
    # audiobooks = relationship("AudiobookGeneration", backref="project")
    # treatments = relationship("MovieTreatment", backref="project")
    # maps = relationship("InteractiveMap", backref="project")


# Agent Studio Models
class AgentModel(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, index=True) # Using String for UUIDs
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    config = Column(JSON, nullable=True, default=lambda: {})
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class AgentMessageModel(Base):
    __tablename__ = "agent_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    from_agent_id = Column(String, ForeignKey("agents.id"), index=True, nullable=False)
    to_agent_id = Column(String, ForeignKey("agents.id"), index=True, nullable=False)
    session_id = Column(String, index=True, nullable=True)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow) # Changed to datetime.utcnow for consistency
    metadata = Column(JSON, nullable=True, default=lambda: {})

    # Optional: Define relationships to AgentModel if needed for ORM queries
    # from_agent = relationship("AgentModel", foreign_keys=[from_agent_id])
    # to_agent = relationship("AgentModel", foreign_keys=[to_agent_id])

    __table_args__ = (
        ForeignKeyConstraint(['from_agent_id'], ['agents.id'], name='fk_message_from_agent'),
        ForeignKeyConstraint(['to_agent_id'], ['agents.id'], name='fk_message_to_agent'),
    )

class ToolModel(Base):
    __tablename__ = "tools"

    id = Column(String, primary_key=True, index=True) # Using String for UUIDs
    name = Column(String, index=True, nullable=False)
    category = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    function_name = Column(String, nullable=False, unique=True) # Assuming function_name should be unique
    config = Column(JSON, nullable=True, default=lambda: {})
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
