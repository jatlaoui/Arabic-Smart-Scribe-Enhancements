import { EditingApiClient } from './editing-client';
import { VideoApiClient } from './video-client';
import { ProjectsApiClient } from './projects-client';
import { VideoProcessingApiClient } from './video-processing-client';
import { TasksApiClient } from './tasks-client';

export class ApiClient {
  public editing: EditingApiClient;
  public video: VideoApiClient;
  public projects: ProjectsApiClient;
  public videoProcessing: VideoProcessingApiClient;
  public tasks: TasksApiClient;

  constructor(baseURL?: string) {
    this.editing = new EditingApiClient(baseURL);
    this.video = new VideoApiClient(baseURL);
    this.projects = new ProjectsApiClient(baseURL);
    this.videoProcessing = new VideoProcessingApiClient(baseURL);
    this.tasks = new TasksApiClient(baseURL);
  }

  // Legacy methods for backward compatibility
  async getEditingTools() {
    return this.editing.getEditingTools();
  }

  async editText(request: any) {
    return this.editing.editText(request);
  }

  async analyzeVideo(request: any) {
    return this.video.analyzeVideo(request);
  }

  async getProjects() {
    return this.projects.getProjects();
  }

  async createProject(title: string, content?: string) {
    return this.projects.createProject(title, content);
  }

  async updateProject(projectId: string, updates: any) {
    return this.projects.updateProject(projectId, updates);
  }

  async deleteProject(projectId: string) {
    return this.projects.deleteProject(projectId);
  }

  async cleanTranscript(request: any) {
    return this.videoProcessing.cleanTranscript(request);
  }

  async extractKeyPoints(request: any) {
    return this.videoProcessing.extractKeyPoints(request);
  }

  async generateBookOutline(request: any) {
    return this.videoProcessing.generateBookOutline(request);
  }

  async writeChapter(request: any) {
    return this.videoProcessing.writeChapter(request);
  }

  async processVideoToBook(request: any) {
    return this.videoProcessing.processVideoToBook(request);
  }
}
