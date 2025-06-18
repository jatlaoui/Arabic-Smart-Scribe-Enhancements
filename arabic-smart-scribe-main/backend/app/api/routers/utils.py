from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

from ...services.gemini_service import GeminiService # Assuming direct import

router = APIRouter(
    prefix="/api/utils",
    tags=["utilities"],
    responses={500: {"description": "Internal Server Error"}},
)

# Dependency for GeminiService (similar to how it was done in arbitrator.py)
def get_gemini_service_dependency():
    return GeminiService()

@router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

class LLMModelInfo(BaseModel):
    model_id: str
    description: Optional[str] = None
    provider: Optional[str] = None
    # Add other relevant fields like capabilities, context_window, etc. later if needed

@router.get("/llm/models", response_model=List[LLMModelInfo])
async def get_llm_models_info():
    # Hardcoded list for now, mirroring Flask's possible AVAILABLE_MODELS
    # This can be expanded or made dynamic later
    return [
        {"model_id": "gemini-pro", "description": "Default versatile model (Gemini Pro)", "provider": "Google"},
        {"model_id": "gemini-1.5-pro-latest", "description": "Latest Gemini Pro model", "provider": "Google"},
        {"model_id": "gemini-pro-vision", "description": "Multimodal model (Vision)", "provider": "Google"},
        # Add other models if the GeminiService wrapper supports them or if other LLMs are integrated
    ]

class LLMTestResponse(BaseModel):
    success: bool
    response: Optional[Any] = None
    error: Optional[str] = None

@router.post("/llm/test", response_model=LLMTestResponse)
async def test_llm_connection(
    gemini_service: GeminiService = Depends(get_gemini_service_dependency)
):
    try:
        # A simple prompt to test basic LLM functionality
        test_prompt = "مرحبا، كيف حالك اليوم؟ يرجى الرد باللغة العربية." # "Hello, how are you today? Please respond in Arabic."
        llm_response = await gemini_service.generate_content(test_prompt)
        return LLMTestResponse(success=True, response=llm_response)
    except Exception as e:
        # Log the exception e
        return LLMTestResponse(success=False, error=str(e))
