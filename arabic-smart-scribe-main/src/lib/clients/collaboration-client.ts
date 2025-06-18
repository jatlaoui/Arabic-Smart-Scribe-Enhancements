import { BaseApiClient } from './base-client';
import {
  CollaborationSession,
  CollaborationSessionCreateData,
  CollaborationSessionUpdateData,
  CollaborationStatusUpdateData, // Added for specific status update
  BrainstormRequestData,
  AgentMessage, // For getMessagesForSession
} from '../types/api-types';

export class CollaborationApiClient extends BaseApiClient {
  async createSession(data: CollaborationSessionCreateData): Promise<CollaborationSession> {
    return this.request<CollaborationSession>('/api/collaborations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSession(sessionId: string): Promise<CollaborationSession> {
    return this.request<CollaborationSession>(`/api/collaborations/${sessionId}`);
  }

  async updateSessionDetails(sessionId: string, data: CollaborationSessionUpdateData): Promise<CollaborationSession> {
    return this.request<CollaborationSession>(`/api/collaborations/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateSessionStatus(sessionId: string, data: CollaborationStatusUpdateData): Promise<CollaborationSession> {
    return this.request<CollaborationSession>(`/api/collaborations/${sessionId}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
  }

  async startBrainstorm(sessionId: string, data: BrainstormRequestData): Promise<CollaborationSession> {
    return this.request<CollaborationSession>(`/api/collaborations/${sessionId}/brainstorm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessagesForSession(
    sessionId: string,
    params?: { skip?: number; limit?: number }
  ): Promise<AgentMessage[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));

    return this.request<AgentMessage[]>(`/api/collaborations/${sessionId}/messages?${queryParams.toString()}`);
  }
}
