
import asyncio
from typing import Dict, Any
from ..services.gemini_service import gemini_service

class VideoProcessingService:
    """Service for processing videos and converting them to books"""
    
    async def clean_transcript(self, raw_transcript: str) -> Dict[str, Any]:
        """Clean transcript from timestamps and filler words"""
        
        cleaning_prompt = f"""
        قم بتنظيف النص التالي من الطوابع الزمنية والكلمات الحشو والتكرارات غير المفيدة:

        النص الخام:
        {raw_transcript}

        المطلوب:
        1. إزالة جميع الطوابع الزمنية (مثل [00:15], 0:30, إلخ)
        2. إزالة الكلمات الحشو (مثل: آه، أم، يعني، إلخ)
        3. إزالة التكرارات غير المفيدة
        4. تصحيح الأخطاء الإملائية الواضحة
        5. الحفاظ على المعنى والسياق الأصلي

        أعد كتابة النص منظماً وواضحاً مع الحفاظ على جميع المعلومات المهمة.
        """
        
        try:
            cleaned_text = await gemini_service.generate_content(cleaning_prompt)
            
            return {
                "original_length": len(raw_transcript),
                "cleaned_length": len(cleaned_text),
                "cleaned_text": cleaned_text,
                "status": "success"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def extract_key_points(self, cleaned_text: str) -> Dict[str, Any]:
        """Extract and organize key points from cleaned text"""
        
        extraction_prompt = f"""
        من النص التالي، استخرج النقاط الرئيسية وصنفها:

        النص:
        {cleaned_text}

        المطلوب:
        1. استخرج 5-10 نقاط رئيسية من النص
        2. صنف هذه النقاط إلى مواضيع (مثل: مقدمة، تطوير، تحديات، حلول، خلاصة)
        3. لكل نقطة، اكتب تلخيصاً مختصراً (2-3 جمل)
        4. حدد الكلمات المفتاحية المهمة
        5. اقترح عنواناً مناسباً للمحتوى

        أعط النتيجة في شكل منظم وواضح.
        """
        
        try:
            key_points_analysis = await gemini_service.generate_content(extraction_prompt)
            
            return {
                "key_points": key_points_analysis,
                "word_count": len(cleaned_text.split()),
                "estimated_reading_time": len(cleaned_text.split()) // 200,  # تقدير وقت القراءة
                "status": "success"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def generate_book_outline(self, key_points: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive book outline from key points"""
        
        outline_prompt = f"""
        بناءً على النقاط الرئيسية التالية، أنشئ مخططاً متكاملاً لكتاب:

        النقاط الرئيسية:
        {key_points}

        المطلوب:
        1. عنوان مقترح للكتاب
        2. مقدمة (الهدف والجمهور المستهدف)
        3. تقسيم إلى فصول (5-8 فصول)
        4. لكل فصل:
           - عنوان الفصل
           - الهدف من الفصل
           - النقاط الرئيسية التي سيغطيها
           - العدد المقدر للكلمات
        5. خاتمة مقترحة

        اجعل التنظيم منطقياً ومتدرجاً، مع تدفق سلس بين الفصول.
        """
        
        try:
            book_outline = await gemini_service.generate_content(outline_prompt)
            
            return {
                "book_outline": book_outline,
                "total_estimated_words": 15000,  # تقدير أولي
                "estimated_chapters": 6,
                "status": "success"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def write_chapter(self, chapter_info: Dict[str, Any], relevant_content: str, writing_style: str = "روائي") -> Dict[str, Any]:
        """Write individual chapter in narrative style"""
        
        chapter_prompt = f"""
        اكتب الفصل التالي بأسلوب {writing_style} جذاب ومفصل:

        معلومات الفصل:
        - رقم الفصل: {chapter_info.get('chapter_number', 1)}
        - عنوان الفصل: {chapter_info.get('title', 'فصل جديد')}
        - الهدف: {chapter_info.get('purpose', '')}
        - النقاط المطلوب تغطيتها: {chapter_info.get('key_points', [])}
        - العدد المستهدف للكلمات: {chapter_info.get('estimated_words', 2000)}

        المحتوى المرجعي:
        {relevant_content}

        متطلبات الكتابة:
        1. ابدأ بمقدمة جذابة للفصل
        2. طور كل نقطة رئيسية بشكل مفصل
        3. استخدم أمثلة وتشبيهات عندما يكون مناسباً
        4. اجعل الأسلوب {writing_style} وسهل القراءة
        5. اربط الأفكار بشكل منطقي
        6. اختتم الفصل بخلاصة مرتبطة بالفصل التالي

        اكتب الفصل كاملاً الآن.
        """
        
        try:
            chapter_content = await gemini_service.generate_content(chapter_prompt)
            
            return {
                "chapter_number": chapter_info.get('chapter_number', 1),
                "chapter_title": chapter_info.get('title', 'فصل جديد'),
                "chapter_content": chapter_content,
                "word_count": len(chapter_content.split()),
                "writing_style": writing_style,
                "status": "success"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def process_video_to_book(self, raw_transcript: str, writing_style: str = "روائي") -> Dict[str, Any]:
        """Complete pipeline: Process video transcript to full book"""
        
        try:
            # Step 1: Clean transcript
            cleaning_result = await self.clean_transcript(raw_transcript)
            if cleaning_result["status"] != "success":
                return cleaning_result
            
            cleaned_text = cleaning_result["cleaned_text"]
            
            # Step 2: Extract key points
            key_points_result = await self.extract_key_points(cleaned_text)
            if key_points_result["status"] != "success":
                return key_points_result
            
            # Step 3: Generate book outline
            outline_result = await self.generate_book_outline(key_points_result)
            if outline_result["status"] != "success":
                return outline_result
            
            # Step 4: Write chapters (مبسط لأول 3 فصول كمثال)
            chapters = []
            for i in range(1, 4):  # Write first 3 chapters as example
                chapter_info = {
                    "chapter_number": i,
                    "title": f"الفصل {i}",
                    "purpose": f"تطوير النقاط الرئيسية للقسم {i}",
                    "key_points": [f"نقطة رئيسية {i}"],
                    "estimated_words": 2000
                }
                
                chapter_result = await self.write_chapter(
                    chapter_info, 
                    cleaned_text[:1000],  # استخدام جزء من النص
                    writing_style
                )
                
                if chapter_result["status"] == "success":
                    chapters.append(chapter_result)
                
                # إضافة تأخير بسيط لتجنب تجاوز حدود API
                await asyncio.sleep(1)
            
            return {
                "status": "success",
                "cleaning_result": cleaning_result,
                "key_points": key_points_result,
                "book_outline": outline_result,
                "chapters": chapters,
                "total_chapters_written": len(chapters),
                "total_words": sum(chapter.get("word_count", 0) for chapter in chapters)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "step": "complete_pipeline"
            }

# إنشاء instance واحد للاستخدام
video_processing_service = VideoProcessingService()
