import { BaseAPI } from './base';

export class MarketAPI extends BaseAPI {
  // ✅ HEALTH ENDPOINT
  static async getSystemHealth() {
    try {
      const response = await this.request('/health');
      return response;
    } catch (error) {
      console.error('[MarketAPI] Failed to fetch system health:', error);
      return null;
    }
  }

  // ✅ METRICS ENDPOINT  
  static async getPerformanceMetrics() {
    try {
      const response = await this.request('/api/ws/metrics');
      return response;
    } catch (error) {
      console.error('[MarketAPI] Failed to fetch performance metrics:', error);
      return null;
    }
  }


  // ✅ SETTINGS ENDPOINTS
  static async getExchangeSettings(provider: string) {
    try {
      const response = await this.request(`/api/settings/urls/${provider}`);
      return response;
    } catch (error) {
      console.error(`[MarketAPI] Failed to fetch exchange settings for ${provider}:`, error);
      return null;
    }
  }

  static async getRateLimits(provider: string) {
    try {
      const response = await this.request(`/api/settings/rate-limits/${provider}`);
      return response;
    } catch (error) {
      console.error(`[MarketAPI] Failed to fetch rate limits for ${provider}:`, error);
      return null;
    }
  }

  static async getWebSocketSettings(exchange: string) {
    try {
      const response = await this.request(`/api/settings/websockets/${exchange}`);
      return response;
    } catch (error) {
      console.error(`[MarketAPI] Failed to fetch websocket settings for ${exchange}:`, error);
      return null;
    }
  }

  static async getUsageStats(provider: string) {
    try {
      const response = await this.request(`/api/settings/usage/${provider}`);
      return response;
    } catch (error) {
      console.error(`[MarketAPI] Failed to fetch usage stats for ${provider}:`, error);
      return null;
    }
  }
}
