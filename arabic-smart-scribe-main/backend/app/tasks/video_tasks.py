from celery import Celery
from app.core.config import settings
import redis
import json
from typing import Dict, Any, Optional
import asyncio
from app.services.gemini_service import GeminiService
from app.services.youtube_service import YouTubeService
from app.celery_worker import celery_app # Import the shared Celery app
from datetime import datetime # Add missing import for TaskStateManager

# Celery app configuration (REMOVED local instance)
# celery_app = Celery(
#     "arabic_smart_scribe",
#     broker=settings.REDIS_URL,
#     backend=settings.REDIS_URL,
#     include=['app.tasks.video_tasks', 'app.tasks.shahid_tasks'] # shahid_tasks doesn't exist
# )

# Redis client for task state management - kept as it's used by TaskStateManager
# This might be okay if it's for custom progress state separate from Celery backend.
redis_client = redis.from_url(settings.REDIS_URL)

class TaskStateManager:
    """Manages task state and progress updates"""
    
    @staticmethod
    def update_task_progress(task_id: str, step: str, progress: int, status: str, result: Optional[Any] = None, error: Optional[str] = None):
        """Update task progress in Redis"""
        task_data = {
            'task_id': task_id,
            'step': step,
            'progress': progress,
            'status': status,
            'result': result,
            'error': error,
            'timestamp': str(datetime.utcnow())
        }
        redis_client.setex(f"task:{task_id}", 3600, json.dumps(task_data, default=str))
    
    @staticmethod
    def get_task_status(task_id: str) -> Optional[Dict[str, Any]]:
        """Get task status from Redis"""
        data = redis_client.get(f"task:{task_id}")
        if data:
            return json.loads(data)
        return None

@celery_app.task(bind=True)
def extract_transcript_task(self, video_url: str):
    """استخراج النص من فيديو يوتيوب مع تحديثات التقدم"""
    try:
        # تحديث التقدم - بدء المهمة
        TaskStateManager.update_task_progress(
            self.request.id, 'transcript_extraction', 10, 'running', 
            message='بدء استخراج معرف الفيديو...'
        )
    """Extract transcript from video - Step 1"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'transcript_extraction', 10, 'running'
        )
        
        youtube_service = YouTubeService()
        
        # Extract video ID
        TaskStateManager.update_task_progress(
            self.request.id, 'transcript_extraction', 30, 'running'
        )
        
        # Get transcript
        transcript = youtube_service.get_transcript(video_url)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'transcript_extraction', 100, 'completed',
            result={'transcript': transcript, 'video_url': video_url}
        )
        
        return {
            'transcript': transcript,
            'video_url': video_url,
            'task_id': self.request.id
        }
        
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'transcript_extraction', 0, 'error',
            error=str(e)
        )
        raise

@celery_app.task(bind=True)
def clean_transcript_task(self, transcript: str):
    """Clean and organize transcript - Step 2"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'text_cleaning', 10, 'running'
        )
        
        gemini_service = GeminiService()
        
        # Advanced cleaning prompt
        cleaning_prompt = f"""
        قم بتنظيف وتنسيق النص التالي المستخرج من فيديو يوتيوب:
        
        المهام المطلوبة:
        1. إزالة الكلمات المكررة والتداخلات
        2. تصحيح الأخطاء الإملائية والنحوية
        3. تنسيق النص ليكون متماسكاً ومقروءاً
        4. إضافة علامات الترقيم المناسبة
        5. تجميع الأفكار المترابطة في فقرات
        6. الحفاظ على المعنى الأصلي والسياق
        
        النص الأصلي:
        {transcript}
        
        أرجع النص المنظف فقط دون أي تعليقات إضافية.
        """
        
        TaskStateManager.update_task_progress(
            self.request.id, 'text_cleaning', 50, 'running'
        )
        
        cleaned_text = gemini_service.generate_content(cleaning_prompt)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'text_cleaning', 100, 'completed',
            result={'cleaned_text': cleaned_text}
        )
        
        return {
            'cleaned_text': cleaned_text,
            'task_id': self.request.id
        }
        
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'text_cleaning', 0, 'error',
            error=str(e)
        )
        raise

@celery_app.task(bind=True)
def generate_outline_task(self, cleaned_text: str):
    """Generate book outline - Step 3"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'outline_generation', 10, 'running'
        )
        
        gemini_service = GeminiService()
        
        outline_prompt = f"""
        قم بإنشاء مخطط تفصيلي لكتاب بناءً على النص التالي:
        
        المتطلبات:
        1. تحديد الفكرة الرئيسية للكتاب
        2. تقسيم المحتوى إلى فصول منطقية (5-10 فصول)
        3. تحديد النقاط الرئيسية لكل فصل
        4. اقتراح عنوان جذاب للكتاب
        5. كتابة مقدمة وخاتمة مقترحتين
        
        أرجع النتيجة في صيغة JSON بالتنسيق التالي:
        {{
            "title": "عنوان الكتاب",
            "introduction": "مقدمة مقترحة",
            "chapters": [
                {{
                    "number": 1,
                    "title": "عنوان الفصل",
                    "main_points": ["نقطة 1", "نقطة 2", "نقطة 3"],
                    "estimated_length": "عدد الكلمات المقترح"
                }}
            ],
            "conclusion": "خاتمة مقترحة"
        }}
        
        النص:
        {cleaned_text}
        """
        
        TaskStateManager.update_task_progress(
            self.request.id, 'outline_generation', 70, 'running'
        )
        
        outline_response = gemini_service.generate_content(outline_prompt)
        
        # Parse JSON response
        try:
            outline = json.loads(outline_response)
        except json.JSONDecodeError:
            # Fallback: extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', outline_response, re.DOTALL)
            if json_match:
                outline = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse outline JSON")
        
        TaskStateManager.update_task_progress(
            self.request.id, 'outline_generation', 100, 'completed',
            result={'outline': outline}
        )
        
        return {
            'outline': outline,
            'task_id': self.request.id
        }
        
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'outline_generation', 0, 'error',
            error=str(e)
        )
        raise

@celery_app.task(bind=True)
def write_chapters_task(self, outline: Dict[str, Any], cleaned_text: str):
    """Write all book chapters - Step 4"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'chapter_writing', 5, 'running'
        )
        
        gemini_service = GeminiService()
        chapters = []
        total_chapters = len(outline.get('chapters', []))
        
        # Write introduction
        introduction = outline.get('introduction', '')
        chapters.append({
            'type': 'introduction',
            'title': 'مقدمة',
            'content': introduction
        })
        
        # Write each chapter
        for i, chapter_outline in enumerate(outline.get('chapters', [])):
            progress = int(10 + (i / total_chapters) * 80)
            TaskStateManager.update_task_progress(
                self.request.id, 'chapter_writing', progress, 'running'
            )
            
            chapter_prompt = f"""
            اكتب الفصل التالي من الكتاب بناءً على المخطط والنص الأصلي:
            
            عنوان الفصل: {chapter_outline['title']}
            النقاط الرئيسية: {', '.join(chapter_outline['main_points'])}
            الطول المقترح: {chapter_outline.get('estimated_length', '1000-1500 كلمة')}
            
            متطلبات الكتابة:
            1. أسلوب شيق ومفهوم للقارئ العربي
            2. ربط المحتوى بالنص الأصلي
            3. استخدام أمثلة وتطبيقات عملية
            4. تدفق منطقي للأفكار
            5. خاتمة تربط بالفصل التالي
            
            النص الأصلي للمرجعية:
            {cleaned_text[:2000]}...
            
            اكتب المحتوى كاملاً دون عناوين فرعية إضافية.
            """
            
            chapter_content = gemini_service.generate_content(chapter_prompt)
            
            chapters.append({
                'type': 'chapter',
                'number': chapter_outline['number'],
                'title': chapter_outline['title'],
                'content': chapter_content
            })
        
        # Write conclusion
        conclusion = outline.get('conclusion', '')
        chapters.append({
            'type': 'conclusion',
            'title': 'خاتمة',
            'content': conclusion
        })
        
        TaskStateManager.update_task_progress(
            self.request.id, 'chapter_writing', 100, 'completed',
            result={
                'book': {
                    'title': outline.get('title', 'كتاب من فيديو'),
                    'chapters': chapters,
                    'total_chapters': len(chapters),
                    'word_count': sum(len(ch['content'].split()) for ch in chapters)
                }
            }
        )
        
        return {
            'book': {
                'title': outline.get('title', 'كتاب من فيديو'),
                'chapters': chapters,
                'total_chapters': len(chapters),
                'word_count': sum(len(ch['content'].split()) for ch in chapters)
            },
            'task_id': self.request.id
        }
        
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'chapter_writing', 0, 'error',
            error=str(e)
        )
        raise



@celery_app.task(bind=True)
def architectural_analysis_task(self, content: str, project_id: str):
    """مهمة التحليل المعماري مع حفظ النتائج"""
    try:
        # تحديث التقدم
        TaskStateManager.update_task_progress(
            self.request.id, 'architectural_analysis', 20, 'running',
            message='بدء التحليل المعماري للنص...'
        )
        
        # تحليل النص باستخدام Gemini
        analysis_result = analyze_narrative_architecture(content)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'architectural_analysis', 70, 'running',
            message='حفظ نتائج التحليل في قاعدة البيانات...'
        )
        
        # حفظ النتائج في قاعدة البيانات
        from database import SessionLocal
        db = SessionLocal()
        try:
            kb = DatabaseService.save_knowledge_base(db, project_id, analysis_result)
            
            result = {
                'knowledge_base': analysis_result,
                'knowledge_base_id': kb.id,
                'project_id': project_id
            }
            
            TaskStateManager.update_task_progress(
                self.request.id, 'architectural_analysis', 100, 'completed',
                message='تم اكتمال التحليل المعماري بنجاح', result=result
            )
            
            return result
            
        finally:
            db.close()
            
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'architectural_analysis', 0, 'failed',
            message=f'فشل في التحليل المعماري: {str(e)}'
        )
        raise

@celery_app.task(bind=True)
def creative_development_task(self, project_id: str, project_data: dict):
    """مهمة التطوير الإبداعي"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'creative_development', 30, 'running',
            message='تطوير الشخصيات والأحداث...'
        )
        
        # تطوير العناصر الإبداعية
        creative_layers = develop_creative_elements(project_data)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'creative_development', 80, 'running',
            message='تجميع الطبقات الإبداعية...'
        )
        
        result = {
            'creative_layers': creative_layers,
            'project_id': project_id
        }
        
        TaskStateManager.update_task_progress(
            self.request.id, 'creative_development', 100, 'completed',
            message='تم اكتمال التطوير الإبداعي', result=result
        )
        
        return result
        
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'creative_development', 0, 'failed',
            message=f'فشل في التطوير الإبداعي: {str(e)}'
        )
        raise
