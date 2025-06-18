
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .api.routers import editing, projects, shahid, tasks
from .video_processing.router import router as video_processing_router
from .core.config import settings
from .core.exceptions import (
from app.api.routers import screenplay
from app.api.routers import web_novel
    VideoProcessingError, GeminiAPIError, AuthenticationError, ValidationError,
    video_processing_exception_handler, gemini_api_exception_handler,
    authentication_exception_handler, validation_exception_handler
)

app = FastAPI(
    title="Smart Writing Platform API",
    description="API for intelligent Arabic text editing and writing assistance",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom exception handlers
app.add_exception_handler(VideoProcessingError, video_processing_exception_handler)
app.add_exception_handler(GeminiAPIError, gemini_api_exception_handler)
app.add_exception_handler(AuthenticationError, authentication_exception_handler)
app.add_exception_handler(ValidationError, validation_exception_handler)

# Include routers
app.include_router(editing.router)
app.include_router(projects.router)
app.include_router(shahid.router)
app.include_router(video_processing_router)
app.include_router(tasks.router)
app.include_router(screenplay.router, prefix="/api/screenplay", tags=["Screenplay Generation"])

@app.get("/")
async def root():
    return {"message": "Smart Writing Platform API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



# نقاط API لناسج السرد متعدد الوسائط
from fastapi import UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from multimedia_service import MultimediaAnalysisService, MultimediaOutputService
import shutil
from pathlib import Path

# خدمات متعددة الوسائط
multimedia_service = MultimediaAnalysisService()
output_service = MultimediaOutputService()

@app.post("/api/projects/{project_id}/sources")
async def upload_multimedia_source(
    project_id: str,
    file: UploadFile = File(...),
    source_type: str = Form(...),
    db: Session = Depends(get_db)
):
    """رفع مصدر متعدد الوسائط جديد"""
    try:
        # التحقق من وجود المشروع
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="المشروع غير موجود")
        
        # إنشاء مجلد للمشروع
        project_storage = Path(f"data/multimedia/{project_id}")
        project_storage.mkdir(parents=True, exist_ok=True)
        
        # حفظ الملف
        source_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        file_path = project_storage / f"{source_id}{file_extension}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # إنشاء سجل المصدر
        source = Source(
            id=source_id,
            project_id=project_id,
            file_name=file.filename,
            file_path=str(file_path),
            source_type=source_type,
            file_size=file_path.stat().st_size,
            mime_type=file.content_type,
            status='uploaded'
        )
        
        db.add(source)
        db.commit()
        db.refresh(source)
        
        return {
            "source_id": source_id,
            "file_name": file.filename,
            "source_type": source_type,
            "status": "uploaded",
            "message": "تم رفع الملف بنجاح"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في رفع الملف: {str(e)}")

@app.get("/api/projects/{project_id}/sources")
async def get_project_sources(project_id: str, db: Session = Depends(get_db)):
    """الحصول على جميع مصادر المشروع"""
    sources = db.query(Source).filter(Source.project_id == project_id).all()
    
    return {
        "project_id": project_id,
        "sources_count": len(sources),
        "sources": [
            {
                "id": source.id,
                "file_name": source.file_name,
                "source_type": source.source_type,
                "file_size": source.file_size,
                "status": source.status,
                "created_at": source.created_at.isoformat()
            }
            for source in sources
        ]
    }

@app.post("/api/projects/{project_id}/analyze-sources")
async def analyze_multimedia_sources(
    project_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """بدء تحليل جميع مصادر المشروع"""
    try:
        # التحقق من وجود مصادر
        sources = db.query(Source).filter(Source.project_id == project_id).all()
        if not sources:
            raise HTTPException(status_code=404, detail="لا توجد مصادر للتحليل")
        
        # بدء مهمة التحليل المتقاطع
        task = process_multimedia_project_task.delay(project_id)
        
        return {
            "task_id": task.id,
            "project_id": project_id,
            "sources_count": len(sources),
            "status": "بدء تحليل المصادر المتعددة",
            "message": f"جاري تحليل {len(sources)} مصدر..."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في بدء التحليل: {str(e)}")

@app.post("/api/projects/{project_id}/generate-audiobook")
async def generate_audiobook_endpoint(
    project_id: str,
    voice_mapping: Dict[str, str],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """توليد كتاب صوتي من المشروع"""
    try:
        task = generate_audiobook_task.delay(project_id, voice_mapping)
        
        return {
            "task_id": task.id,
            "project_id": project_id,
            "status": "بدء توليد الكتاب الصوتي",
            "estimated_duration": "15-30 دقيقة"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في توليد الكتاب الصوتي: {str(e)}")

@app.post("/api/projects/{project_id}/generate-movie-treatment")
async def generate_movie_treatment_endpoint(
    project_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """توليد موجز سينمائي للمشروع"""
    try:
        task = generate_movie_treatment_task.delay(project_id)
        
        return {
            "task_id": task.id,
            "project_id": project_id,
            "status": "بدء توليد الموجز السينمائي"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في توليد الموجز السينمائي: {str(e)}")

@app.get("/api/projects/{project_id}/interactive-map")
async def get_interactive_map(project_id: str, db: Session = Depends(get_db)):
    """الحصول على بيانات الخريطة التفاعلية"""
    try:
        # البحث عن خريطة موجودة
        existing_map = db.query(InteractiveMap).filter(
            InteractiveMap.project_id == project_id
        ).first()
        
        if existing_map:
            return {
                "map_id": existing_map.id,
                "geojson": json.loads(existing_map.geojson_data),
                "center": {
                    "lat": existing_map.map_center_lat,
                    "lng": existing_map.map_center_lng
                },
                "zoom_level": existing_map.zoom_level
            }
        
        # إنشاء خريطة جديدة
        task = generate_interactive_map_task.delay(project_id)
        
        return {
            "task_id": task.id,
            "status": "generating",
            "message": "جاري إنشاء الخريطة التفاعلية..."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في الخريطة التفاعلية: {str(e)}")

@app.get("/api/projects/{project_id}/multimedia-dashboard")
async def get_multimedia_dashboard(project_id: str, db: Session = Depends(get_db)):
    """لوحة تحكم شاملة للمشروع متعدد الوسائط"""
    try:
        # جمع جميع البيانات
        project = db.query(Project).filter(Project.id == project_id).first()
        sources = db.query(Source).filter(Source.project_id == project_id).all()
        unified_kb = db.query(UnifiedKnowledgeBase).filter(
            UnifiedKnowledgeBase.project_id == project_id
        ).first()
        audiobooks = db.query(AudiobookGeneration).filter(
            AudiobookGeneration.project_id == project_id
        ).all()
        treatments = db.query(MovieTreatment).filter(
            MovieTreatment.project_id == project_id
        ).all()
        maps = db.query(InteractiveMap).filter(
            InteractiveMap.project_id == project_id
        ).all()
        
        return {
            "project": {
                "id": project.id if project else None,
                "title": project.title if project else "مشروع غير محدد",
                "created_at": project.created_at.isoformat() if project else None
            },
            "sources": {
                "total": len(sources),
                "by_type": {
                    "video": len([s for s in sources if s.source_type == 'video']),
                    "audio": len([s for s in sources if s.source_type == 'audio']),
                    "pdf": len([s for s in sources if s.source_type == 'pdf']),
                    "image": len([s for s in sources if s.source_type == 'image']),
                    "text": len([s for s in sources if s.source_type == 'text'])
                },
                "analysis_status": {
                    "analyzed": len([s for s in sources if s.status == 'analyzed']),
                    "processing": len([s for s in sources if s.status == 'processing']),
                    "pending": len([s for s in sources if s.status == 'uploaded'])
                }
            },
            "correlation": {
                "available": unified_kb is not None,
                "confidence_score": json.loads(unified_kb.confidence_scores)["overall_confidence"] if unified_kb else 0.0
            },
            "outputs": {
                "audiobooks": len(audiobooks),
                "movie_treatments": len(treatments),
                "interactive_maps": len(maps)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في لوحة التحكم: {str(e)}")

app.include_router(web_novel.router, prefix="/api", tags=["Interactive Web Novel"])
