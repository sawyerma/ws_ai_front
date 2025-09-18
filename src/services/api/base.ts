// Service-specific API configuration (profi_gui.md: Feature-basierte Architektur)
const SERVICE_API_CONFIG = {
  BASE_URL: (import.meta as any)?.env?.VITE_API_BASE_URL || `http://localhost:${(import.meta as any)?.env?.VITE_BACKEND_PORT || '8100'}`,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

export class BaseAPI {
  private static baseURL = SERVICE_API_CONFIG.BASE_URL;
  
  static async request<T>(endpoint: string, options?: RequestInit & { params?: Record<string, any> }): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), SERVICE_API_CONFIG.TIMEOUT);

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
