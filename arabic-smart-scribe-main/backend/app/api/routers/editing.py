
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from ...schemas.editing import (
    EditingRequest, 
    EditingResponse, 
    EditingTool, 
    TextAnalysisRequest,
    SmartSuggestionsRequest,
    ComprehensiveTextAnalysisResponse # Added
)
# from ...services.gemini_service import gemini_service # Commented out for this endpoint
from ...services.editing_service import editing_service
from ...services.text_analysis_service import TextAnalysisService # Added
from ..dependencies import get_db

router = APIRouter(prefix="/api", tags=["editing"])

@router.get("/editing-tools")
async def get_editing_tools():
    """Get available editing tools"""
    tools = gemini_service.get_editing_tools()
    return {"tools": tools}

@router.post("/edit-text", response_model=EditingResponse)
async def edit_text(
    request: EditingRequest,
    db: Session = Depends(get_db)
):
    """Edit text using AI with advanced capabilities"""
    start_time = datetime.now()
    
    try:
        result = await gemini_service.edit_text(
            request.text, 
            request.tool_type,
            request.target_length
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Store editing session
        editing_service.create_editing_session(
            db=db,
            original_text=request.text,
            edited_text=result["edited_text"],
            edit_type=request.tool_type,
            confidence_score=result["confidence_score"]
        )
        
        return EditingResponse(
            original_text=request.text,
            edited_text=result["edited_text"],
            tool_used=request.tool_type,
            processing_time=processing_time,
            confidence_score=result["confidence_score"],
            suggestions=result["suggestions"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-text-comprehensive", response_model=ComprehensiveTextAnalysisResponse)
async def analyze_text_comprehensive_endpoint( # Renamed function to avoid conflict if old one is kept temporarily
    request: TextAnalysisRequest,
    # db: Session = Depends(get_db) # Not strictly needed for this specific service call
):
    """Comprehensive text analysis using Python-based logic"""
    try:
        analysis_service = TextAnalysisService()
        # The user_profile and analysis_type parameters from the original Flask function signature
        # are not directly passed here. user_profile is not used by the ported basic Python logic.
        # request.analysis_type can be passed if the service evolves to use it.
        analysis_result = analysis_service.analyze_text_comprehensively(
            text=request.text
            # user_profile can be added if auth and profiles are integrated
            # analysis_type=request.analysis_type
        )
        return analysis_result
        
    except Exception as e:
        # Log the exception for debugging
        # import traceback
        # traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error during text analysis: {str(e)}")

@router.post("/generate-smart-suggestions")
async def generate_smart_suggestions(request: SmartSuggestionsRequest):
    """Generate instant smart suggestions"""
    try:
        # Generate contextual suggestions
        suggestions = []
        
        for i, suggestion_type in enumerate(request.suggestion_types):
            if len(suggestions) >= request.max_suggestions:
                break
                
            suggestions.append({
                "id": str(uuid.uuid4()),
                "type": suggestion_type,
                "category": f"تحسين {suggestion_type}",
                "suggestion": f"اقتراح ذكي لتحسين {suggestion_type} في النص",
                "original_text": request.selected_text[:50] if request.selected_text else None,
                "improved_text": f"نص محسن للـ {suggestion_type}" if request.selected_text else None,
                "confidence": 0.85,
                "impact": f"تحسن متوقع في {suggestion_type}",
                "reasoning": f"هذا الاقتراح سيحسن {suggestion_type} من خلال تطبيق تقنيات متقدمة",
                "position": {"start": 0, "end": 50} if request.selected_text else None
            })
        
        response_data = {
            "suggestions": suggestions,
            "context_analysis": {
                "topic": "الموضوع المحدد تلقائياً",
                "audience": "الجمهور المستهدف",
                "tone": "النبرة السائدة",
                "genre": "نوع النص"
            },
            "vocabulary_insights": {
                "complexity_level": 0.7,
                "repetitive_words": ["كلمة", "مكررة"],
                "suggested_alternatives": [
                    {"word": "كلمة", "alternatives": ["مرادف1", "مرادف2", "مرادف3"]}
                ]
            },
            "flow_analysis": {
                "transition_quality": 0.8,
                "paragraph_coherence": 0.7,
                "overall_flow_score": 0.75
            }
        }
        
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
