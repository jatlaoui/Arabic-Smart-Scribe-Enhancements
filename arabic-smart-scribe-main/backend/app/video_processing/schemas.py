
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class TranscriptCleaningRequest(BaseModel):
    raw_transcript: str

class KeyPointsExtractionRequest(BaseModel):
    cleaned_text: str

class BookOutlineRequest(BaseModel):
    key_points: Dict[str, Any]

class ChapterInfo(BaseModel):
    chapter_number: int
    title: str
    purpose: str
    key_points: List[str]
    estimated_words: int

class ChapterWritingRequest(BaseModel):
    chapter_info: ChapterInfo
    relevant_content: str
    writing_style: str = "روائي"

class VideoToBookRequest(BaseModel):
    raw_transcript: str
    writing_style: str = "روائي"
    book_title: Optional[str] = None
    target_audience: Optional[str] = "عام"
