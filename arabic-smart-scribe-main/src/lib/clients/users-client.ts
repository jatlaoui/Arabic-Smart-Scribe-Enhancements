import { BaseApiClient } from './base-client';
import {
  UserProfile,
  UserProfileUpdateData,
  ContentRating,
  ContentRatingCreateData,
  UserStatsData,
} from '../types/api-types'; // Assuming api-types.ts is in ../types

export class UsersApiClient extends BaseApiClient {
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/api/users/${userId}/profile`);
  }

  async updateUserProfile(userId: string, data: UserProfileUpdateData): Promise<UserProfile> {
    return this.request<UserProfile>(`/api/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createContentRating(userId: string, data: ContentRatingCreateData): Promise<ContentRating> {
    // The backend endpoint POST /api/users/{user_id}/ratings expects user_id in path.
    return this.request<ContentRating>(`/api/users/${userId}/ratings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(userId: string): Promise<UserStatsData> {
    return this.request<UserStatsData>(`/api/users/${userId}/stats`);
  }
}
