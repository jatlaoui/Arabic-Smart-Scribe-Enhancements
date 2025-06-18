from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any

from ...schemas.arbitrator import (
    ArbitratorRequest,
    ContentEvaluationResponse,
    ContentRefinementResponse
)
from ...services.arbitrator_service import ArbitratorService
from ...services.gemini_service import GeminiService # To inject into ArbitratorService

# A simple way to get the GeminiService instance.
# In a more complex app, this might come from a central DI container or app state.
# For now, direct instantiation or a simple dependency function.
def get_gemini_service():
    # This assumes GeminiService can be instantiated without arguments
    # or that its dependencies are globally available/configured.
    # If GeminiService itself has dependencies, this needs to be more robust.
    return GeminiService()

def get_arbitrator_service(
    gemini_service: GeminiService = Depends(get_gemini_service)
) -> ArbitratorService:
    return ArbitratorService(llm_service=gemini_service)


router = APIRouter(
    prefix="/api/arbitrator",
    tags=["arbitrator"],
    responses={500: {"description": "Internal Server Error"}},
)

@router.post("/evaluate", response_model=ContentEvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_text_content(
    request: ArbitratorRequest,
    arbitrator_service: ArbitratorService = Depends(get_arbitrator_service)
):
    try:
        response = await arbitrator_service.evaluate_content(request)
        return response
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error during evaluation: {str(e)}")

@router.post("/refine", response_model=ContentRefinementResponse, status_code=status.HTTP_200_OK)
async def refine_text_content(
    request: ArbitratorRequest,
    arbitrator_service: ArbitratorService = Depends(get_arbitrator_service)
):
    try:
        response = await arbitrator_service.refine_content(request)
        return response
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error during refinement: {str(e)}")

# Note: The dependency injection for GeminiService is simplified here.
# A production app might use a more sophisticated DI pattern,
# potentially initializing services like GeminiService once at app startup
# and making them available via app.state or a dedicated DI provider.
# For the scope of this task, this direct dependency setup should work.
