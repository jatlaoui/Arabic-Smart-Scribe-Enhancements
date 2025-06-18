import { BaseApiClient } from './base-client';
import {
  Agent,
  AgentCreateData,
  AgentUpdateData,
  AgentMessage,
  AgentMessageCreateData,
} from '../types/api-types'; // Assuming api-types.ts is in ../types

export class AgentsApiClient extends BaseApiClient {
  // Agent CRUD
  async createAgent(data: AgentCreateData): Promise<Agent> {
    return this.request<Agent>('/api/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAgents(params?: { skip?: number; limit?: number }): Promise<Agent[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));

    return this.request<Agent[]>(`/api/agents?${queryParams.toString()}`);
  }

  async getAgent(agentId: string): Promise<Agent> {
    return this.request<Agent>(`/api/agents/${agentId}`);
  }

  async updateAgent(agentId: string, data: AgentUpdateData): Promise<Agent> {
    return this.request<Agent>(`/api/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.request<void>(`/api/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  // Agent Messaging
  async sendMessage(data: AgentMessageCreateData): Promise<AgentMessage> {
    // Endpoint is POST /api/agents/messages as per backend router (Subtask 11)
    return this.request<AgentMessage>('/api/agents/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessagesForAgent(
    agentId: string,
    params?: { skip?: number; limit?: number }
  ): Promise<AgentMessage[]> {
    // Endpoint is GET /api/agents/{agent_id}/messages
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', String(params.skip));
    if (params?.limit !== undefined) queryParams.append('limit', String(params.limit));

    return this.request<AgentMessage[]>(`/api/agents/${agentId}/messages?${queryParams.toString()}`);
  }
}
