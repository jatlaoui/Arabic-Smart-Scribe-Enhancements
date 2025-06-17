
# نقاط API محسنة لسير عمل "فيديو إلى كتاب"
from fastapi import HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime

class VideoProcessingRequest(BaseModel):
    video_url: str
    quality_level: str = "high"
    language: str = "ar"

class StepProcessingRequest(BaseModel):
    project_id: str
    previous_results: Optional[List[Dict[str, Any]]] = []
    step_parameters: Optional[Dict[str, Any]] = {}

@app.post("/api/video-to-book/start-processing")
async def start_video_processing(
    request: VideoProcessingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """بدء معالجة فيديو شاملة لتحويله إلى رواية"""
    try:
        # إنشاء مشروع جديد
        project_id = str(uuid.uuid4())
        project = Project(
            id=project_id,
            title=f"رواية من فيديو - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            description=f"تحويل فيديو إلى رواية: {request.video_url}",
            content=request.video_url,
            created_at=datetime.utcnow()
        )
        db.add(project)
        db.commit()
        
        # بدء مهمة المعالجة الشاملة
        task = complete_video_to_book_pipeline.delay(
            project_id, 
            request.video_url, 
            request.quality_level,
            request.language
        )
        
        return {
            "project_id": project_id,
            "task_id": task.id,
            "status": "started",
            "message": "تم بدء معالجة الفيديو",
            "estimated_duration": "15-30 دقيقة"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في بدء المعالجة: {str(e)}")

@app.post("/api/video-to-book/extract-transcript")
async def extract_transcript_step(
    request: StepProcessingRequest,
    background_tasks: BackgroundTasks
):
    """خطوة استخراج النص من الفيديو"""
    try:
        task = extract_video_transcript_task.delay(
            request.project_id,
            request.step_parameters
        )
        
        return {
            "task_id": task.id,
            "step": "extract_transcript",
            "status": "started",
            "message": "جاري استخراج النص من الفيديو..."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في استخراج النص: {str(e)}")

@app.post("/api/video-to-book/clean-transcript")
async def clean_transcript_step(
    request: StepProcessingRequest,
    background_tasks: BackgroundTasks
):
    """خطوة تنظيف وتحسين النص"""
    try:
        # الحصول على النص المستخرج من الخطوة السابقة
        previous_transcript = request.previous_results[-1] if request.previous_results else {}
        
        task = clean_and_enhance_transcript_task.delay(
            request.project_id,
            previous_transcript.get('transcript', ''),
            request.step_parameters
        )
        
        return {
            "task_id": task.id,
            "step": "clean_transcript",
            "status": "started",
            "message": "جاري تنظيف وتحسين النص..."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في تنظيف النص: {str(e)}")

@app.post("/api/shahid/generate-narrative")
async def generate_narrative_step(
    request: StepProcessingRequest,
    background_tasks: BackgroundTasks
):
    """خطوة توليد الرواية النهائية"""
    try:
        task = generate_final_narrative_task.delay(
            request.project_id,
            request.previous_results,
            request.step_parameters
        )
        
        return {
            "task_id": task.id,
            "step": "generate_narrative",
            "status": "started",
            "message": "جاري كتابة الرواية النهائية..."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في توليد الرواية: {str(e)}")

@app.get("/api/projects/{project_id}/video-book-status")
async def get_video_book_status(project_id: str, db: Session = Depends(get_db)):
    """الحصول على حالة مشروع تحويل الفيديو إلى كتاب"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="المشروع غير موجود")
        
        # جمع حالة جميع المراحل
        stages_status = {
            "transcript_extraction": "completed",
            "text_cleaning": "completed", 
            "architectural_analysis": "completed",
            "creative_development": "completed",
            "narrative_generation": "in_progress"
        }
        
        return {
            "project_id": project_id,
            "title": project.title,
            "overall_progress": 80,
            "current_stage": "narrative_generation",
            "stages": stages_status,
            "created_at": project.created_at.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في جلب حالة المشروع: {str(e)}")
