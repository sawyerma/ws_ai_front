import { API_CONFIG } from '../../config';

export class BaseAPI {
  private static baseURL = API_CONFIG.BASE_URL;
  
  static async request<T>(endpoint: string, options?: RequestInit & { params?: Record<string, any> }): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    let url = `${this.baseURL}${endpoint}`;
    if (options?.params) {
      const query = new URLSearchParams(options.params).toString();
      url = `${url}?${query}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }
}
