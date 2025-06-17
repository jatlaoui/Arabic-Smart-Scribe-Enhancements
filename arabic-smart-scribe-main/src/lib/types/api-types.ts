
// Core API types and interfaces
export interface EditingTool {
  id: string;
  name: string;
  category: 'rewrite' | 'expand' | 'enhance';
  description: string;
  icon: string;
  color: string;
}

export interface EditingRequest {
  text: string;
  tool_type: string;
  context?: string;
  style_profile?: any;
  jatlawi_profile?: any;
  target_length?: number;
}

export interface EditingResponse {
  original_text: string;
  edited_text: string;
  tool_used: string;
  processing_time: number;
  confidence_score: number;
  suggestions: string[];
}

export interface Project {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  word_count: number;
  status: 'draft' | 'in_progress' | 'completed';
  tags: string[];
  style_profile?: any;
}

export interface VideoAnalysisRequest {
  url: string;
  target_language?: string;
  analysis_depth?: 'basic' | 'detailed' | 'comprehensive';
}

export interface VideoAnalysisResponse {
  video_id: string;
  title: string;
  description: string;
  duration: number;
  transcript: string;
  key_topics: string[];
  target_audience: string;
  complexity_level: string;
  recommended_style: any;
}

export interface TranscriptCleaningRequest {
  raw_transcript: string;
}

export interface KeyPointsExtractionRequest {
  cleaned_text: string;
}

export interface BookOutlineRequest {
  key_points: any;
}

export interface ChapterWritingRequest {
  chapter_info: {
    chapter_number: number;
    title: string;
    purpose: string;
    key_points: string[];
    estimated_words: number;
  };
  relevant_content: string;
  writing_style?: string;
}

export interface VideoToBookRequest {
  raw_transcript: string;
  writing_style?: string;
  book_title?: string;
  target_audience?: string;
}
