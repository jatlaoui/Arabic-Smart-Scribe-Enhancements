
from sqlalchemy import Column, String, DateTime, Float, Text, Integer
from sqlalchemy.sql import func
from .base import Base

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
    description = Column(Text)
    content = Column(Text)
    user_id = Column(String, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
class KnowledgeBase(Base):
    """قاعدة المعرفة للمشروع"""
    __tablename__ = "knowledge_bases"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    entities = Column(Text)  # JSON للكيانات
    events = Column(Text)  # JSON للأحداث
    places = Column(Text)  # JSON للأماكن
    claims = Column(Text)  # JSON للادعاءات
    created_at = Column(DateTime, default=func.now())

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
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

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
