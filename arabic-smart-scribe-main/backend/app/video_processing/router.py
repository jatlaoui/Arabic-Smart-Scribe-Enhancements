
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime

from .schemas import (
    TranscriptCleaningRequest,
    KeyPointsExtractionRequest,
    BookOutlineRequest,
    ChapterWritingRequest,
    VideoToBookRequest
)
from .service import video_processing_service

router = APIRouter(prefix="/api/video-processing", tags=["video-processing"])

@router.post("/clean-transcript")
async def clean_transcript(request: TranscriptCleaningRequest):
    """Clean raw transcript and remove timestamps, filler words"""
    try:
        result = await video_processing_service.clean_transcript(request.raw_transcript)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-key-points")
async def extract_key_points(request: KeyPointsExtractionRequest):
    """Extract and summarize key points from cleaned content"""
    try:
        result = await video_processing_service.extract_key_points(request.cleaned_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-book-outline")
async def generate_book_outline(request: BookOutlineRequest):
    """Generate book outline from key points"""
    try:
        result = await video_processing_service.generate_book_outline(request.key_points)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/write-chapter")
async def write_chapter(request: ChapterWritingRequest):
    """Write individual chapter in narrative style"""
    try:
        result = await video_processing_service.write_chapter(
            request.chapter_info.dict(),
            request.relevant_content,
            request.writing_style
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-video-to-book")
async def process_video_to_book(request: VideoToBookRequest):
    """Complete pipeline: Process video transcript to book"""
    try:
        start_time = datetime.now()
        
        result = await video_processing_service.process_video_to_book(
            request.raw_transcript,
            request.writing_style
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        result["processing_time_seconds"] = processing_time
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
