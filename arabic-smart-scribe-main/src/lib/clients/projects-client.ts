
import { BaseApiClient } from './base-client';
import {
  Project,
  ProjectCreateData,
  ProjectUpdateData,
  StageUpdateData,
  MetadataUpdateData
} from '../types/api-types';

export class ProjectsApiClient extends BaseApiClient {
  async getProjects(): Promise<Project[]> {
    // FastAPI endpoint GET /api/projects returns List[Project] directly
    return this.request<Project[]>('/api/projects');
  }

  async createProject(data: ProjectCreateData): Promise<Project> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjectById(projectId: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${projectId}`);
  }

  async updateProject(
    projectId: string, 
    updates: ProjectUpdateData
  ): Promise<Project> {
    return this.request<Project>(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    // Assuming BaseApiClient.request can handle 204 No Content responses gracefully,
    // e.g., by returning undefined or if response.text() is empty.
    // If not, a raw fetch or a modification in BaseApiClient might be needed.
    await this.request<void>(`/api/projects/${projectId}`, { // Changed T to void
      method: 'DELETE',
    });
    // No explicit return for void Promise if BaseApiClient handles it
  }

  async updateProjectStage(projectId: string, data: StageUpdateData): Promise<Project> {
    return this.request<Project>(`/api/projects/${projectId}/stage`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateProjectMetadata(projectId: string, data: MetadataUpdateData): Promise<Project> {
    return this.request<Project>(`/api/projects/${projectId}/metadata`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
