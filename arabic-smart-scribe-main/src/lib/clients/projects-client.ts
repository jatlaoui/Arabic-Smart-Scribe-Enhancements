
import { BaseApiClient } from './base-client';
import { Project } from '../types/api-types';

export class ProjectsApiClient extends BaseApiClient {
  async getProjects(): Promise<{ projects: Project[] }> {
    return this.request<{ projects: Project[] }>('/api/projects');
  }

  async createProject(title: string, content: string = ''): Promise<Project> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }

  async updateProject(
    projectId: string, 
    updates: { title?: string; content?: string }
  ): Promise<Project> {
    return this.request<Project>(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  }
}
