// services/api/base.ts - Basis für alle API-Calls
import { API_CONFIG } from '../../config';

export class BaseAPI {
  private static baseURL = API_CONFIG.BASE_URL;
  
  static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
}