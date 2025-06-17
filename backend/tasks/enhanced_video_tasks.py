
# مهام Celery محسنة لسير عمل "فيديو إلى كتاب" مع تتبع التقدم المفصل

@celery_app.task(bind=True)
def complete_video_to_book_pipeline(self, project_id: str, video_url: str, quality_level: str, language: str):
    """مهمة شاملة لتحويل فيديو كامل إلى رواية"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'video_to_book_pipeline', 5, 'running',
            message='بدء معالجة الفيديو الشاملة...'
        )
        
        pipeline_results = {}
        
        # المرحلة 1: استخراج النص
        TaskStateManager.update_task_progress(
            self.request.id, 'video_to_book_pipeline', 15, 'running',
            message='استخراج النص من الفيديو...'
        )
        
        transcript_result = extract_video_transcript_sync(project_id, video_url, quality_level)
        pipeline_results['transcript'] = transcript_result
        
        # المرحلة 2: تنظيف النص
        TaskStateManager.update_task_progress(
            self.request.id, 'video_to_book_pipeline', 30, 'running',
            message='تنظيف وتحسين النص المستخرج...'
        )
        
        clean_text_result = clean_transcript_sync(project_id, transcript_result['transcript'])
        pipeline_results['clean_transcript'] = clean_text_result
        
        # المرحلة 3: التحليل المعماري
        TaskStateManager.update_task_progress(
            self.request.id, 'video_to_book_pipeline', 50, 'running',
            message='تحليل العناصر السردية...'
        )
        
        analysis_result = architectural_analysis_sync(project_id, clean_text_result['clean_text'])
        pipeline_results['analysis'] = analysis_result
        
        # المرحلة 4: التطوير الإبداعي
        TaskStateManager.update_task_progress(
            self.request.id, 'video_to_book_pipeline', 70, 'running',
            message='تطوير الطبقات الإبداعية...'
        )
        
        creative_result = creative_development_sync(project_id, analysis_result)
        pipeline_results['creative_layers'] = creative_result
        
        # المرحلة 5: توليد الرواية
        TaskStateManager.update_task_progress(
            self.request.id, 'video_to_book_pipeline', 85, 'running',
            message='كتابة الرواية النهائية...'
        )
        
        narrative_result = generate_narrative_sync(project_id, pipeline_results)
        pipeline_results['final_narrative'] = narrative_result
        
        # حفظ النتائج النهائية
        TaskStateManager.update_task_progress(
            self.request.id, 'video_to_book_pipeline', 95, 'running',
            message='حفظ النتائج النهائية...'
        )
        
        save_pipeline_results(project_id, pipeline_results)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'video_to_book_pipeline', 100, 'completed',
            message='تم اكتمال تحويل الفيديو إلى رواية بنجاح!',
            result=pipeline_results
        )
        
        return pipeline_results
        
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'video_to_book_pipeline', 0, 'failed',
            message=f'فشل في معالجة الفيديو: {str(e)}'
        )
        raise

@celery_app.task(bind=True)
def extract_video_transcript_task(self, project_id: str, parameters: Dict[str, Any]):
    """مهمة استخراج النص من الفيديو مع تتبع التقدم"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'extract_transcript', 10, 'running',
            message='تحميل الفيديو...'
        )
        
        # تحميل الفيديو
        video_path = download_video(project_id, parameters.get('video_url'))
        
        TaskStateManager.update_task_progress(
            self.request.id, 'extract_transcript', 30, 'running',
            message='استخراج الصوت من الفيديو...'
        )
        
        # استخراج الصوت
        audio_path = extract_audio_from_video(video_path)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'extract_transcript', 60, 'running',
            message='تحويل الصوت إلى نص باستخدام Whisper...'
        )
        
        # تحويل إلى نص
        transcript = transcribe_audio_with_whisper(audio_path, parameters.get('language', 'ar'))
        
        TaskStateManager.update_task_progress(
            self.request.id, 'extract_transcript', 90, 'running',
            message='حفظ النتائج...'
        )
        
        result = {
            'transcript': transcript,
            'duration': get_video_duration(video_path),
            'language': parameters.get('language', 'ar'),
            'quality': parameters.get('quality_level', 'high')
        }
        
        TaskStateManager.update_task_progress(
            self.request.id, 'extract_transcript', 100, 'completed',
            message='تم استخراج النص بنجاح',
            result=result
        )
        
        return result
        
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'extract_transcript', 0, 'failed',
            message=f'فشل في استخراج النص: {str(e)}'
        )
        raise

@celery_app.task(bind=True)
def clean_and_enhance_transcript_task(self, project_id: str, raw_transcript: str, parameters: Dict[str, Any]):
    """مهمة تنظيف وتحسين النص"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'clean_transcript', 20, 'running',
            message='تحليل النص الخام...'
        )
        
        # تحليل جودة النص
        text_quality = analyze_transcript_quality(raw_transcript)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'clean_transcript', 40, 'running',
            message='إزالة التكرارات والضوضاء...'
        )
        
        # تنظيف أولي
        cleaned_text = remove_repetitions_and_noise(raw_transcript)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'clean_transcript', 60, 'running',
            message='تصحيح الأخطاء الإملائية والنحوية...'
        )
        
        # تصحيح بـ AI
        corrected_text = ai_grammar_correction(cleaned_text)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'clean_transcript', 80, 'running',
            message='تحسين تدفق النص وعلامات الترقيم...'
        )
        
        # تحسين التدفق
        enhanced_text = enhance_text_flow(corrected_text)
        
        result = {
            'clean_text': enhanced_text,
            'original_length': len(raw_transcript),
            'cleaned_length': len(enhanced_text),
            'quality_score': text_quality,
            'improvements_made': [
                'إزالة التكرارات',
                'تصحيح الأخطاء',
                'تحسين علامات الترقيم',
                'تحسين التدفق'
            ]
        }
        
        TaskStateManager.update_task_progress(
            self.request.id, 'clean_transcript', 100, 'completed',
            message='تم تنظيف النص بنجاح',
            result=result
        )
        
        return result
        
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'clean_transcript', 0, 'failed',
            message=f'فشل في تنظيف النص: {str(e)}'
        )
        raise

@celery_app.task(bind=True)
def generate_final_narrative_task(self, project_id: str, previous_results: List[Dict], parameters: Dict[str, Any]):
    """مهمة توليد الرواية النهائية"""
    try:
        TaskStateManager.update_task_progress(
            self.request.id, 'generate_narrative', 15, 'running',
            message='جمع العناصر السردية...'
        )
        
        # جمع جميع العناصر من المراحل السابقة
        narrative_elements = compile_narrative_elements(previous_results)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'generate_narrative', 30, 'running',
            message='بناء هيكل الرواية...'
        )
        
        # بناء هيكل الرواية
        narrative_structure = build_narrative_structure(narrative_elements)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'generate_narrative', 50, 'running',
            message='كتابة الفصل الأول...'
        )
        
        # كتابة الفصول
        chapters = []
        total_chapters = len(narrative_structure.get('chapters', []))
        
        for i, chapter_outline in enumerate(narrative_structure.get('chapters', [])):
            progress = 50 + (30 * i / total_chapters)
            TaskStateManager.update_task_progress(
                self.request.id, 'generate_narrative', progress, 'running',
                message=f'كتابة الفصل {i+1} من {total_chapters}...'
            )
            
            chapter = generate_chapter_content(chapter_outline, narrative_elements)
            chapters.append(chapter)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'generate_narrative', 85, 'running',
            message='تجميع الرواية النهائية...'
        )
        
        # تجميع الرواية النهائية
        final_narrative = compile_final_narrative(chapters, narrative_elements)
        
        TaskStateManager.update_task_progress(
            self.request.id, 'generate_narrative', 95, 'running',
            message='مراجعة نهائية وحفظ...'
        )
        
        # حفظ في قاعدة البيانات
        save_final_narrative(project_id, final_narrative)
        
        result = {
            'narrative': final_narrative,
            'chapters_count': len(chapters),
            'word_count': count_words(final_narrative),
            'reading_time_minutes': estimate_reading_time(final_narrative),
            'style': parameters.get('narrative_style', 'literary'),
            'generated_at': datetime.utcnow().isoformat()
        }
        
        TaskStateManager.update_task_progress(
            self.request.id, 'generate_narrative', 100, 'completed',
            message='تم إنشاء الرواية بنجاح!',
            result=result
        )
        
        return result
        
    except Exception as e:
        TaskStateManager.update_task_progress(
            self.request.id, 'generate_narrative', 0, 'failed',
            message=f'فشل في توليد الرواية: {str(e)}'
        )
        raise

# دوال مساعدة للمعالجة
def extract_video_transcript_sync(project_id: str, video_url: str, quality_level: str) -> Dict[str, Any]:
    """استخراج النص من الفيديو (نسخة متزامنة)"""
    # تنفيذ الاستخراج
    return {"transcript": "النص المستخرج هنا...", "duration": 1800}

def clean_transcript_sync(project_id: str, transcript: str) -> Dict[str, Any]:
    """تنظيف النص (نسخة متزامنة)"""
    # تنفيذ التنظيف
    return {"clean_text": transcript, "quality_score": 0.85}

def architectural_analysis_sync(project_id: str, text: str) -> Dict[str, Any]:
    """التحليل المعماري (نسخة متزامنة)"""
    # استخدام المحرك الموجود
    from advanced_context_engine import analyze_narrative_architecture
    return analyze_narrative_architecture(text)

def creative_development_sync(project_id: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
    """التطوير الإبداعي (نسخة متزامنة)"""
    # تطوير العناصر الإبداعية
    return {"creative_layers": analysis, "development_level": "professional"}

def generate_narrative_sync(project_id: str, all_results: Dict[str, Any]) -> Dict[str, Any]:
    """توليد الرواية (نسخة متزامنة)"""
    # توليد الرواية النهائية
    return {"narrative": "الرواية النهائية هنا...", "chapters": 12}
