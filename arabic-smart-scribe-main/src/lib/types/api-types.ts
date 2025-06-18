
// Core API types and interfaces

// General Editing Tool (can be used by /api/editing-tools if its output matches this)
export interface EditingTool {
  id: string;
  name: string;
  description: string;
  category?: string; // Optional, depending on what /api/editing-tools provides
  // icon and color can be frontend specific or provided by API
  icon?: string;
  color?: string;
}

// For Text Editing
export interface EditTextRequestData {
  text: string;
  tool_type: string; // e.g., 'improve', 'summarize', 'expand' (maps to FastAPI's EditingRequest)
  target_length?: number;
  // context, style_profile, jatlawi_profile could be added if needed
}

export interface EditTextResponseData {
  original_text: string;
  edited_text: string;
  tool_used: string; // Matches tool_type from request
  processing_time: number;
  confidence_score?: number; // FastAPI schema has this
  suggestions?: any[]; // Define a more specific suggestion type if structure is known
}


// Project Types (cleaned up)
export interface Project {
  id: string;
  title: string;
  content: string | null; // Corrected from previous merge
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  word_count?: number; // From model_to_schema helper
  status: string;
  tags: string[];
  description: string | null;
  stage: string | null;
  metadata: Record<string, any> | null;
}

export interface ProjectCreateData {
  title: string;
  content?: string | null;
  description?: string | null;
  // stage and metadata can also be part of creation if ProjectCreate schema in FastAPI allows
  // Based on subtask 1, ProjectCreate inherits from ProjectBase which has stage & metadata.
  // So, let's add them here if the frontend might send them.
  stage?: string | null;
  metadata?: Record<string, any> | null;
  // user_id is not part of ProjectCreateData as it's typically handled by backend/auth
}

export interface ProjectUpdateData {
  title?: string;
  content?: string | null;
  description?: string | null;
  // stage and metadata updates are handled by separate endpoints
}

export interface StageUpdateData {
  stage: string;
}

export interface MetadataUpdateData {
  metadata: Record<string, any>;
}

// Text Analysis Types (align with FastAPI ComprehensiveTextAnalysisResponse)
export interface TextAnalysisRequestData {
  text: string;
  // analysis_type: Optional[str] = "comprehensive" (from FastAPI schema, if needed by client)
}

export interface IssueHighlight {
  id: string; // Added from FastAPI schema
  start: number;
  end: number;
  text: string; // Added from FastAPI schema
  type: string;
  severity: string;
  message: string;
  suggestion?: string;
}

export interface TextMetrics {
  wordCount: number; // Changed to camelCase
  sentenceCount: number; // Changed to camelCase
  paragraphCount: number; // Changed to camelCase
}

export interface ReadabilityScores {
  overallReadabilityScore: number; // Changed to camelCase
}

export interface StyleAnalysis {
  sentimentScore: number; // Changed to camelCase
  styleScore: number; // Changed to camelCase
  complexityLevel: string; // Changed to camelCase
}

export interface OverallQualityScore { // Matches FastAPI schema
  overallScore: number; // Changed to camelCase
}

export interface Suggestion { // Matches FastAPI schema for suggestions
  id: string;
  type: string;
  title: string;
  description: string;
  icon?: string;
  action?: string;
  confidence?: number;
  reasoning?: string;
}

export interface ComprehensiveTextAnalysisResponse {
  metrics: TextMetrics;
  readability: ReadabilityScores;
  style: StyleAnalysis;
  quality: OverallQualityScore; // Added based on FastAPI schema
  issues: IssueHighlight[];
  suggestions: Suggestion[]; // Changed from string[] to structured Suggestion
  rawTextSummary?: string | null; // Changed to camelCase
}

// Smart Suggestions Types
export interface SmartSuggestionsRequestData {
  selectedText: string; // Changed to camelCase
  fullText?: string; // Changed to camelCase
  suggestionTypes: string[]; // Changed to camelCase
  maxSuggestions?: number; // Changed to camelCase
}

export interface SmartSuggestionItem { // Define a more specific type for suggestions
  id: string;
  type: string;
  category: string;
  suggestion: string;
  original_text?: string;
  improved_text?: string;
  confidence: number;
  impact?: string;
  reasoning?: string;
  position?: { start: number; end: number };
}

export interface SmartSuggestionsResponseData {
  // Based on FastAPI placeholder in editing.py router
  suggestions: SmartSuggestionItem[];
  contextAnalysis?: Record<string, any>; // Example field
  vocabularyInsights?: Record<string, any>; // Example field
  flowAnalysis?: Record<string, any>; // Example field
}

// Arbitrator Types
export interface ArbitratorRequestData {
  content: string;
  criteria?: Record<string, any>;
}

export interface EvaluationCriterionResult {
  criterion: string; // Renamed from 'name' to match schema
  score: number;
  feedback: string;
}

export interface EvaluationResult {
  overallScore: number; // Changed to camelCase
  detailedFeedback: string; // Changed to camelCase
  criteriaResults?: EvaluationCriterionResult[]; // Changed to camelCase
}

export interface ContentEvaluationResponseData {
  originalContent: string; // Changed to camelCase
  evaluation: EvaluationResult;
}

export interface ContentRefinementResponseData {
  originalContent: string; // Changed to camelCase
  refinedContent: string; // Changed to camelCase
  changesMade?: string[]; // Changed to camelCase
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  config?: Record<string, any> | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface AgentCreateData {
  name: string;
  type: string;
  description?: string | null;
  config?: Record<string, any> | null;
}

export interface AgentUpdateData {
  name?: string;
  type?: string;
  description?: string | null;
  config?: Record<string, any> | null;
}

// Tool Types
export interface Tool {
  id: string;
  name: string;
  category?: string | null; // Updated to match schema (optional)
  description?: string | null;
  functionName: string; // Changed to camelCase, from FastAPI schema
  config?: Record<string, any> | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ToolCreateData {
  name: string;
  category?: string | null; // Updated to match schema
  description?: string | null;
  functionName: string; // Changed to camelCase
  config?: Record<string, any> | null;
}

export interface ToolUpdateData {
  name?: string;
  category?: string | null; // Updated to match schema
  description?: string | null;
  functionName?: string; // Changed to camelCase
  config?: Record<string, any> | null;
}

// Agent Message Types
export interface AgentMessage {
  id: string;
  fromAgentId: string; // Changed to camelCase
  toAgentId: string; // Changed to camelCase
  sessionId?: string | null; // Changed to camelCase
  content: string;
  timestamp: string; // ISO date string
  metadata?: Record<string, any> | null;
}

export interface AgentMessageCreateData {
  fromAgentId: string; // Changed to camelCase
  toAgentId: string; // Changed to camelCase
  content: string;
  sessionId?: string | null; // Changed to camelCase
  metadata?: Record<string, any> | null;
}

// Collaboration Session Types
export interface CollaborationSession {
  id: string;
  name: string;
  purpose?: string | null;
  agentIds: string[]; // Changed to camelCase
  status: string;
  currentActivity?: string | null; // Changed to camelCase
  activityData?: Record<string, any> | null; // Changed to camelCase
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CollaborationSessionCreateData {
  name: string;
  purpose?: string | null;
  agentIds: string[]; // Changed to camelCase
}

export interface CollaborationSessionUpdateData {
  name?: string;
  purpose?: string | null;
  agentIds?: string[]; // Changed to camelCase
  status?: string;
  currentActivity?: string | null; // Changed to camelCase
  activityData?: Record<string, any> | null; // Changed to camelCase
}

export interface BrainstormRequestData {
  topic: string;
  durationMinutes?: number; // Changed to camelCase
  rounds?: number;
}

export interface CollaborationStatusUpdateData {
  status: string;
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

// Task Status Types
export interface TaskStatusResponseData {
  task_id: string;
  status: string; // e.g., 'PENDING', 'STARTED', 'SUCCESS', 'FAILURE', 'RETRY', 'REVOKED' (Celery states)
  current?: number; // For progress reporting
  total?: number;   // For progress reporting
  message?: string; // Status message or current step
  result?: any;     // Task result if successful and available
  error?: string | null; // Error message if failed
}

export interface TaskCancelResponseData {
  message: string;
  // task_id?: string; // Optional: server might confirm which task was targeted
  // status?: string; // Optional: new status after cancellation attempt
}

// Workflow Definition Types
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string | null;
  workflowJson: Record<string, any>; // Changed to camelCase
  userIdentifier?: string | null; // Changed to camelCase
  isTemplate?: boolean; // Changed to camelCase
  isPublic?: boolean; // Changed to camelCase
  tagsJson?: string[] | null; // Changed to camelCase
  complexityLevel?: string | null; // Changed to camelCase
  estimatedDurationMinutes?: number | null; // Changed to camelCase
  usageCount?: number; // Changed to camelCase
  createdAt: string; // ISO date string, changed to camelCase
  updatedAt: string; // ISO date string, changed to camelCase
}

export interface WorkflowDefinitionCreateData {
  name: string;
  description?: string | null;
  workflowJson: Record<string, any>; // Changed to camelCase
  isTemplate?: boolean;
  isPublic?: boolean;
  tagsJson?: string[] | null; // Changed to camelCase
  complexityLevel?: string | null; // Changed to camelCase
  estimatedDurationMinutes?: number | null; // Changed to camelCase
  userId?: string; // To be replaced by auth, changed to camelCase
}

export interface WorkflowDefinitionUpdateData {
  name?: string;
  description?: string | null;
  workflowJson?: Record<string, any>; // Changed to camelCase
  isTemplate?: boolean;
  isPublic?: boolean;
  tagsJson?: string[] | null; // Changed to camelCase
  complexityLevel?: string | null; // Changed to camelCase
  estimatedDurationMinutes?: number | null; // Changed to camelCase
}

// Workflow Run Types
export interface WorkflowRunRequestData {
  initialData?: Record<string, any>; // Changed to camelCase
}

export interface WorkflowRunResponseData {
  taskId: string; // Changed to camelCase
  status: string; // e.g., 'started', 'queued'
  message: string;
}

// User Profile & Content Rating Types
export interface UserProfile {
  userId: string; // Changed to camelCase
  profileName?: string | null; // Changed to camelCase
  stylePreferencesJson?: Record<string, any> | null; // Changed to camelCase
  writingHabitsJson?: Record<string, any> | null; // Changed to camelCase
  jattlaouiAdaptationLevel?: number | null; // Changed to camelCase
  preferredVocabularyComplexity?: number | null; // Changed to camelCase
  preferredSentenceLength?: number | null; // Changed to camelCase
  preferredCulturalDepth?: number | null; // Changed to camelCase
  createdAt: string; // Changed to camelCase
  updatedAt: string; // Changed to camelCase
}

export interface UserProfileUpdateData {
  profileName?: string | null; // Changed to camelCase
  stylePreferencesJson?: Record<string, any> | null; // Changed to camelCase
  writingHabitsJson?: Record<string, any> | null; // Changed to camelCase
  jattlaouiAdaptationLevel?: number | null; // Changed to camelCase
  preferredVocabularyComplexity?: number | null; // Changed to camelCase
  preferredSentenceLength?: number | null; // Changed to camelCase
  preferredCulturalDepth?: number | null; // Changed to camelCase
}
// UserProfileCreateData: user_id is path param, rest from UserProfileUpdateData or UserProfileBase.
// For creating, often the request body might be UserProfileUpdateData, and user_id from path.

export interface ContentRating {
  id: string;
  userId: string; // Changed to camelCase
  contentType?: string | null; // Changed to camelCase
  contentPreview?: string | null; // Changed to camelCase
  rating: number;
  specificFeedbackJson?: Record<string, any> | null; // Changed to camelCase
  projectId?: string | null; // Changed to camelCase
  timestamp: string;
}

export interface ContentRatingCreateData {
  contentType?: string | null; // Changed to camelCase
  contentPreview?: string | null; // Changed to camelCase
  rating: number; // Assuming 1-5, validation in Pydantic
  specificFeedbackJson?: Record<string, any> | null; // Changed to camelCase
  projectId?: string | null; // Changed to camelCase
}

export interface UserStatsData {
  userId: string; // Added to identify for whom the stats are
  totalProjectsCreated: number; // Changed to camelCase
  totalWorkflowsCreated: number; // Changed to camelCase
  totalContentRatingsGiven: number; // Changed to camelCase
  averageContentRating?: number | null; // Changed to camelCase
}

// PDF Processing Types
export interface PDFInfoData {
  filename: string;
  size: number;
  pageCount: number; // Changed to camelCase
  title?: string | null;
  author?: string | null;
  subject?: string | null;
  isEncrypted: boolean; // Changed to camelCase
  hasArabicText?: boolean | null; // Changed to camelCase
}

export interface PDFExtractionOptionsData {
  method?: string;
  extractTables?: boolean; // Changed to camelCase
  extractImages?: boolean; // Changed to camelCase
}

export interface PDFTableData {
  pageNumber: number; // Changed to camelCase
  tableIndex: number; // Changed to camelCase
  rowsCount: number; // Changed to camelCase
  columnsCount: number; // Changed to camelCase
  data: (string | null)[][];
}

export interface PDFImageInfoData {
  pageNumber: number; // Changed to camelCase
  imageIndex: number; // Changed to camelCase
  name?: string | null; // Added from schema definition
  format?: string | null;
  width?: number | null; // Added from schema definition
  height?: number | null; // Added from schema definition
  sizeBytes?: number | null; // Changed from size_bytes, made optional
}

export interface PDFExtractionResultData {
  text: string;
  metadata: PDFInfoData;
  pageTexts?: string[] | null; // Changed to camelCase
  tables?: PDFTableData[] | null;
  images?: PDFImageInfoData[] | null;
  extractionMethodUsed?: string | null; // Changed to camelCase
  processingTimeSeconds: number; // Changed to camelCase
  errorMessage?: string | null; // Changed to camelCase
}

export interface AvailablePDFMethodsData {
  availableMethods: Record<string, boolean>; // Changed to camelCase
  preferredOrder: string[]; // Changed to camelCase
  advancedServiceAvailable: boolean; // Changed to camelCase
}

export interface PDFMethodTestDetailData {
  methodName: string; // Changed to camelCase
  success: boolean;
  textLength: number; // Changed to camelCase
  pagesCountExtracted: number; // Added to match schema, camelCase
  tablesFound?: number; // Added from schema, camelCase
  imagesFound?: number; // Added from schema, camelCase
  processingTimeSeconds: number; // Changed from processing_time, camelCase
  hasArabicText?: boolean | null; // Changed to camelCase
  errorMessage?: string | null; // Changed to camelCase
}

export interface PDFMethodTestResponseData {
  filename: string;
  fileSize: number; // Changed to camelCase
  testResults: PDFMethodTestDetailData[]; // Changed to camelCase
}


// Analytics Types
export interface WritingSession {
  id: string;
  userId: string; // Changed to camelCase
  projectId?: string | null; // Changed to camelCase
  sessionStartTime: string; // Changed to camelCase
  sessionEndTime?: string | null; // Changed to camelCase
  wordsWritten?: number; // Changed to camelCase
  editsMade?: number; // Changed to camelCase
  qualityScoreSnapshot?: number | null; // Changed to camelCase
  stageNumberSnapshot?: number | null; // Changed to camelCase
  activeDurationSeconds?: number; // Changed to camelCase
}

export interface WritingSessionCreateData {
  projectId?: string | null; // Changed to camelCase
  stageNumberSnapshot?: number | null; // Changed to camelCase, was stage_number
}

export interface WritingSessionEndData {
  wordsWritten?: number; // Changed to camelCase
  editsMade?: number; // Changed to camelCase
  qualityScoreSnapshot?: number | null; // Changed to camelCase
  activeDurationSeconds?: number; // Changed to camelCase
}

export interface StyleAnalysisSnapshot {
  id: string;
  userId: string; // Changed to camelCase
  projectId?: string | null; // Changed to camelCase
  sessionId?: string | null; // Changed to camelCase
  analysisDate: string; // Changed to camelCase
  textSnapshotPreview?: string | null; // Changed to camelCase
  metaphorDensity?: number | null; // Changed to camelCase
  vocabularyComplexity?: number | null; // Changed to camelCase
  formalityScore?: number | null; // Changed to camelCase
  creativityScore?: number | null; // Changed to camelCase
  coherenceScore?: number | null; // Changed to camelCase
  avgSentenceLength?: number | null; // Changed to camelCase
  culturalReferencesCount?: number | null; // Changed to camelCase
}

export interface StyleAnalysisSnapshotCreateData {
  textToAnalyze: string; // Changed to camelCase
  projectId?: string | null; // Changed to camelCase
  sessionId?: string | null; // Changed to camelCase
}

export interface DailyProgressData { // Was DailyProgress in service schema
  date: string; // ISO date string
  wordsWritten: number; // Changed to camelCase
  sessionsCount: number; // Changed to camelCase
  activeTimeMinutes: number; // Changed from total_duration_seconds, to match service schema (active_time_minutes)
}

export interface ProgressAnalyticsResponseData { // Was ProgressAnalyticsResponse
  userId: string; // Added
  projectId?: string | null; // Added
  totalWordsWritten: number; // Changed to camelCase
  totalSessions: number; // Changed to camelCase
  totalActiveTimeMinutes: number; // Changed from total_duration_hours, to match service schema (total_active_time_minutes)
  averageWordsPerSession: number; // Changed to camelCase
  dailyProgress: DailyProgressData[]; // Changed to camelCase
}

export interface PersonalReportSectionData { // Was PersonalReportSection
  title: string;
  content: string;
  score?: number | null; // Added if applicable, based on potential schema evolution
}

export interface PersonalReportResponseData { // Was PersonalReportResponse
  userId: string; // Added
  projectId?: string | null; // Added
  reportDate: string; // Changed to camelCase from generated_date
  sections: PersonalReportSectionData[];
  summary: string; // Changed from overall_summary
}

export interface StyleEvolutionDataPoint {
  date: string; // ISO date string
  metaphorDensity?: number | null; // Changed to camelCase
  vocabularyComplexity?: number | null; // Changed to camelCase
  formalityScore?: number | null;
  creativityScore?: number | null;
  coherenceScore?: number | null;
  avgSentenceLength?: number | null;
}

export interface StyleEvolutionResponseData { // Was StyleEvolutionResponse
  userId: string; // Added
  projectId?: string | null; // Added
  evolutionData: StyleEvolutionDataPoint[]; // Changed from data_points
  trendAnalysis?: string | null; // Added
}

export interface ProductivityStatData { // New, from backend schema for Dashboard
    metricName: string;
    currentValue: number; // Assuming number, not float specifically
    previousValue?: number | null;
    changePercentage?: number | null;
}

export interface DashboardStatsData { // Was DashboardStatsResponse
  userId: string; // Added
  overallWritingConsistency?: number | null; // Changed to camelCase
  averageSessionDurationMinutes?: number | null; // Changed to camelCase
  wordsPerDayAverage?: number | null; // Changed to camelCase
  mostProductiveDayOfWeek?: string | null; // Changed to camelCase
  styleImprovementHighlights?: string[] | null; // Changed to camelCase
  productivityMetrics: ProductivityStatData[]; // Changed to camelCase and new type
}
