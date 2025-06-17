
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Union
import logging

logger = logging.getLogger(__name__)

class VideoProcessingError(Exception):
    """Custom exception for video processing errors"""
    def __init__(self, message: str, error_code: str = "VIDEO_PROCESSING_ERROR"):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class GeminiAPIError(Exception):
    """Custom exception for Gemini API errors"""
    def __init__(self, message: str, error_code: str = "GEMINI_API_ERROR"):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class AuthenticationError(Exception):
    """Custom exception for authentication errors"""
    def __init__(self, message: str = "غير مصرح للوصول"):
        self.message = message
        super().__init__(self.message)

class ValidationError(Exception):
    """Custom exception for validation errors"""
    def __init__(self, message: str, field: str = None):
        self.message = message
        self.field = field
        super().__init__(self.message)

async def video_processing_exception_handler(request: Request, exc: VideoProcessingError):
    """Handler for video processing errors"""
    logger.error(f"Video processing error: {exc.message}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.message,
            "error_code": exc.error_code,
            "type": "video_processing_error"
        }
    )

async def gemini_api_exception_handler(request: Request, exc: GeminiAPIError):
    """Handler for Gemini API errors"""
    logger.error(f"Gemini API error: {exc.message}")
    return JSONResponse(
        status_code=503,
        content={
            "detail": exc.message,
            "error_code": exc.error_code,
            "type": "gemini_api_error"
        }
    )

async def authentication_exception_handler(request: Request, exc: AuthenticationError):
    """Handler for authentication errors"""
    return JSONResponse(
        status_code=401,
        content={
            "detail": exc.message,
            "type": "authentication_error"
        }
    )

async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handler for validation errors"""
    return JSONResponse(
        status_code=400,
        content={
            "detail": exc.message,
            "field": exc.field,
            "type": "validation_error"
        }
    )
