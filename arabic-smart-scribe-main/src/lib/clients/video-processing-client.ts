
import { BaseApiClient } from './base-client';
import {
  TranscriptCleaningRequest,
  KeyPointsExtractionRequest,
  BookOutlineRequest,
  ChapterWritingRequest,
  VideoToBookRequest
} from '../types/api-types';

export class VideoProcessingApiClient extends BaseApiClient {
  async cleanTranscript(request: TranscriptCleaningRequest): Promise<any> {
    return this.request('/api/video-processing/clean-transcript', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async extractKeyPoints(request: KeyPointsExtractionRequest): Promise<any> {
    return this.request('/api/video-processing/extract-key-points', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateBookOutline(request: BookOutlineRequest): Promise<any> {
    return this.request('/api/video-processing/generate-book-outline', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async writeChapter(request: ChapterWritingRequest): Promise<any> {
    return this.request('/api/video-processing/write-chapter', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async processVideoToBook(request: VideoToBookRequest): Promise<any> {
    return this.request('/api/video-processing/process-video-to-book', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}
