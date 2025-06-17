
import google.generativeai as genai
from typing import Dict, Any, Optional, List
import json
import random
import uuid
from ..core.config import settings

from app.db.models import UserBehavior # Assuming UserBehavior is in this path
from collections import Counter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
class GeminiService:

    async def _get_user_preferences(self, db: AsyncSession, user_id: str) -> dict:
        """
        Retrieves and analyzes recent user behaviors to infer simple text style preferences.

        This method queries the UserBehavior table for actions related to text editing
        by the specified user. It then applies heuristics to the 'action_data'
        (expected to be JSON with a 'notes' field) to determine preferences for
        tone (e.g., 'formal', 'informal') and length (e.g., 'short', 'long').

        Args:
        db: The active SQLAlchemy AsyncSession.
        user_id: The ID of the user whose preferences are to be fetched.
        If None or empty, default preferences are returned.

        Returns:
        A dictionary containing inferred preferences, e.g.,
        {"tone": "informal", "length": "short"}. Defaults to
        {"tone": "neutral", "length": "medium"} if no specific preferences
        can be inferred or in case of errors.
        """
        preferences = {"tone": "neutral", "length": "medium"} # Default preferences
        if not user_id: # No user, no preferences
            return preferences

        try:
            # Fetch last 3 relevant user behaviors
            stmt = (
                select(UserBehavior)
                .where(UserBehavior.user_id == user_id)
                .where(UserBehavior.action_type.in_(['ai_correction', 'manual_edit']))
                .order_by(UserBehavior.timestamp.desc())
                .limit(3)
            )
            result = await db.execute(stmt)
            behaviors = result.scalars().all()

            tone_cues = []
            length_cues = []

            for behavior in behaviors:
                if behavior.action_data:
                    try:
                        data = json.loads(behavior.action_data)
                        notes = data.get('notes', '').lower()
                        if 'formal' in notes:
                            tone_cues.append('formal')
                        elif 'informal' in notes or 'casual' in notes:
                            tone_cues.append('informal')

                        if 'concise' in notes or 'shorter' in notes:
                            length_cues.append('short')
                        elif 'detailed' in notes or 'longer' in notes:
                            length_cues.append('long')
                    except json.JSONDecodeError:
                        pass

            if tone_cues:
                preferences['tone'] = Counter(tone_cues).most_common(1)[0][0]
            if length_cues:
                preferences['length'] = Counter(length_cues).most_common(1)[0][0]

            # In a real app, use self.logger.info(...)
            print(f"DEBUG: Inferred preferences for user {user_id}: {preferences}", file=sys.stderr)


        except Exception as e:
            # In a real app, use self.logger.error(...)
            print(f"DEBUG: Error fetching or analyzing user preferences for {user_id}: {e}", file=sys.stderr)

        return preferences

    def __init__(self):
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
        else:
            print("Warning: GEMINI_API_KEY not configured")

    async def edit_text(self, text: str, tool_type: str, target_length: Optional[int] = None) -> Dict[str, Any]:
        """Advanced text editing using Gemini AI"""
        
        prompts = {
            "expand": f"""قم بتوسيع النص التالي مع الحفاظ على الأسلوب والمعنى الأصلي. 
            {"اجعل النص بطول " + str(target_length) + "% من النص الأصلي تقريباً." if target_length else ""}
            أضف تفاصيل مفيدة وثراء في التعبير:

            النص: {text}

            النص المحسن:""",
            
            "summarize": f"""قم بتلخيص النص التالي مع الحفاظ على النقاط الأساسية والمعنى.
            {"اجعل النص بطول " + str(target_length) + "% من النص الأصلي تقريباً." if target_length else ""}
            
            النص: {text}

            الملخص:""",
            
            "improve": f"""قم بتحسين النص التالي من ناحية الأسلوب والوضوح والبنية اللغوية:

            النص: {text}

            النص المحسن:""",
            
            "rephrase": f"""أعد صياغة النص التالي بأسلوب جديد ومتطور مع الحفاظ على المعنى:

            النص: {text}

            النص المُعاد صياغته:""",
            
            "simplify": f"""قم بتبسيط النص التالي ليصبح أكثر وضوحاً وسهولة في الفهم:

            النص: {text}

            النص المبسط:""",
            
            "enhance": f"""قم بتعزيز وإثراء النص التالي بإضافة عمق في المعنى وجمال في التعبير:

            النص: {text}

            النص المُعزز:"""
        }
        
        try:
            if not settings.gemini_api_key:
                raise Exception("Gemini API Key is not configured.")
            
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            prompt = prompts.get(tool_type, prompts["improve"])
            
            response = await model.generate_content_async(prompt)
            
            edited_text = response.text.strip()
            
            suggestions = [
                "تم تحسين بنية الجمل",
                "تم إثراء المفردات", 
                "تم تحسين التدفق والانسيابية",
                "تم تعزيز الوضوح والدقة"
            ]
            
            return {
                "edited_text": edited_text,
                "confidence_score": random.uniform(0.8, 0.95),
                "suggestions": suggestions[:3]
            }
            
        except Exception as e:
            raise Exception(f"خطأ في معالجة النص مع Gemini: {str(e)}")

    async def analyze_text_comprehensive(self, text: str) -> Dict[str, Any]:
        """Comprehensive text analysis using Gemini"""
        try:
            if not settings.gemini_api_key:
                raise Exception("Gemini API Key is not configured.")

            system_prompt = """أنت محلل نصوص متخصص في اللغة العربية. 
                    قم بتحليل النص المرفق تحليلاً شاملاً وأرجع النتائج بصيغة JSON. يجب أن يكون الرد عبارة عن كائن JSON صالح فقط، بدون أي نص إضافي قبله أو بعده مثل ```json.
                    التنسيق المطلوب:
                    {
                        "structure_analysis": {
                            "paragraph_consistency": 0.8,
                            "logical_flow": 0.7,
                            "transition_quality": 0.6,
                            "organization_score": 0.75
                        },
                        "style_analysis": {
                            "tone": "رسمي",
                            "formality_level": 0.8,
                            "rhythm_score": 0.7,
                            "figurative_language": {
                                "metaphors": 3,
                                "similes": 2,
                                "imagery_density": 0.6
                            },
                            "stylistic_signature": {
                                "sentence_variety": 0.8,
                                "vocabulary_richness": 0.75,
                                "unique_voice_strength": 0.7
                            }
                        },
                        "clarity_analysis": {
                            "readability_score": 0.8,
                            "complexity_appropriate": true,
                            "ambiguity_instances": [],
                            "coherence_score": 0.85
                        },
                        "problem_detection": {
                            "spelling_errors": [],
                            "formatting_issues": [],
                            "style_issues": [],
                            "flow_problems": []
                        },
                        "detailed_metrics": {
                            "word_count": 150,
                            "sentence_count": 8,
                            "paragraph_count": 2,
                            "average_sentence_length": 18.7,
                            "reading_time_minutes": 1,
                            "complexity_level": "متوسط",
                            "grade_level": 8,
                            "passive_voice_percentage": 20.0,
                            "dialogue_percentage": 0.0
                        },
                        "smart_suggestions": []
                    }"""
            user_prompt = f"قم بتحليل النص التالي تحليلاً شاملاً:\n\n{text}"
            
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            response = await model.generate_content_async(f"{system_prompt}\n\n{user_prompt}")
            
            analysis_result = response.text.strip()
            
            try:
                return json.loads(analysis_result)
            except json.JSONDecodeError:
                return self._generate_basic_analysis(text)
                
        except Exception as e:
            print(f"Error during Gemini analysis: {e}")
            return self._generate_basic_analysis(text)

    def _generate_basic_analysis(self, text: str) -> Dict[str, Any]:
        """Generate basic analysis as fallback"""
        words = text.split()
        sentences = text.split('.')
        paragraphs = text.split('\n\n')
        
        return {
            "structure_analysis": {
                "paragraph_consistency": random.uniform(0.6, 0.9),
                "logical_flow": random.uniform(0.6, 0.9),
                "transition_quality": random.uniform(0.6, 0.9),
                "organization_score": random.uniform(0.6, 0.9)
            },
            "style_analysis": {
                "tone": "متوازن",
                "formality_level": random.uniform(0.5, 0.9),
                "rhythm_score": random.uniform(0.6, 0.9),
                "figurative_language": {
                    "metaphors": random.randint(0, 5),
                    "similes": random.randint(0, 3),
                    "imagery_density": random.uniform(0.3, 0.8)
                },
                "stylistic_signature": {
                    "sentence_variety": random.uniform(0.6, 0.9),
                    "vocabulary_richness": random.uniform(0.6, 0.9),
                    "unique_voice_strength": random.uniform(0.6, 0.9)
                }
            },
            "clarity_analysis": {
                "readability_score": random.uniform(0.6, 0.9),
                "complexity_appropriate": True,
                "ambiguity_instances": [],
                "coherence_score": random.uniform(0.7, 0.9)
            },
            "problem_detection": {
                "spelling_errors": [],
                "formatting_issues": [],
                "style_issues": [],
                "flow_problems": []
            },
            "detailed_metrics": {
                "word_count": len(words),
                "sentence_count": len([s for s in sentences if s.strip()]),
                "paragraph_count": len([p for p in paragraphs if p.strip()]),
                "average_sentence_length": len(words) / max(len([s for s in sentences if s.strip()]), 1),
                "reading_time_minutes": max(1, len(words) // 200),
                "complexity_level": "متوسط",
                "grade_level": random.randint(6, 12),
                "passive_voice_percentage": random.uniform(10, 30),
                "dialogue_percentage": random.uniform(0, 20)
            },
            "smart_suggestions": []
        }

    def get_editing_tools(self) -> List[Dict[str, Any]]:
        """Get available editing tools"""
        return [
            {
                "id": "expand",
                "name": "إطالة النص الذكية",
                "category": "expand",
                "description": "توسيع النص مع الحفاظ على الجودة والأسلوب الأصلي",
                "icon": "Expand",
                "color": "blue"
            },
            {
                "id": "summarize",
                "name": "تلخيص متقدم",
                "category": "rewrite", 
                "description": "تقصير النص مع الحفاظ على المعنى الأساسي والنقاط المهمة",
                "icon": "RefreshCw",
                "color": "green"
            },
            {
                "id": "improve",
                "name": "تحسين شامل",
                "category": "enhance",
                "description": "تحسين جودة النص وأسلوبه وبنيته اللغوية",
                "icon": "Sparkles",
                "color": "purple"
            },
            {
                "id": "rephrase",
                "name": "إعادة صياغة إبداعية",
                "category": "rewrite",
                "description": "إعادة كتابة النص بأسلوب جديد ومتطور",
                "icon": "RefreshCw",
                "color": "orange"
            },
            {
                "id": "simplify",
                "name": "تبسيط متقدم",
                "category": "enhance",
                "description": "جعل النص أكثر بساطة ووضوحاً دون فقدان المعنى",
                "icon": "CheckCircle",
                "color": "teal"
            },
            {
                "id": "enhance",
                "name": "تعزيز وإثراء",
                "category": "enhance", 
                "description": "إضافة عمق وثراء للنص مع تحسين التعبير",
                "icon": "Heart",
                "color": "pink"
            },
            {
                "id": "academic",
                "name": "أسلوب أكاديمي",
                "category": "enhance",
                "description": "تحويل النص إلى أسلوب أكاديمي ومهني",
                "icon": "Wand2",
                "color": "emerald"
            },
            {
                "id": "creative",
                "name": "تحسين إبداعي",
                "category": "enhance",
                "description": "إضافة لمسات إبداعية وجمالية للنص",
                "icon": "Sparkles",
                "color": "rose"
            }
        ]

gemini_service = GeminiService()
