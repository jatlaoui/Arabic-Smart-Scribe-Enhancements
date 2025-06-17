
import { BaseApiClient } from './base-client';
import { EditingTool, EditingRequest, EditingResponse } from '../types/api-types';

export class EditingApiClient extends BaseApiClient {
  async getEditingTools(): Promise<{ tools: EditingTool[] }> {
    return this.request<{ tools: EditingTool[] }>('/api/editing-tools');
  }

  async editText(request: EditingRequest): Promise<EditingResponse> {
    return this.request<EditingResponse>('/api/edit-text', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}
