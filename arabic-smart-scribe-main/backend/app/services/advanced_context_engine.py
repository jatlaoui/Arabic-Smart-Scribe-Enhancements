import logging

from app.schemas.common_types import TextChunkWithContext
from markdown_it import MarkdownIt
from typing import List, Dict, Any, Optional

from pydantic import BaseModel
import json
import uuid
from datetime import datetime
from app.services.gemini_service import GeminiService
from app.services.web_search_service import WebSearchService

logger = logging.getLogger(__name__)

class Entity(BaseModel):
    id: str
    name: str
    type: str  # person, place, event, concept, claim
    description: str
    importance_score: float
    context: Dict[str, Any]

class Event(BaseModel):
    id: str
    description: str
    timestamp: Optional[str]
    location: Optional[str]
    participants: List[str]
    cause: Optional[str]
    consequence: Optional[str]
    symbolic_importance: str
    evidence_type: str
    emotional_impact: float

class Character(BaseModel):
    id: str
    name: str
    role: str
    description: str
    motivations: List[str]
    relationships: List[Dict[str, Any]]
    psychological_profile: str
    historical_context: str
    credibility_score: float

class Place(BaseModel):
    id: str
    name: str
    description: str
    historical_significance: str
    sensory_details: List[str]
    symbolic_meaning: str
    time_period: str

class Claim(BaseModel):
    id: str
    content: str
    source: str
    verification_status: str
    evidence_strength: float
    contradictions: List[str]
    context: str
    ideological_position: str

class EmotionalArc(BaseModel):
    points: List[Dict[str, Any]]
    overall_tone: str
    dominant_emotions: List[str]
    emotional_transitions: List[Dict[str, Any]]
    climax_point: Optional[int]

class RelationshipGraph(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    clusters: List[List[str]]
    central_figures: List[str]

class KnowledgeBase(BaseModel):
    id: str
    source_text: str
    entities: List[Entity]
    events: List[Event]
    characters: List[Character]
    places: List[Place]
    claims: List[Claim]
    emotional_arc: EmotionalArc
    relationship_graph: RelationshipGraph
    historical_context: Dict[str, Any]
    themes: List[str]
    conflicts: List[str]
    narrative_potential: float

class AdvancedContextEngine:
    """محرك التحليل المعماري المتقدم"""
    
    def __init__(self):
        self.gemini_service = GeminiService()
        self.web_search_service = WebSearchService()
    
    async def analyze_text(self, text: str, external_sources: List[str] = None) -> KnowledgeBase:
        """التحليل الشامل للنص وبناء قاعدة المعرفة"""
        
        # استخراج الكيانات المتقدم
        entities = await self._extract_advanced_entities(text)
        
        # تحليل الأحداث مع السببية والنتائج
        events = await self._analyze_events_with_causality(text, entities)
        
        # تحليل الشخصيات النفسي والتاريخي
        characters = await self._analyze_characters_psychological(text, entities)
        
        # تحليل الأماكن مع التفاصيل الحسية
        places = await self._analyze_places_with_sensory_details(text, entities)
        
        # استخراج وتحليل الادعاءات
        claims = await self._extract_and_verify_claims(text)
        
        # رسم القوس العاطفي
        emotional_arc = await self._map_emotional_arc(text)
        
        # بناء شبكة العلاقات
        relationship_graph = await self._build_relationship_graph(entities, events, characters)
        
        # الإثراء بالسياق الخارجي
        historical_context = await self._enrich_with_external_context(entities, external_sources)
        
        # استخراج الثيمات والصراعات
        themes, conflicts = await self._extract_themes_and_conflicts(text, entities)
        
        # تقييم الإمكانات السردية
        narrative_potential = await self._evaluate_narrative_potential(
            events, characters, places, emotional_arc
        )
        
        return KnowledgeBase(
            id=str(uuid.uuid4()),
            source_text=text,
            entities=entities,
            events=events,
            characters=characters,
            places=places,
            claims=claims,
            emotional_arc=emotional_arc,
            relationship_graph=relationship_graph,
            historical_context=historical_context,
            themes=themes,
            conflicts=conflicts,
            narrative_potential=narrative_potential
        )
    
    async def _extract_advanced_entities(self, text: str) -> List[Entity]:
        """استخراج متقدم للكيانات مع التحليل العميق"""
        
        prompt = f"""
        قم بتحليل النص التالي واستخراج جميع الكيانات مع تحليل عميق لكل منها:
        
        المطلوب لكل كيان:
        1. النوع (شخص، مكان، حدث، مفهوم، ادعاء)
        2. الوصف التفصيلي
        3. الأهمية في السياق (1-10)
        4. السياق التاريخي/الثقافي
        5. الدور في النص
        
        أرجع النتيجة في صيغة JSON:
        {{
            "entities": [
                {{
                    "name": "اسم الكيان",
                    "type": "نوع الكيان",
                    "description": "وصف تفصيلي",
                    "importance_score": 8.5,
                    "context": {{
                        "historical_period": "الفترة التاريخية",
                        "cultural_significance": "الأهمية الثقافية",
                        "role_in_text": "الدور في النص"
                    }}
                }}
            ]
        }}
        
        النص:
        {text}
        """
        
        response = await self.gemini_service.generate_content(prompt)
        data = json.loads(response)
        
        return [
            Entity(
                id=str(uuid.uuid4()),
                name=entity["name"],
                type=entity["type"],
                description=entity["description"],
                importance_score=entity["importance_score"],
                context=entity["context"]
            )
            for entity in data["entities"]
        ]
    
    async def _analyze_events_with_causality(self, text: str, entities: List[Entity]) -> List[Event]:
        """تحليل الأحداث مع السببية والنتائج"""
        
        events_data = [e for e in entities if e.type == "حدث"]
        
        prompt = f"""
        حلل الأحداث التالية من النص مع التركيز على:
        1. السلسلة السببية (السبب → الحدث → النتيجة)
        2. الأهمية الرمزية
        3. التأثير العاطفي
        4. الشخصيات المشاركة
        
        الأحداث المستخرجة: {[e.name for e in events_data]}
        
        النص الأصلي: {text}
        
        أرجع تحليلاً مفصلاً لكل حدث.
        """
        
        response = await self.gemini_service.generate_content(prompt)
        # تحويل الاستجابة إلى كائنات Event
        # ... معالجة الاستجابة وإرجاع قائمة الأحداث
        
        return []  # placeholder
    
    async def _analyze_characters_psychological(self, text: str, entities: List[Entity]) -> List[Character]:
        """تحليل نفسي وتاريخي للشخصيات"""
        
        characters_data = [e for e in entities if e.type == "شخص"]
        
        prompt = f"""
        قم بتحليل نفسي وتاريخي عميق للشخصيات التالية:
        
        لكل شخصية، حدد:
        1. الدوافع النفسية العميقة
        2. الصراعات الداخلية
        3. التطور عبر النص
        4. العلاقات مع الشخصيات الأخرى
        5. السياق التاريخي والاجتماعي
        6. النمط النفسي (مثالي، عملي، متشكك، إلخ)
        
        الشخصيات: {[c.name for c in characters_data]}
        النص: {text}
        """
        
        response = await self.gemini_service.generate_content(prompt)
        # معالجة الاستجابة...
        
        return []  # placeholder
    
    async def _map_emotional_arc(self, text: str) -> EmotionalArc:
        """رسم القوس العاطفي للنص"""
        
        prompt = f"""
        حلل القوس العاطفي للنص التالي:
        
        1. قسم النص إلى نقاط عاطفية رئيسية
        2. حدد كثافة العاطفة لكل نقطة (1-10)
        3. حدد نوع العاطفة (حنين، غضب، خوف، أمل، إلخ)
        4. حدد نقطة الذروة العاطفية
        5. حلل التحولات العاطفية
        
        النص: {text}
        
        أرجع النتيجة في صيغة JSON مع النقاط والتحولات.
        """
        
        response = await self.gemini_service.generate_content(prompt)
        # معالجة الاستجابة...
        
        return EmotionalArc(
            points=[],
            overall_tone="",
            dominant_emotions=[],
            emotional_transitions=[],
            climax_point=None
        )

    def process_markdown_to_chunks(
            self,
            markdown_content: str,
            source_id: str,
        ) -> List[TextChunkWithContext]:
            """
            Parses Markdown content, performs hierarchical chunking based on headers,
            and associates contextual header information with each chunk.
            """
            logger.info(f"Processing Markdown for source_id: {source_id}, length: {len(markdown_content)}")
            chunks: List[TextChunkWithContext] = []
            md = MarkdownIt()
            tokens = md.parse(markdown_content)
            current_headers: List[str] = []
            current_paragraph_texts: List[str] = []

            def create_text_chunk(text_content: str, headers: List[str]):
                if not text_content.strip(): return
                chunks.append(
                    TextChunkWithContext(
                        text_content=text_content.strip(),
                        source_id=source_id,
                        context_metadata={"source_type": "pdf_markdown_paragraph", "headers": headers.copy()}
                    )
                )
                current_paragraph_texts.clear()

            active_heading_text = ""
            for i, token in enumerate(tokens):
                if token.type == "heading_open":
                    create_text_chunk(" ".join(current_paragraph_texts), current_headers)
                    header_level = int(token.tag[1:])
                    while len(current_headers) >= header_level: current_headers.pop()
                    active_heading_text = ""
                elif token.type == "text" and i > 0 and tokens[i-1].type == "heading_open":
                    active_heading_text = token.content.strip()
                elif token.type == "heading_close":
                    if active_heading_text: current_headers.append(active_heading_text); active_heading_text = ""
                elif token.type == "paragraph_open":
                    create_text_chunk(" ".join(current_paragraph_texts), current_headers)
                elif token.type == "text": current_paragraph_texts.append(token.content)
                elif token.type == "paragraph_close":
                    create_text_chunk(" ".join(current_paragraph_texts), current_headers)
            create_text_chunk(" ".join(current_paragraph_texts), current_headers)
            logger.info(f"Processed Markdown for source_id: {source_id} into {len(chunks)} chunks.")
            return chunks
