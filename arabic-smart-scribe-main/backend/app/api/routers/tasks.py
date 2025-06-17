
from fastapi import APIRouter, HTTPException
from celery.result import AsyncResult
from ...tasks.celery_app import celery_app
from ...tasks.video_tasks import process_video_to_book_task
from pydantic import BaseModel

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

class VideoToBookTaskRequest(BaseModel):
    raw_transcript: str
    writing_style: str = "روائي"

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    current: int = 0
    total: int = 0
    message: str = ""
    result: dict = None
    error: str = None

@router.post("/video-to-book", response_model=dict)
async def start_video_to_book_task(request: VideoToBookTaskRequest):
    """Start background task for converting video to book"""
    try:
        task = process_video_to_book_task.delay(
            request.raw_transcript,
            request.writing_style
        )
        
        return {
            "task_id": task.id,
            "status": "started",
            "message": "تم بدء مهمة تحويل الفيديو إلى كتاب"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في بدء المهمة: {str(e)}")

@router.get("/status/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """Get status of a background task"""
    try:
        task_result = AsyncResult(task_id, app=celery_app)
        
        if task_result.state == "PENDING":
            response = TaskStatusResponse(
                task_id=task_id,
                status="pending",
                message="المهمة في انتظار المعالجة..."
            )
        elif task_result.state == "PROGRESS":
            response = TaskStatusResponse(
                task_id=task_id,
                status="progress",
                current=task_result.info.get("current", 0),
                total=task_result.info.get("total", 4),
                message=task_result.info.get("status", "جاري المعالجة...")
            )
        elif task_result.state == "SUCCESS":
            response = TaskStatusResponse(
                task_id=task_id,
                status="success",
                current=4,
                total=4,
                message="تم إنجاز المهمة بنجاح",
                result=task_result.result
            )
        elif task_result.state == "FAILURE":
            response = TaskStatusResponse(
                task_id=task_id,
                status="failure",
                message="فشل في تنفيذ المهمة",
                error=str(task_result.info)
            )
        else:
            response = TaskStatusResponse(
                task_id=task_id,
                status=task_result.state.lower(),
                message=f"حالة المهمة: {task_result.state}"
            )
            
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في الحصول على حالة المهمة: {str(e)}")

@router.delete("/cancel/{task_id}")
async def cancel_task(task_id: str):
    """Cancel a running task"""
    try:
        celery_app.control.revoke(task_id, terminate=True)
        return {"message": f"تم إلغاء المهمة {task_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في إلغاء المهمة: {str(e)}")



# مهام Celery لمعالجة المصادر متعددة الوسائط
from celery import group, chain
from multimedia_service import MultimediaAnalysisService, MultimediaOutputService

multimedia_service = MultimediaAnalysisService()
output_service = MultimediaOutputService()

@celery_app.task(bind=True)
def process_multimedia_project_task(self, project_id: str):
    """المهمة الرئيسية لمعالجة مشروع متعدد الوسائط"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'multimedia_analysis', 10, 'running',
            message='بدء تحليل المصادر المتعددة...'
        )
        
        # جلب جميع المصادر
        from database import SessionLocal
        db = SessionLocal()
        
        try:
            sources = db.query(Source).filter(Source.project_id == project_id).all()
            
            TaskStateManager.update_task_progress(
                self.request.id, 'multimedia_analysis', 20, 'running',
                message=f'تم العثور على {len(sources)} مصدر للتحليل...'
            )
            
            # معالجة كل مصدر حسب نوعه
            analysis_results = []
            total_sources = len(sources)
            
            for i, source in enumerate(sources):
                progress = 20 + (60 * i // total_sources)
                TaskStateManager.update_task_progress(
                    self.request.id, 'multimedia_analysis', progress, 'running',
                    message=f'تحليل {source.file_name}...'
                )
                
                # تحديث حالة المصدر
                source.status = 'processing'
                db.commit()
                
                # تحليل المصدر حسب نوعه
                if source.source_type == 'video':
                    result = await multimedia_service.analyze_video_source(source.id, source.file_path)
                elif source.source_type == 'audio':
                    result = await multimedia_service.analyze_audio_source(source.id, source.file_path)
                elif source.source_type == 'pdf':
                    result = await multimedia_service.analyze_pdf_source(source.id, source.file_path)
                elif source.source_type == 'image':
                    result = await multimedia_service.analyze_image_source(source.id, source.file_path)
                else:
                    result = {"error": f"نوع مصدر غير مدعوم: {source.source_type}"}
                
                # حفظ نتائج التحليل
                source.analysis_results = json.dumps(result, ensure_ascii=False)
                source.status = 'analyzed' if 'error' not in result else 'error'
                source.analyzed_at = datetime.utcnow()
                db.commit()
                
                analysis_results.append(result)
            
            TaskStateManager.update_task_progress(
                self.request.id, 'multimedia_analysis', 80, 'running',
                message='ربط المعلومات من المصادر المختلفة...'
            )
            
            # ربط المصادر المتعددة
            correlation_result = await multimedia_service.correlate_sources(project_id, analysis_results)
            
            # حفظ النتائج المترابطة
            unified_kb = UnifiedKnowledgeBase(
                id=str(uuid.uuid4()),
                project_id=project_id,
                correlation_results=json.dumps(correlation_result.get('correlation_data', {}), ensure_ascii=False),
                confidence_scores=json.dumps({'overall_confidence': correlation_result.get('confidence_score', 0.0)}, ensure_ascii=False),
                timeline_data=json.dumps(correlation_result.get('correlation_data', {}).get('unified_timeline', []), ensure_ascii=False),
                character_mapping=json.dumps(correlation_result.get('correlation_data', {}).get('character_mapping', {}), ensure_ascii=False),
                location_mapping=json.dumps(correlation_result.get('correlation_data', {}).get('location_mapping', {}), ensure_ascii=False),
                cross_references=json.dumps(correlation_result.get('correlation_data', {}).get('cross_references', []), ensure_ascii=False)
            )
            db.add(unified_kb)
            db.commit()
            
            final_result = {
                'project_id': project_id,
                'sources_analyzed': len(sources),
                'correlation_result': correlation_result,
                'unified_knowledge_base_id': unified_kb.id
            }
            
            TaskStateManager.update_task_progress(
                self.request.id, 'multimedia_analysis', 100, 'completed',
                message='تم اكتمال تحليل المصادر المتعددة بنجاح', result=final_result
            )
            
            return final_result
            
        finally:
            db.close()
            
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'multimedia_analysis', 0, 'failed',
            message=f'فشل في تحليل المصادر المتعددة: {str(e)}'
        )
        raise

@celery_app.task(bind=True)
def generate_audiobook_task(self, project_id: str, voice_mapping: Dict[str, str]):
    """مهمة توليد الكتاب الصوتي"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'audiobook_generation', 20, 'running',
            message='بدء توليد الكتاب الصوتي...'
        )
        
        # توليد الكتاب الصوتي
        audiobook_result = await output_service.generate_audiobook(project_id, voice_mapping)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'audiobook_generation', 100, 'completed',
            message='تم إنشاء الكتاب الصوتي بنجاح', result=audiobook_result
        )
        
        return audiobook_result
        
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'audiobook_generation', 0, 'failed',
            message=f'فشل في توليد الكتاب الصوتي: {str(e)}'
        )
        raise

@celery_app.task(bind=True)
def generate_movie_treatment_task(self, project_id: str):
    """مهمة توليد الموجز السينمائي"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'movie_treatment', 30, 'running',
            message='استرجاع البيانات السردية...'
        )
        
        # استرجاع البيانات السردية
        from database import SessionLocal
        db = SessionLocal()
        
        try:
            unified_kb = db.query(UnifiedKnowledgeBase).filter(
                UnifiedKnowledgeBase.project_id == project_id
            ).first()
            
            if not unified_kb:
                raise Exception("لا توجد قاعدة معرفة موحدة للمشروع")
            
            narrative_data = {
                'correlation_results': json.loads(unified_kb.correlation_results),
                'timeline': json.loads(unified_kb.timeline_data),
                'characters': json.loads(unified_kb.character_mapping),
                'locations': json.loads(unified_kb.location_mapping)
            }
            
            TaskStateManager.update_task_progress(
                self.request.id, 'movie_treatment', 70, 'running',
                message='توليد الموجز السينمائي...'
            )
            
            # توليد الموجز السينمائي
            treatment_result = await output_service.generate_movie_treatment(project_id, narrative_data)
            
            # حفظ النتيجة في قاعدة البيانات
            if 'error' not in treatment_result:
                treatment_content = treatment_result.get('content', {})
                movie_treatment = MovieTreatment(
                    id=treatment_result['treatment_id'],
                    project_id=project_id,
                    treatment_content=json.dumps(treatment_content, ensure_ascii=False),
                    genre=treatment_content.get('genre', ''),
                    logline=treatment_content.get('logline', ''),
                    main_characters=json.dumps(treatment_content.get('main_characters', []), ensure_ascii=False),
                    key_scenes=json.dumps(treatment_content.get('key_scenes', []), ensure_ascii=False),
                    three_act_structure=json.dumps(treatment_content.get('three_act_structure', {}), ensure_ascii=False)
                )
                db.add(movie_treatment)
                db.commit()
            
            TaskStateManager.update_task_progress(
                self.request.id, 'movie_treatment', 100, 'completed',
                message='تم إنشاء الموجز السينمائي بنجاح', result=treatment_result
            )
            
            return treatment_result
            
        finally:
            db.close()
            
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'movie_treatment', 0, 'failed',
            message=f'فشل في توليد الموجز السينمائي: {str(e)}'
        )
        raise

@celery_app.task(bind=True)
def generate_interactive_map_task(self, project_id: str):
    """مهمة توليد الخريطة التفاعلية"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'interactive_map', 40, 'running',
            message='جمع بيانات الأماكن...'
        )
        
        # جمع بيانات الأماكن من قاعدة البيانات
        from database import SessionLocal
        db = SessionLocal()
        
        try:
            places = db.query(Place).filter(Place.project_id == project_id).all()
            places_data = [
                {
                    'name': place.name,
                    'description': place.description,
                    'significance': place.significance,
                    'related_events': []  # يمكن ربطها لاحقاً
                }
                for place in places
            ]
            
            TaskStateManager.update_task_progress(
                self.request.id, 'interactive_map', 80, 'running',
                message='إنشاء الخريطة التفاعلية...'
            )
            
            # توليد الخريطة
            map_result = await output_service.generate_interactive_map(project_id, places_data)
            
            # حفظ النتيجة في قاعدة البيانات
            if 'error' not in map_result:
                interactive_map = InteractiveMap(
                    id=map_result['map_id'],
                    project_id=project_id,
                    geojson_data=json.dumps(map_result['geojson'], ensure_ascii=False),
                    location_details=json.dumps(places_data, ensure_ascii=False),
                    map_center_lat=map_result['center']['lat'],
                    map_center_lng=map_result['center']['lng'],
                    zoom_level=map_result['zoom_level']
                )
                db.add(interactive_map)
                db.commit()
            
            TaskStateManager.update_task_progress(
                self.request.id, 'interactive_map', 100, 'completed',
                message='تم إنشاء الخريطة التفاعلية بنجاح', result=map_result
            )
            
            return map_result
            
        finally:
            db.close()
            
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'interactive_map', 0, 'failed',
            message=f'فشل في إنشاء الخريطة التفاعلية: {str(e)}'
        )
        raise
