import { BaseApiClient } from './base-client';
import {
  ArbitratorRequestData,
  ContentEvaluationResponseData,
  ContentRefinementResponseData,
} from '../types/api-types';

export class ArbitratorApiClient extends BaseApiClient {
  async evaluateContent(data: ArbitratorRequestData): Promise<ContentEvaluationResponseData> {
    return this.request<ContentEvaluationResponseData>('/api/arbitrator/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refineContent(data: ArbitratorRequestData): Promise<ContentRefinementResponseData> {
    return this.request<ContentRefinementResponseData>('/api/arbitrator/refine', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
