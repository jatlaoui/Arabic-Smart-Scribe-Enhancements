from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.gemini_service import GeminiService
from app.models.text_session import TextSession
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import uuid

router = APIRouter()

class ShahidAnalysisRequest(BaseModel):
    text: str
    project_id: Optional[str] = None
    analysis_type: str = "comprehensive"

class ShahidEvent(BaseModel):
    event_id: str
    description: str
    timestamp: str
    participants: List[str]
    location: Optional[str]
    significance: str
    evidence_type: str

class ShahidCharacter(BaseModel):
    character_id: str
    name: str
    role: str
    description: str
    credibility_score: float
    relationships: List[Dict[str, str]]

class ShahidClaim(BaseModel):
    claim_id: str
    content: str
    source: str
    verification_status: str
    evidence_strength: float
    contradictions: List[str]

class ShahidAnalysisResult(BaseModel):
    analysis_id: str
    events: List[ShahidEvent]
    characters: List[ShahidCharacter]
    claims: List[ShahidClaim]
    timeline: List[Dict[str, Any]]
    relationships: List[Dict[str, Any]]
    summary: str
    confidence_score: float

@router.post("/analyze-shahid", response_model=ShahidAnalysisResult)
async def analyze_shahid_content(
    request: ShahidAnalysisRequest,
    db: Session = Depends(get_db)
):
    """Advanced Shahid analysis using Gemini AI"""
    try:
        gemini_service = GeminiService()
        
        # Create comprehensive analysis prompt
        analysis_prompt = f"""
        قم بتحليل النص التالي كشاهد أو مراقب للأحداث وفقاً لمنهجية "الشاهد" العلمية:
        
        المطلوب تحليله:
        1. الأحداث: استخرج جميع الأحداث المذكورة مع التوقيتات والمواقع
        2. الشخصيات: حدد الأشخاص المذكورين وأدوارهم ومصداقيتهم
        3. الادعاءات: اجمع جميع الادعاءات والمزاعم وقيم قوة الأدلة
        4. العلاقات: حلل العلاقات بين الشخصيات والأحداث
        5. الخط الزمني: رتب الأحداث زمنياً
        6. التحقق: قيم مصداقية المعلومات ووجود تناقضات
        
        أرجع النتيجة في صيغة JSON بالتنسيق التالي:
        {{
            "events": [
                {{
                    "event_id": "معرف فريد",
                    "description": "وصف الحدث",
                    "timestamp": "التوقيت أو التاريخ",
                    "participants": ["قائمة المشاركين"],
                    "location": "المكان",
                    "significance": "أهمية الحدث",
                    "evidence_type": "نوع الدليل"
                }}
            ],
            "characters": [
                {{
                    "character_id": "معرف فريد",
                    "name": "الاسم",
                    "role": "الدور",
                    "description": "الوصف",
                    "credibility_score": 0.8,
                    "relationships": [
                        {{
                            "target": "شخص آخر",
                            "type": "نوع العلاقة",
                            "strength": "قوة العلاقة"
                        }}
                    ]
                }}
            ],
            "claims": [
                {{
                    "claim_id": "معرف فريد",
                    "content": "محتوى الادعاء",
                    "source": "المصدر",
                    "verification_status": "محقق/غير محقق/مشكوك",
                    "evidence_strength": 0.7,
                    "contradictions": ["قائمة التناقضات"]
                }}
            ],
            "timeline": [
                {{
                    "timestamp": "التوقيت",
                    "event_id": "معرف الحدث",
                    "description": "وصف مختصر"
                }}
            ],
            "relationships": [
                {{
                    "from": "شخص أو حدث",
                    "to": "شخص أو حدث آخر",
                    "type": "نوع العلاقة",
                    "strength": 0.8,
                    "evidence": "الدليل على العلاقة"
                }}
            ],
            "summary": "ملخص شامل للتحليل",
            "confidence_score": 0.85
        }}
        
        النص المراد تحليله:
        {request.text}
        """
        
        # Get analysis from Gemini
        analysis_response = gemini_service.generate_content(analysis_prompt)
        
        # Parse JSON response
        try:
            analysis_data = json.loads(analysis_response)
        except json.JSONDecodeError:
            # Fallback: extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', analysis_response, re.DOTALL)
            if json_match:
                analysis_data = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse analysis JSON")
        
        # Create analysis result
        analysis_id = str(uuid.uuid4())
        
        # Store in database if project_id provided
        if request.project_id:
            # Save analysis to database
            # (Implementation depends on your database schema)
            pass
        
        return ShahidAnalysisResult(
            analysis_id=analysis_id,
            events=[ShahidEvent(**event) for event in analysis_data.get('events', [])],
            characters=[ShahidCharacter(**char) for char in analysis_data.get('characters', [])],
            claims=[ShahidClaim(**claim) for claim in analysis_data.get('claims', [])],
            timeline=analysis_data.get('timeline', []),
            relationships=analysis_data.get('relationships', []),
            summary=analysis_data.get('summary', ''),
            confidence_score=analysis_data.get('confidence_score', 0.0)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/shahid-analysis/{analysis_id}")
async def get_shahid_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieve stored Shahid analysis"""
    # Implementation to retrieve from database
    pass
