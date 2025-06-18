import { BaseApiClient } from './base-client';
import {
  PDFInfoData,
  PDFExtractionOptionsData,
  PDFExtractionResultData,
  AvailablePDFMethodsData,
  PDFMethodTestResponseData,
} from '../types/api-types';

export class PdfApiClient extends BaseApiClient {
  async getPdfInfo(file: File): Promise<PDFInfoData> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<PDFInfoData>('/api/pdf/info', {
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set Content-Type for FormData
      },
    });
  }

  async extractPdfContent(file: File, options?: PDFExtractionOptionsData): Promise<PDFExtractionResultData> {
    const formData = new FormData();
    formData.append('file', file);

    let endpoint = '/api/pdf/extract';
    if (options) {
      const queryParams = new URLSearchParams();
      if (options.method !== undefined) queryParams.append('method', options.method);
      if (options.extractTables !== undefined) queryParams.append('extract_tables', String(options.extractTables));
      if (options.extractImages !== undefined) queryParams.append('extract_images', String(options.extractImages));

      const queryString = queryParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return this.request<PDFExtractionResultData>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set Content-Type for FormData
      },
    });
  }

  async getAvailableMethods(): Promise<AvailablePDFMethodsData> {
    return this.request<AvailablePDFMethodsData>('/api/pdf/methods');
  }

  async testExtractionMethods(file: File): Promise<PDFMethodTestResponseData> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<PDFMethodTestResponseData>('/api/pdf/test-extraction', {
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set Content-Type for FormData
      },
    });
  }
}
