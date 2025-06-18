import { BaseApiClient } from './base-client';
import {
  WorkflowDefinition,
  WorkflowDefinitionCreateData,
  WorkflowDefinitionUpdateData,
  WorkflowRunRequestData,
  WorkflowRunResponseData,
} from '../types/api-types'; // Assuming these are all in api-types.ts

export class WorkflowsApiClient extends BaseApiClient {
  async createWorkflow(data: WorkflowDefinitionCreateData): Promise<WorkflowDefinition> {
    // The user_id for association is passed in the body as per WorkflowDefinitionCreateData
    return this.request<WorkflowDefinition>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkflow(workflowId: string): Promise<WorkflowDefinition> {
    return this.request<WorkflowDefinition>(`/api/workflows/${workflowId}`);
  }

  async getWorkflowsByUser(
    userId: string,
    params?: { skip?: number; limit?: number }
  ): Promise<WorkflowDefinition[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));

    // Note: FastAPI path for this is /api/workflows/user/{user_id_param}
    // The client method takes userId, which matches user_id_param in the path.
    return this.request<WorkflowDefinition[]>(`/api/workflows/user/${userId}?${queryParams.toString()}`);
  }

  async getPublicWorkflows(params?: { skip?: number; limit?: number }): Promise<WorkflowDefinition[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));

    return this.request<WorkflowDefinition[]>(`/api/workflows/public?${queryParams.toString()}`);
  }

  async updateWorkflow(workflowId: string, data: WorkflowDefinitionUpdateData): Promise<WorkflowDefinition> {
    // user_id for ownership check in PUT is handled by FastAPI backend if included in data or via auth token
    return this.request<WorkflowDefinition>(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(workflowId: string, userId?: string): Promise<void> {
    // userId for ownership check in DELETE should be handled by backend logic, possibly via auth token.
    // If it must be in body, the request options would need a body.
    // The FastAPI endpoint for delete in workflows.py takes an optional user_id from Body.
    // So, if userId is provided, we should send it in the body.
    let options: RequestInit = { method: 'DELETE' };
    if (userId) {
      options.body = JSON.stringify({ user_id: userId }); // Match FastAPI router: user_id: Optional[str] = Body(None, embed=True)
      options.headers = { 'Content-Type': 'application/json' }; // Needed if body is present
    }

    await this.request<void>(`/api/workflows/${workflowId}`, options);
  }

  async runWorkflow(workflowId: string, data: WorkflowRunRequestData): Promise<WorkflowRunResponseData> {
    return this.request<WorkflowRunResponseData>(`/api/workflows/${workflowId}/run`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
