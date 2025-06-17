
import { BaseApiClient } from './base-client';

export interface VideoToBookTaskRequest {
  raw_transcript: string;
  writing_style?: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  current: number;
  total: number;
  message: string;
  result?: any;
  error?: string;
}

export class TasksApiClient extends BaseApiClient {
  async startVideoToBookTask(request: VideoToBookTaskRequest): Promise<{ task_id: string; status: string; message: string }> {
    return this.request('/api/tasks/video-to-book', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    return this.request(`/api/tasks/status/${taskId}`);
  }

  async cancelTask(taskId: string): Promise<{ message: string }> {
    return this.request(`/api/tasks/cancel/${taskId}`, {
      method: 'DELETE',
    });
  }
}
