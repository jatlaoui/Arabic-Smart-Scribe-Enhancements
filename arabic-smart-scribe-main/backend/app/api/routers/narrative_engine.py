
from sqlalchemy.orm import Session
from models import Project, KnowledgeBase, Character, Event, Place, Claim, AnalysisResult
from database import get_db
import uuid
import json
from datetime import datetime

# خدمات قاعدة البيانات
class DatabaseService:
    @staticmethod
    def create_project(db: Session, title: str, content: str, user_id: str = "default") -> Project:
        """إنشاء مشروع جديد"""
        project = Project(
            id=str(uuid.uuid4()),
            title=title,
            description="مشروع رواية من الشهادة",
            content=content,
            user_id=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project
    
    @staticmethod
    def save_knowledge_base(db: Session, project_id: str, knowledge_data: dict) -> KnowledgeBase:
        """حفظ قاعدة المعرفة"""
        kb = KnowledgeBase(
            id=str(uuid.uuid4()),
            project_id=project_id,
            entities=json.dumps(knowledge_data.get('entities', []), ensure_ascii=False),
            events=json.dumps(knowledge_data.get('events', []), ensure_ascii=False),
            places=json.dumps(knowledge_data.get('places', []), ensure_ascii=False),
            claims=json.dumps(knowledge_data.get('claims', []), ensure_ascii=False),
            created_at=datetime.utcnow()
        )
        db.add(kb)
        
        # حفظ الشخصيات كجداول منفصلة
        for char_data in knowledge_data.get('characters', []):
            character = Character(
                id=str(uuid.uuid4()),
                project_id=project_id,
                name=char_data.get('name', ''),
                description=char_data.get('description', ''),
                role=char_data.get('role', 'secondary'),
                personality_traits=json.dumps(char_data.get('traits', []), ensure_ascii=False),
                backstory=char_data.get('backstory', ''),
                importance_score=char_data.get('importance_score', 0.5),
                created_at=datetime.utcnow()
            )
            db.add(character)
        
        # حفظ الأحداث
        for event_data in knowledge_data.get('events', []):
            event = Event(
                id=str(uuid.uuid4()),
                project_id=project_id,
                title=event_data.get('title', ''),
                description=event_data.get('description', ''),
                timeline_position=event_data.get('timeline_position', ''),
                importance_score=event_data.get('importance_score', 0.5),
                related_characters=json.dumps(event_data.get('related_characters', []), ensure_ascii=False),
                created_at=datetime.utcnow()
            )
            db.add(event)
        
        # حفظ الأماكن
        for place_data in knowledge_data.get('places', []):
            place = Place(
                id=str(uuid.uuid4()),
                project_id=project_id,
                name=place_data.get('name', ''),
                description=place_data.get('description', ''),
                significance=place_data.get('significance', ''),
                atmosphere=place_data.get('atmosphere', ''),
                created_at=datetime.utcnow()
            )
            db.add(place)
        
        db.commit()
        db.refresh(kb)
        return kb
    
    @staticmethod
    def get_project_with_knowledge(db: Session, project_id: str):
        """استرجاع المشروع مع قاعدة المعرفة"""
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return None
        
        kb = db.query(KnowledgeBase).filter(KnowledgeBase.project_id == project_id).first()
        characters = db.query(Character).filter(Character.project_id == project_id).all()
        events = db.query(Event).filter(Event.project_id == project_id).all()
        places = db.query(Place).filter(Place.project_id == project_id).all()
        
        return {
            'project': project,
            'knowledge_base': kb,
            'characters': [{'id': c.id, 'name': c.name, 'role': c.role, 'description': c.description} for c in characters],
            'events': [{'id': e.id, 'title': e.title, 'description': e.description} for e in events],
            'places': [{'id': p.id, 'name': p.name, 'description': p.description} for p in places]
        }

# تحديث نقاط API لاستخدام قاعدة البيانات
@app.post("/api/shahid/architectural-analysis")
async def architectural_analysis_endpoint(
    request: ArchitecturalAnalysisRequest,
    db: Session = Depends(get_db)
):
    """تحليل معماري مع حفظ في قاعدة البيانات"""
    try:
        # إنشاء مشروع جديد أو استخدام موجود
        if request.project_id:
            project = db.query(Project).filter(Project.id == request.project_id).first()
            if not project:
                raise HTTPException(status_code=404, detail="المشروع غير موجود")
        else:
            project = DatabaseService.create_project(
                db, 
                title=f"مشروع رواية {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                content=request.content
            )
        
        # بدء مهمة التحليل المعماري
        task = architectural_analysis_task.delay(request.content, project.id)
        
        return {
            "task_id": task.id,
            "project_id": project.id,
            "status": "بدء التحليل المعماري",
            "message": "تم بدء تحليل النص، سيتم إشعارك عند الانتهاء"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في التحليل: {str(e)}")

@app.post("/api/shahid/creative-generation")
async def creative_generation_endpoint(
    request: CreativeGenerationRequest,
    db: Session = Depends(get_db)
):
    """توليد إبداعي بناءً على قاعدة المعرفة المحفوظة"""
    try:
        # استرجاع بيانات المشروع
        project_data = DatabaseService.get_project_with_knowledge(db, request.project_id)
        if not project_data:
            raise HTTPException(status_code=404, detail="المشروع أو قاعدة المعرفة غير موجودة")
        
        # بدء مهمة التوليد الإبداعي
        task = creative_development_task.delay(request.project_id, project_data)
        
        return {
            "task_id": task.id,
            "project_id": request.project_id,
            "status": "بدء التوليد الإبداعي",
            "message": "جاري تطوير العناصر الإبداعية بناءً على التحليل"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في التوليد الإبداعي: {str(e)}")

@app.get("/api/projects/{project_id}")
async def get_project_endpoint(project_id: str, db: Session = Depends(get_db)):
    """استرجاع بيانات المشروع الكاملة"""
    project_data = DatabaseService.get_project_with_knowledge(db, project_id)
    if not project_data:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    
    return {
        "project": {
            "id": project_data['project'].id,
            "title": project_data['project'].title,
            "description": project_data['project'].description,
            "created_at": project_data['project'].created_at.isoformat()
        },
        "knowledge_base": {
            "characters": project_data['characters'],
            "events": project_data['events'],
            "places": project_data['places']
        }
    }


from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.advanced_context_engine import AdvancedContextEngine
from app.services.creative_layer_engine import CreativeLayerEngine
from app.services.narrative_constructor import NarrativeConstructor
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json

router = APIRouter()

class ArchitecturalAnalysisRequest(BaseModel):
    text: str
    external_sources: Optional[List[str]] = None

class CreativeGenerationRequest(BaseModel):
    knowledge_base_id: str

class SceneGenerationRequest(BaseModel):
    knowledge_base_id: str
    creative_layers: Dict[str, Any]
    scene_request: Dict[str, Any]

@router.post("/architectural-analysis")
async def architectural_analysis(
    request: ArchitecturalAnalysisRequest,
    db: Session = Depends(get_db)
):
    """المرحلة الأولى: التحليل المعماري وتأسيس المعرفة"""
    try:
        engine = AdvancedContextEngine()
        knowledge_base = await engine.analyze_text(
            request.text, 
            request.external_sources
        )
        
        # حفظ قاعدة المعرفة في قاعدة البيانات
        # (تنفيذ حفظ البيانات حسب نموذج قاعدة البيانات)
        
        return {
            "success": True,
            "knowledge_base": knowledge_base.dict(),
            "message": "تم إكمال التحليل المعماري بنجاح"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في التحليل المعماري: {str(e)}")

@router.post("/creative-generation")
async def creative_generation(
    request: CreativeGenerationRequest,
    db: Session = Depends(get_db)
):
    """المرحلة الثانية: التوليد الإبداعي للطبقات السردية"""
    try:
        # استرجاع قاعدة المعرفة
        # knowledge_base = get_knowledge_base_from_db(request.knowledge_base_id)
        
        creative_engine = CreativeLayerEngine()
        
        # توليد الطبقات الإبداعية
        sensory_details = await creative_engine.generate_sensory_details([], {})
        metaphors = await creative_engine.generate_metaphors([], [], {})
        internal_monologues = await creative_engine.generate_internal_monologues([], [])
        
        creative_layers = {
            "sensory_details": sensory_details,
            "metaphors": [m.dict() for m in metaphors],
            "internal_monologues": internal_monologues
        }
        
        # حفظ الطبقات الإبداعية
        
        return {
            "success": True,
            "creative_layers": creative_layers,
            "message": "تم توليد الطبقات الإبداعية بنجاح"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في التوليد الإبداعي: {str(e)}")

@router.post("/generate-scene")
async def generate_scene(
    request: SceneGenerationRequest,
    db: Session = Depends(get_db)
):
    """المرحلة الثالثة: البناء السردي الآلي"""
    try:
        # استرجاع البيانات
        # knowledge_base = get_knowledge_base_from_db(request.knowledge_base_id)
        
        constructor = NarrativeConstructor(None, request.creative_layers)
        
        # تحويل طلب المشهد إلى كائن SceneRequest
        from app.services.narrative_constructor import SceneRequest
        scene_request = SceneRequest(**request.scene_request)
        
        # توليد المشهد
        generated_scene = await constructor.construct_scene(scene_request)
        
        return {
            "success": True,
            "scene": generated_scene.dict(),
            "message": "تم توليد المشهد بنجاح"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في توليد المشهد: {str(e)}")

@router.get("/knowledge-bases")
async def list_knowledge_bases(db: Session = Depends(get_db)):
    """قائمة قواعد المعرفة المحفوظة"""
    try:
        # استرجاع قائمة قواعد المعرفة من قاعدة البيانات
        return {
            "success": True,
            "knowledge_bases": [],
            "message": "تم استرجاع قواعد المعرفة"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في استرجاع البيانات: {str(e)}")
