
import { BaseApiClient } from './base-client';
import { TaskStatusResponseData, TaskCancelResponseData } from '../types/api-types';

// Specific request types like VideoToBookTaskRequest can remain if they are used for specific task submission endpoints.
// This refactoring focuses on the general task status/cancel methods.
export interface VideoToBookTaskRequest {
  raw_transcript: string;
  writing_style?: string;
}

export class TasksApiClient extends BaseApiClient {
  // This method is for a specific task, its request/response might be more specific
  // than the generic TaskStatusResponseData if it returns immediate task info.
  // For now, assuming its response is a simple { task_id, status, message }.
  async startVideoToBookTask(request: VideoToBookTaskRequest): Promise<{ task_id: string; status: string; message: string }> {
    return this.request('/api/tasks/video-to-book', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getTaskStatus(taskId: string): Promise<TaskStatusResponseData> {
    return this.request<TaskStatusResponseData>(`/api/tasks/status/${taskId}`);
  }

  async cancelTask(taskId: string): Promise<TaskCancelResponseData> {
    return this.request<TaskCancelResponseData>(`/api/tasks/cancel/${taskId}`, {
      method: 'DELETE',
    });
  }
}
