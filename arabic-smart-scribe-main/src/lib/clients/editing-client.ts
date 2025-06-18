
import { BaseApiClient } from './base-client';
import {
  EditingTool,
  EditTextRequestData,
  EditTextResponseData,
  TextAnalysisRequestData,
  ComprehensiveTextAnalysisResponse,
  SmartSuggestionsRequestData,
  SmartSuggestionsResponseData
} from '../types/api-types';

export class EditingApiClient extends BaseApiClient {
  async getEditingTools(): Promise<EditingTool[]> {
    // Assuming the FastAPI endpoint /api/editing-tools returns EditingTool[] directly
    // The original Flask endpoint returned {"tools": []}, so if FastAPI kept that, this needs adjustment
    // For now, assuming it returns the list directly as per common FastAPI practice
    const response = await this.request<{ tools: EditingTool[] }>('/api/editing-tools');
    return response.tools; // If it's wrapped in a "tools" object
    // If it's a direct array: return this.request<EditingTool[]>('/api/editing-tools');
  }

  async editText(data: EditTextRequestData): Promise<EditTextResponseData> {
    return this.request<EditTextResponseData>('/api/edit-text', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeTextComprehensive(data: TextAnalysisRequestData): Promise<ComprehensiveTextAnalysisResponse> {
    return this.request<ComprehensiveTextAnalysisResponse>('/api/analyze-text-comprehensive', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateSmartSuggestions(data: SmartSuggestionsRequestData): Promise<SmartSuggestionsResponseData> {
    return this.request<SmartSuggestionsResponseData>('/api/generate-smart-suggestions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
