import { BaseApiClient } from './base-client';
import {
  TranscriptCleaningRequestData,
  TranscriptCleaningResponseData,
  KeyPointsExtractionRequestData,
  KeyPointsExtractionResponseData,
  BookOutlineRequestData,
  BookOutlineResponseData,
  ChapterWritingRequestData,
  ChapterWritingResponseData,
  VideoToBookRequestData,
  VideoToBookResponseData,
} from '../types/api-types'; // Assuming all are in api-types.ts with "Data" suffix for request/response

export class VideoProcessingApiClient extends BaseApiClient {
  async cleanTranscript(data: TranscriptCleaningRequestData): Promise<TranscriptCleaningResponseData> {
    return this.request<TranscriptCleaningResponseData>('/api/video-processing/clean-transcript', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async extractKeyPoints(data: KeyPointsExtractionRequestData): Promise<KeyPointsExtractionResponseData> {
    return this.request<KeyPointsExtractionResponseData>('/api/video-processing/extract-key-points', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateBookOutline(data: BookOutlineRequestData): Promise<BookOutlineResponseData> {
    return this.request<BookOutlineResponseData>('/api/video-processing/generate-book-outline', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async writeChapter(data: ChapterWritingRequestData): Promise<ChapterWritingResponseData> {
    return this.request<ChapterWritingResponseData>('/api/video-processing/write-chapter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async processVideoToBook(data: VideoToBookRequestData): Promise<VideoToBookResponseData> {
    return this.request<VideoToBookResponseData>('/api/video-processing/process-video-to-book', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
