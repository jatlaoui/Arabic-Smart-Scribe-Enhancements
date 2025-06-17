from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from app.services.gemini_service import GeminiService

class SceneRequest(BaseModel):
    scene_type: str  # dialogue, action, reflection, flashback
    main_characters: List[str]
    setting: str
    conflict: str
    emotional_tone: str
    length: str  # short, medium, long
    style_preferences: Dict[str, Any]

class GeneratedScene(BaseModel):
    content: str
    characters_used: List[str]
    sensory_details_used: List[str]
    metaphors_used: List[str]
    emotional_arc: Dict[str, Any]
    style_analysis: str
    improvement_suggestions: List[str]

class NarrativeConstructor:
    """البناء السردي الآلي المتقدم"""
    
    def __init__(self, knowledge_base, creative_layers):
        self.knowledge_base = knowledge_base
        self.creative_layers = creative_layers
        self.gemini_service = GeminiService()
    
    async def construct_scene(self, request: SceneRequest) -> GeneratedScene:
        """بناء مشهد سردي متكامل"""
        
        # جمع المواد الإبداعية ذات الصلة
        relevant_materials = self._gather_relevant_materials(request)
        
        # بناء الموجه الديناميكي المعقد
        dynamic_prompt = self._build_dynamic_prompt(request, relevant_materials)
        
        # توليد المشهد
        scene_content = await self.gemini_service.generate_content(dynamic_prompt)
        
        # تحليل المشهد المولد
        analysis = await self._analyze_generated_scene(scene_content, request)
        
        return GeneratedScene(
            content=scene_content,
            characters_used=analysis['characters_used'],
            sensory_details_used=analysis['sensory_details_used'],
            metaphors_used=analysis['metaphors_used'],
            emotional_arc=analysis['emotional_arc'],
            style_analysis=analysis['style_analysis'],
            improvement_suggestions=analysis['improvement_suggestions']
        )
    
    def _gather_relevant_materials(self, request: SceneRequest) -> Dict[str, Any]:
        """جمع المواد الإبداعية ذات الصلة"""
        
        materials = {
            'characters': [],
            'setting_details': [],
            'sensory_elements': [],
            'metaphors': [],
            'internal_monologues': [],
            'historical_context': {}
        }
        
        # جمع معلومات الشخصيات
        for char_name in request.main_characters:
            char_data = next((c for c in self.knowledge_base.characters if c.name == char_name), None)
            if char_data:
                materials['characters'].append({
                    'name': char_data.name,
                    'description': char_data.description,
                    'motivations': char_data.motivations,
                    'psychological_profile': char_data.psychological_profile
                })
        
        # جمع تفاصيل المكان
        setting_data = next((p for p in self.knowledge_base.places if p.name == request.setting), None)
        if setting_data:
            materials['setting_details'] = {
                'description': setting_data.description,
                'sensory_details': setting_data.sensory_details,
                'symbolic_meaning': setting_data.symbolic_meaning,
                'historical_significance': setting_data.historical_significance
            }
        
        # اختيار العناصر الحسية المناسبة
        if request.setting in self.creative_layers.get('sensory_details', {}):
            materials['sensory_elements'] = self.creative_layers['sensory_details'][request.setting][:8]
        
        # اختيار الاستعارات المناسبة
        relevant_metaphors = [
            m for m in self.creative_layers.get('metaphors', [])
            if request.emotional_tone in m.usage_context or request.conflict in m.original_concept
        ]
        materials['metaphors'] = relevant_metaphors[:5]
        
        return materials
    
    def _build_dynamic_prompt(self, request: SceneRequest, materials: Dict[str, Any]) -> str:
        """بناء الموجه الديناميكي المعقد"""
        
        prompt = f"""
أنت روائي مبدع ومتخصص في الأدب العربي المعاصر. تتقن فن المزج بين الواقعية التاريخية والعمق النفسي.

مهمتك: كتابة مشهد أدبي غني ومؤثر بأسلوب يجمع بين الرشاقة اللغوية والعمق الإنساني.

## معطيات المشهد:

**النوع:** {request.scene_type}
**الشخصيات الرئيسية:** {', '.join(request.main_characters)}
**المكان:** {request.setting}
**الصراع المحوري:** {request.conflict}
**النبرة العاطفية:** {request.emotional_tone}
**الطول المطلوب:** {request.length}

## الشخصيات المتاحة:
"""
        
        # إضافة معلومات الشخصيات
        for char in materials['characters']:
            prompt += f"""
**{char['name']}:**
- الوصف: {char['description']}
- الدوافع: {', '.join(char['motivations'])}
- النمط النفسي: {char['psychological_profile']}
"""
        
        # إضافة تفاصيل المكان
        if materials['setting_details']:
            prompt += f"""
## المكان:
**{request.setting}:**
- الوصف: {materials['setting_details']['description']}
- الأهمية التاريخية: {materials['setting_details']['historical_significance']}
- المعنى الرمزي: {materials['setting_details']['symbolic_meaning']}
"""
        
        # إضافة العناصر الحسية
        if materials['sensory_elements']:
            prompt += f"""
## العناصر الحسية المتاحة (اختر منها ما يناسب):
{chr(10).join([f'- {element}' for element in materials['sensory_elements'][:5]])}
"""
        
        # إضافة الاستعارات
        if materials['metaphors']:
            prompt += f"""
## الاستعارات المتاحة (استخدمها بذكاء):
{chr(10).join([f'- "{metaphor.metaphor_text}" - {metaphor.symbolic_meaning}' for metaphor in materials['metaphors'][:3]])}
"""
        
        # إضافة التوجيهات الفنية
        prompt += f"""
## المطلوب:
اكتب مشهداً لا يقل عن 400 كلمة، يحقق التالي:

1. **البناء الدرامي:**
   - ابدأ بوصف الأجواء والمكان
   - طور الصراع تدريجياً
   - اجعل الحوار طبيعياً ومعبراً

2. **العمق النفسي:**
   - أظهر الصراعات الداخلية للشخصيات
   - استخدم الحوار الداخلي بحكمة
   - اعكس تأثير الأحداث على نفسية الشخصيات

3. **الثراء اللغوي:**
   - استخدم العناصر الحسية لإحياء المشهد
   - ادمج الاستعارات بطريقة طبيعية
   - اجعل اللغة شاعرية دون مبالغة

4. **السياق التاريخي:**
   - اربط الأحداث بسياقها التاريخي
   - أظهر تأثير الظروف الاجتماعية على الشخصيات

**الأسلوب المطلوب:** مزج بين الواقعية والشاعرية، لغة عربية معاصرة وجميلة، عمق إنساني.

ابدأ المشهد الآن:
"""
        
        return prompt
    
    async def _analyze_generated_scene(self, scene_content: str, request: SceneRequest) -> Dict[str, Any]:
        """تحليل المشهد المولد"""
        
        analysis_prompt = f"""
        حلل المشهد التالي وقدم تقييماً مفصلاً:
        
        المشهد:
        {scene_content}
        
        المطلوب:
        1. الشخصيات المستخدمة فعلياً
        2. العناصر الحسية المستخدمة
        3. الاستعارات المستخدمة
        4. تحليل القوس العاطفي
        5. تقييم الأسلوب الأدبي
        6. اقتراحات للتحسين
        
        أرجع النتيجة في صيغة JSON مفصلة.
        """
        
        response = await self.gemini_service.generate_content(analysis_prompt)
        # معالجة وإرجاع التحليل
        
        return {
            'characters_used': [],
            'sensory_details_used': [],
            'metaphors_used': [],
            'emotional_arc': {},
            'style_analysis': '',
            'improvement_suggestions': []
        }
