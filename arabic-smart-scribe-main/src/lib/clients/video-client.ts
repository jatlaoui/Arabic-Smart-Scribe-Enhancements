
import { BaseApiClient } from './base-client';
import { VideoAnalysisRequest, VideoAnalysisResponse } from '../types/api-types';

export class VideoApiClient extends BaseApiClient {
  async analyzeVideo(request: VideoAnalysisRequest): Promise<VideoAnalysisResponse> {
    return this.request<VideoAnalysisResponse>('/api/analyze-video', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}
