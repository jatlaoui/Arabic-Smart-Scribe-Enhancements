
// Re-export all types
export * from './types/api-types';

// Re-export clients
export { ApiClient } from './clients/api-client';
export { EditingApiClient } from './clients/editing-client';
export { VideoApiClient } from './clients/video-client';
export { ProjectsApiClient } from './clients/projects-client';
export { VideoProcessingApiClient } from './clients/video-processing-client';

// Create and export the main API client instance
import { ApiClient } from './clients/api-client';
export const apiClient = new ApiClient();
