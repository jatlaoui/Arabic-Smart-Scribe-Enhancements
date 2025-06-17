
import google.generativeai as genai
from typing import Dict, Any, List, Optional
import json
import re
from ..core.config import settings

class VideoProcessingService:
    def __init__(self):
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
        else:
            print("Warning: GEMINI_API_KEY not configured")

    async def clean_transcript(self, raw_transcript: str) -> Dict[str, Any]:
        """Step 1: Clean transcript and remove timestamps, filler words"""
        try:
            if not settings.gemini_api_key:
                raise Exception("Gemini API Key is not configured.")

            prompt = f"""قم بتنظيف النص التالي المستخرج من فيديو. اتبع هذه التعليمات:

1. أزل جميع الطوابع الزمنية (مثل: 00:12:34, [0:05])
2. أزل الكلمات الحشو والتكرارات غير المفيدة (مثل: يعني، أه، إم، هذا...)
3. أزل أصوات التفاعل والضحك ([ضحك], [تصفيق])
4. صحح الأخطاء النحوية الواضحة
5. اربط الجمل المقطوعة لتكوين فقرات متماسكة
6. احتفظ بالمعنى الأصلي والمعلومات المهمة

النص الخام:
{raw_transcript}

النص المنظف:"""

            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            response = await model.generate_content_async(prompt)
            
            cleaned_text = response.text.strip()
            
            return {
                "cleaned_text": cleaned_text,
                "original_length": len(raw_transcript.split()),
                "cleaned_length": len(cleaned_text.split()),
                "reduction_percentage": ((len(raw_transcript.split()) - len(cleaned_text.split())) / len(raw_transcript.split())) * 100
            }
            
        except Exception as e:
            raise Exception(f"خطأ في تنظيف النص: {str(e)}")

    async def extract_key_points(self, cleaned_text: str) -> Dict[str, Any]:
        """Step 2: Extract and summarize key points from content"""
        try:
            if not settings.gemini_api_key:
                raise Exception("Gemini API Key is not configured.")

            prompt = f"""حلل النص التالي واستخرج النقاط الرئيسية بشكل منظم:

1. الموضوع الرئيسي والهدف من المحتوى
2. النقاط الأساسية والأفكار المحورية (5-8 نقاط)
3. التفاصيل الداعمة والأمثلة المهمة
4. الشخصيات المذكورة (إن وجدت)
5. الأحداث الزمنية أو التسلسل (إن وجد)
6. الرسائل الرئيسية والخلاصات
7. اقتراحات لعناوين فرعية محتملة

قدم النتيجة بصيغة JSON مع البنية التالية:
{{
  "main_topic": "الموضوع الرئيسي",
  "key_points": ["نقطة 1", "نقطة 2", ...],
  "supporting_details": ["تفصيل 1", "تفصيل 2", ...],
  "characters": ["شخصية 1", "شخصية 2", ...],
  "timeline": ["حدث 1", "حدث 2", ...],
  "main_messages": ["رسالة 1", "رسالة 2", ...],
  "suggested_subtitles": ["عنوان 1", "عنوان 2", ...]
}}

النص: {cleaned_text}"""

            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            response = await model.generate_content_async(prompt)
            
            try:
                result = json.loads(response.text.strip())
                return result
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "main_topic": "موضوع غير محدد",
                    "key_points": ["نقطة رئيسية"],
                    "supporting_details": ["تفاصيل داعمة"],
                    "characters": [],
                    "timeline": [],
                    "main_messages": ["رسالة رئيسية"],
                    "suggested_subtitles": ["عنوان فرعي"]
                }
                
        except Exception as e:
            raise Exception(f"خطأ في استخراج النقاط الرئيسية: {str(e)}")

    async def generate_book_outline(self, key_points: Dict[str, Any]) -> Dict[str, Any]:
        """Step 3: Generate book outline (introduction, chapters, conclusion)"""
        try:
            if not settings.gemini_api_key:
                raise Exception("Gemini API Key is not configured.")

            prompt = f"""بناءً على النقاط الرئيسية التالية، قم بإنشاء مخطط مفصل لكتاب:

النقاط الرئيسية:
{json.dumps(key_points, ensure_ascii=False, indent=2)}

أنشئ مخططاً للكتاب يتضمن:
1. عنوان مقترح للكتاب
2. مقدمة (مع ملخص لما سيغطيه الكتاب)
3. فصول رئيسية (4-8 فصول)
4. خاتمة (مع الخلاصات والتوصيات)

لكل فصل، حدد:
- العنوان
- الهدف من الفصل
- النقاط التي سيغطيها
- العدد المقدر للكلمات

قدم النتيجة بصيغة JSON:
{{
  "book_title": "عنوان الكتاب",
  "introduction": {{
    "title": "المقدمة",
    "purpose": "الهدف من المقدمة",
    "content_summary": "ملخص ما ستغطيه",
    "estimated_words": 500
  }},
  "chapters": [
    {{
      "chapter_number": 1,
      "title": "عنوان الفصل",
      "purpose": "الهدف من الفصل",
      "key_points": ["نقطة 1", "نقطة 2"],
      "estimated_words": 2000
    }}
  ],
  "conclusion": {{
    "title": "الخاتمة",
    "purpose": "الهدف من الخاتمة",
    "content_summary": "الخلاصات والتوصيات",
    "estimated_words": 700
  }},
  "total_estimated_words": 15000
}}"""

            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            response = await model.generate_content_async(prompt)
            
            try:
                result = json.loads(response.text.strip())
                return result
            except json.JSONDecodeError:
                # Fallback outline
                return {
                    "book_title": "كتاب جديد",
                    "introduction": {
                        "title": "المقدمة",
                        "purpose": "تقديم الموضوع",
                        "content_summary": "نظرة عامة على محتوى الكتاب",
                        "estimated_words": 500
                    },
                    "chapters": [
                        {
                            "chapter_number": 1,
                            "title": "الفصل الأول",
                            "purpose": "بداية القصة",
                            "key_points": ["نقطة أساسية"],
                            "estimated_words": 2000
                        }
                    ],
                    "conclusion": {
                        "title": "الخاتمة",
                        "purpose": "خلاصة الأفكار",
                        "content_summary": "الخلاصات النهائية",
                        "estimated_words": 700
                    },
                    "total_estimated_words": 3200
                }
                
        except Exception as e:
            raise Exception(f"خطأ في إنشاء مخطط الكتاب: {str(e)}")

    async def write_chapter(self, 
                          chapter_info: Dict[str, Any], 
                          relevant_content: str, 
                          writing_style: str = "روائي") -> Dict[str, Any]:
        """Step 4: Write individual chapters in narrative style"""
        try:
            if not settings.gemini_api_key:
                raise Exception("Gemini API Key is not configured.")

            prompt = f"""اكتب فصلاً كاملاً بناءً على المعلومات التالية:

معلومات الفصل:
{json.dumps(chapter_info, ensure_ascii=False, indent=2)}

المحتوى ذو الصلة:
{relevant_content}

إرشادات الكتابة:
1. استخدم أسلوباً {writing_style} جذاباً ومتدفقاً
2. حول الكلام المباشر إلى سرد غير مباشر
3. أضف تفاصيل وصفية مناسبة
4. اربط الأحداث بطريقة منطقية ومتسلسلة
5. استخدم لغة عربية فصحى مبسطة
6. اجعل الفصل مناسباً للعدد المقدر من الكلمات
7. ابدأ وانته الفصل بطريقة مناسبة

اكتب الفصل كاملاً:"""

            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            response = await model.generate_content_async(prompt)
            
            chapter_text = response.text.strip()
            word_count = len(chapter_text.split())
            
            return {
                "chapter_number": chapter_info.get("chapter_number", 1),
                "title": chapter_info.get("title", "فصل"),
                "content": chapter_text,
                "word_count": word_count,
                "estimated_words": chapter_info.get("estimated_words", 2000),
                "completion_percentage": min(100, (word_count / chapter_info.get("estimated_words", 2000)) * 100)
            }
            
        except Exception as e:
            raise Exception(f"خطأ في كتابة الفصل: {str(e)}")

    async def process_video_to_book(self, raw_transcript: str, writing_style: str = "روائي") -> Dict[str, Any]:
        """Complete chain: Process video transcript to full book"""
        try:
            # Step 1: Clean transcript
            cleaning_result = await self.clean_transcript(raw_transcript)
            cleaned_text = cleaning_result["cleaned_text"]
            
            # Step 2: Extract key points
            key_points = await self.extract_key_points(cleaned_text)
            
            # Step 3: Generate book outline
            book_outline = await self.generate_book_outline(key_points)
            
            # Step 4: Write chapters (we'll write introduction and first chapter as example)
            chapters = []
            
            # Write introduction
            intro_info = book_outline["introduction"]
            intro_chapter = await self.write_chapter(
                intro_info, 
                cleaned_text[:1000],  # First part of content for intro
                writing_style
            )
            chapters.append(intro_chapter)
            
            # Write first chapter
            if book_outline["chapters"]:
                first_chapter_info = book_outline["chapters"][0]
                first_chapter = await self.write_chapter(
                    first_chapter_info,
                    cleaned_text,
                    writing_style
                )
                chapters.append(first_chapter)
            
            return {
                "processing_steps": {
                    "cleaning": cleaning_result,
                    "key_points": key_points,
                    "outline": book_outline
                },
                "book": {
                    "title": book_outline["book_title"],
                    "chapters": chapters,
                    "full_outline": book_outline,
                    "total_words_written": sum(ch["word_count"] for ch in chapters),
                    "completion_status": "partial"  # Only intro and first chapter written
                }
            }
            
        except Exception as e:
            raise Exception(f"خطأ في معالجة الفيديو إلى كتاب: {str(e)}")

video_processing_service = VideoProcessingService()
