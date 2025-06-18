import { BaseApiClient } from './base-client';
import {
  Tool,
  ToolCreateData,
  ToolUpdateData,
} from '../types/api-types';

export class ToolsApiClient extends BaseApiClient {
  async createTool(data: ToolCreateData): Promise<Tool> {
    return this.request<Tool>('/api/tools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTools(params?: { skip?: number; limit?: number }): Promise<Tool[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));

    return this.request<Tool[]>(`/api/tools?${queryParams.toString()}`);
  }

  async getTool(toolId: string): Promise<Tool> {
    return this.request<Tool>(`/api/tools/${toolId}`);
  }

  async updateTool(toolId: string, data: ToolUpdateData): Promise<Tool> {
    return this.request<Tool>(`/api/tools/${toolId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTool(toolId: string): Promise<void> {
    await this.request<void>(`/api/tools/${toolId}`, {
      method: 'DELETE',
    });
  }
}
