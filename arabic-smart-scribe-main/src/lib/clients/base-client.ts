
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class BaseApiClient {
  protected baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content and 202 Accepted (often no content either)
      if (response.status === 204 || response.status === 202) {
        return undefined as T; // Or null, or a specific marker object if preferred
      }

      // For other successful responses, try to parse JSON
      // If response might not be JSON (e.g. text/plain), add content-type check
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      } else {
        // Handle non-JSON responses if necessary, e.g. return text()
        // For now, assuming JSON or no content for successful responses
        return await response.text() as T; // This might not be what T expects
                                           // A more robust solution would be separate methods for non-JSON responses
                                           // or a clearer contract on what T can be.
                                           // For void promises from 204, undefined is fine.
                                           // If a method expects text, it should type T as string and handle.
      }
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }
}
