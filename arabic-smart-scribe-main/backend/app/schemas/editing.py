
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EditingRequest(BaseModel):
    text: str
    tool_type: str
    context: Optional[str] = None
    target_length: Optional[int] = None

class EditingResponse(BaseModel):
    original_text: str
    edited_text: str
    tool_used: str
    processing_time: float
    confidence_score: float
    suggestions: List[str]

class EditingTool(BaseModel):
    id: str
    name: str
    category: str
    description: str
    icon: str
    color: str

class TextAnalysisRequest(BaseModel):
    text: str
    analysis_type: Optional[str] = "comprehensive"
    include_suggestions: Optional[bool] = True

class SmartSuggestionsRequest(BaseModel):
    content: str
    selected_text: Optional[str] = None
    suggestion_types: List[str] = ["context", "vocabulary", "flow", "content"]
    max_suggestions: Optional[int] = 10


# Schemas for Comprehensive Text Analysis (ported from Flask app logic)

class IssueHighlight(BaseModel):
    id: str
    start: int
    end: int
    text: str
    type: str  # e.g., 'repetition', 'unclear', 'grammar'
    severity: str  # e.g., 'low', 'medium', 'high'
    message: str
    suggestion: Optional[str] = None

class TextMetrics(BaseModel):
    word_count: int
    sentence_count: int
    paragraph_count: int
    # avg_sentence_length: Optional[float] = None # Will be part of ReadabilityScores or calculated if needed
    # vocabulary_diversity: Optional[float] = None # Will be part of StyleAnalysis or calculated if needed

class ReadabilityScores(BaseModel):
    # Example: Flesch-Kincaid, Gunning Fog, or custom scores
    # Based on Flask app's perform_text_analysis -> statistics -> readabilityScore
    overall_readability_score: float # This was `readabilityScore` in Flask
    # avg_sentence_length can be added here if desired
    # avg_word_length can be added here if desired

class StyleAnalysis(BaseModel):
    # Based on Flask app's perform_text_analysis -> statistics
    sentiment_score: float
    style_score: float # General style score from Flask app
    complexity_level: str # e.g., 'بسيط', 'متوسط', 'متقدم'
    # vocabulary_diversity can be added here
    # tone: Optional[str] = None # Not explicitly in Flask simple functions

class OverallQualityScore(BaseModel):
    # Based on Flask app's perform_text_analysis -> overallScore
    overall_score: float
    # Could add sub-scores for different aspects if they become available
    # e.g., grammar_score: float, coherence_score: float

class Suggestion(BaseModel): # More structured suggestion
    id: str
    type: str # e.g., 'correct', 'improve_clarity', 'enhance_vocabulary'
    title: str
    description: str
    icon: Optional[str] = None
    action: Optional[str] = None # e.g., 'fix_all_issues', 'apply_suggestion_id_x'
    confidence: Optional[float] = None
    reasoning: Optional[str] = None


class ComprehensiveTextAnalysisResponse(BaseModel):
    metrics: TextMetrics
    readability: ReadabilityScores
    style: StyleAnalysis
    quality: OverallQualityScore
    issues: List[IssueHighlight]
    suggestions: List[Suggestion] # Using the new structured Suggestion
    raw_text_summary: Optional[str] = None # Not directly in simple Flask funcs, but good to have
