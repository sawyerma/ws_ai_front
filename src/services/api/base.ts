// Base API Client
// Unified foundation for all API calls

import { API_CONFIG } from '../../config';

export class APIError extends Error {
  constructor(
    message: string, 
    public status: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ErrorHandler {
  static handle(error: unknown, context: string): string {
    if (error instanceof APIError) {
      return `API Error in ${context}: ${error.message}`;
    }
    if (error instanceof Error) {
      return `Error in ${context}: ${error.message}`;
    }
    return `Unknown error in ${context}`;
  }
  
  static logError(error: unknown, context: string): void {
    console.error(`[${context}]`, error);
  }
}

export class BaseAPI {
  private static baseURL = API_CONFIG.BASE_URL;
  
  static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          endpoint
        );
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new APIError('Request timeout', 408, endpoint);
      }
      
      throw new APIError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        endpoint
      );
    }
  }
  
  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}