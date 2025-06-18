import { BaseApiClient } from './base-client';
import {
  WritingSession,
  WritingSessionCreateData,
  WritingSessionEndData,
  StyleAnalysisSnapshot,
  StyleAnalysisSnapshotCreateData,
  ProgressAnalyticsResponseData,
  PersonalReportResponseData,
  StyleEvolutionResponseData,
  DashboardStatsData,
} from '../types/api-types'; // Assuming all are in api-types

export class AnalyticsApiClient extends BaseApiClient {
  async startWritingSession(userId: string, projectId: string, data: WritingSessionCreateData): Promise<WritingSession> {
    // Ensure projectId from path is used if not in data, or they match
    const payload = { ...data, project_id: data.projectId ?? projectId };
    return this.request<WritingSession>(`/api/analytics/users/${userId}/projects/${projectId}/sessions/start`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async endWritingSession(userId: string, sessionId: string, data: WritingSessionEndData): Promise<WritingSession> {
    return this.request<WritingSession>(`/api/analytics/users/${userId}/sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async recordStyleAnalysis(userId: string, data: StyleAnalysisSnapshotCreateData): Promise<StyleAnalysisSnapshot> {
    return this.request<StyleAnalysisSnapshot>(`/api/analytics/users/${userId}/style-analyses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWritingProgress(
    userId: string,
    projectId: string,
    params?: { days_history?: number }
  ): Promise<ProgressAnalyticsResponseData> {
    const queryParams = new URLSearchParams();
    if (params?.days_history !== undefined) queryParams.append('days_history', String(params.days_history));

    return this.request<ProgressAnalyticsResponseData>(
      `/api/analytics/users/${userId}/projects/${projectId}/progress?${queryParams.toString()}`
    );
  }

  async getPersonalReport(userId: string, projectId: string): Promise<PersonalReportResponseData> {
    return this.request<PersonalReportResponseData>(
      `/api/analytics/users/${userId}/projects/${projectId}/personal-report`
    );
  }

  async getStyleEvolution(
    userId: string,
    projectId: string,
    params?: { limit?: number }
  ): Promise<StyleEvolutionResponseData> {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));

    return this.request<StyleEvolutionResponseData>(
      `/api/analytics/users/${userId}/projects/${projectId}/style-evolution?${queryParams.toString()}`
    );
  }

  async getWritingSessions(
    userId: string,
    projectId: string,
    params?: { skip?: number; limit?: number }
  ): Promise<WritingSession[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));

    return this.request<WritingSession[]>(
      `/api/analytics/users/${userId}/projects/${projectId}/sessions?${queryParams.toString()}`
    );
  }

  async getDashboardStats(
    userId: string,
    params?: { days_history?: number }
  ): Promise<DashboardStatsData> {
    const queryParams = new URLSearchParams();
    if (params?.days_history !== undefined) queryParams.append('days_history', String(params.days_history));

    return this.request<DashboardStatsData>(
      `/api/analytics/users/${userId}/dashboard-stats?${queryParams.toString()}`
    );
  }
}
