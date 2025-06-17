from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from app.services.gemini_service import GeminiService
import random

class SensoryDetail(BaseModel):
    type: str  # visual, auditory, olfactory, tactile, gustatory
    description: str
    intensity: float
    emotional_impact: str
    context: str

class Metaphor(BaseModel):
    original_concept: str
    metaphor_text: str
    symbolic_meaning: str
    emotional_resonance: float
    usage_context: str

class InternalMonologue(BaseModel):
    character_id: str
    situation: str
    thought_content: str
    emotional_state: str
    psychological_depth: float

class NarrativeElement(BaseModel):
    type: str  # dialogue, description, action, reflection
    content: str
    style_notes: str
    emotional_tone: str

class CreativeLayerEngine:
    """محرك التوليد الإبداعي للطبقات السردية"""
    
    def __init__(self):
        self.gemini_service = GeminiService()
        
    async def generate_sensory_details(self, places: List[Dict], historical_context: Dict) -> Dict[str, List[SensoryDetail]]:
        """محرك التفاصيل الحسية"""
        
        sensory_details = {}
        
        for place in places:
            prompt = f"""
            أنت كاتب متخصص في الوصف الحسي الغني. مهمتك إنشاء تفاصيل حسية مؤثرة للمكان التالي:
            
            المكان: {place['name']}
            الوصف: {place['description']}
            السياق التاريخي: {historical_context.get('period', 'غير محدد')}
            
            أنشئ 10-15 تفصيل حسي متنوع:
            
            البصرية: الألوان، الضوء، الظلال، الحركة
            السمعية: الأصوات المحيطة، الأصداء، الموسيقى
            الشمية: الروائح المميزة، العطور، الروائح الطبيعية
            اللمسية: ملمس الأسطح، درجة الحرارة، الرطوبة
            التذوقية: (إذا كان مناسباً) الأطعمة، المشروبات
            
            لكل تفصيل، حدد:
            - النوع الحسي
            - الوصف الشاعري
            - قوة التأثير (1-10)
            - التأثير العاطفي
            
            مثال: "رائحة البخور المختلطة بعبق الكتب القديمة تملأ المكان، تحمل معها ذكريات قرون من العلم والتعلم"
            
            أرجع النتيجة في صيغة JSON مع قائمة مفصلة.
            """
            
            response = await self.gemini_service.generate_content(prompt)
            # معالجة الاستجابة وتحويلها إلى SensoryDetail objects
            sensory_details[place['name']] = []  # placeholder
            
        return sensory_details
    
    async def generate_metaphors(self, themes: List[str], conflicts: List[str], cultural_context: Dict) -> List[Metaphor]:
        """محرك الاستعارات والرمزية"""
        
        prompt = f"""
        أنت شاعر وكاتب متخصص في البلاغة العربية. مهمتك إنشاء استعارات قوية ورمزية عميقة.
        
        الثيمات الرئيسية: {', '.join(themes)}
        الصراعات: {', '.join(conflicts)}
        السياق الثقافي: {cultural_context}
        
        أنشئ 20-25 استعارة متنوعة تغطي:
        
        1. استعارات الحرية والاستقلال
        2. استعارات الأرض والوطن
        3. استعارات المقاومة والكفاح
        4. استعارات المعرفة والجهل
        5. استعارات الكرامة والذل
        6. استعارات الوحدة والانقسام
        7. استعارات الماضي والحاضر
        
        لكل استعارة:
        - المفهوم الأصلي
        - النص الاستعاري
        - المعنى الرمزي
        - قوة التأثير العاطفي (1-10)
        - سياق الاستخدام المناسب
        
        أمثلة على الطراز المطلوب:
        "الحرية المنقوصة كالفتات"
        "جذور الأرض أعمق من ذاكرة المستعمر"
        "الكلمة سيف لا يصدأ"
        
        استخدم اللغة العربية الفصحى الجميلة والمعاصرة.
        """
        
        response = await self.gemini_service.generate_content(prompt)
        # معالجة وتحويل إلى Metaphor objects
        
        return []  # placeholder
    
    async def generate_internal_monologues(self, characters: List[Dict], key_events: List[Dict]) -> Dict[str, List[InternalMonologue]]:
        """محرك الحوار الداخلي"""
        
        monologues = {}
        
        for character in characters:
            character_monologues = []
            
            for event in key_events:
                prompt = f"""
                أنت كاتب متخصص في علم النفس والأدب النفسي. مهمتك كتابة حوار داخلي عميق.
                
                الشخصية: {character['name']}
                الوصف: {character['description']}
                الدوافع: {character.get('motivations', [])}
                
                الحدث: {event['description']}
                السياق: {event.get('context', '')}
                
                اكتب حواراً داخلياً يعكس:
                1. الصراع النفسي للشخصية
                2. تأثير الحدث على معتقداتها
                3. الذكريات التي يستدعيها الموقف
                4. التساؤلات الفلسفية والوجودية
                5. المشاعر المتضاربة
                
                الطول: 2-3 جمل عميقة ومؤثرة
                الأسلوب: داخلي، شاعري، فلسفي
                
                مثال: "كيف يمكن لكلمات الإمام عن حرية الفكر أن تتعايش مع صوت الأحذية العسكرية في باحة المسجد؟ هل الحكمة تكمن في المقاومة أم في التأقلم مع المستحيل؟"
                """
                
                response = await self.gemini_service.generate_content(prompt)
                # تحويل إلى InternalMonologue object
                
            monologues[character['name']] = character_monologues
            
        return monologues
