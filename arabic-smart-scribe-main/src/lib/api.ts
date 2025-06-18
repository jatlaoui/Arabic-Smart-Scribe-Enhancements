
// Re-export all types
export * from './types/api-types';

// Re-export clients
export { ApiClient } from './clients/api-client';
export { EditingApiClient } from './clients/editing-client';
export { VideoApiClient } from './clients/video-client';
export { ProjectsApiClient } from './clients/projects-client';
export { VideoProcessingApiClient } from './clients/video-processing-client';
export { ArbitratorApiClient } from './clients/arbitrator-client';
export { TasksApiClient } from './clients/tasks-client';
export { WorkflowsApiClient } from './clients/workflows-client';
export { AgentsApiClient } from './clients/agents-client';
export { ToolsApiClient } from './clients/tools-client';
export { CollaborationApiClient } from './clients/collaboration-client';
export { UsersApiClient } from './clients/users-client'; // Added
export { PdfApiClient } from './clients/pdf-client'; // Added
export { AnalyticsApiClient } from './clients/analytics-client'; // Added


// Create and export the main API client instance
import { ApiClient } from './clients/api-client';
import { ArbitratorApiClient } from './clients/arbitrator-client';
import { TasksApiClient } from './clients/tasks-client';
import { WorkflowsApiClient } from './clients/workflows-client';
import { AgentsApiClient } from './clients/agents-client';
import { ToolsApiClient } from './clients/tools-client';
import { CollaborationApiClient } from './clients/collaboration-client';
import { UsersApiClient } from './clients/users-client'; // Added
import { PdfApiClient } from './clients/pdf-client'; // Added
import { AnalyticsApiClient } from './clients/analytics-client'; // Added

export const apiClient = new ApiClient();
export const arbitratorApiClient = new ArbitratorApiClient();
export const tasksApiClient = new TasksApiClient();
export const workflowsApiClient = new WorkflowsApiClient();
export const agentsApiClient = new AgentsApiClient();
export const toolsApiClient = new ToolsApiClient();
export const collaborationApiClient = new CollaborationApiClient();
export const usersApiClient = new UsersApiClient(); // Added
export const pdfApiClient = new PdfApiClient(); // Added
export const analyticsApiClient = new AnalyticsApiClient(); // Added
