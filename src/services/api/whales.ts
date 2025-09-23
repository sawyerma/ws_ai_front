import { BaseAPI } from './base';

export class WhalesAPI extends BaseAPI {
  static async getWhaleEvents(symbol?: string, limit: number = 100, timeframe: string = '24h') {
    try {
      const response = await this.request('/api/whales', {
        params: { symbol, limit, timeframe }
      });
      return response;
    } catch (error) {
      console.error('[WhalesAPI] Failed to fetch whale events:', error);
      return [];
    }
  }

  static async getWhaleAlerts(symbol?: string) {
    try {
      const response = await this.request('/api/whales/alerts', {
        params: { symbol }
      });
      return response;
    } catch (error) {
      console.error('[WhalesAPI] Failed to fetch whale alerts:', error);
      return [];
    }
  }

  static async getWhaleStatistics(timeframe: string = '24h') {
    try {
      const response = await this.request('/api/whales/stats', {
        params: { timeframe }
      });
      return response;
    } catch (error) {
      console.error('[WhalesAPI] Failed to fetch whale statistics:', error);
      return null;
    }
  }

  static async getWhaleTransactions(symbol: string, limit: number = 50) {
    try {
      const response = await this.request('/api/whales/transactions', {
        params: { symbol, limit }
      });
      return response;
    } catch (error) {
      console.error(`[WhalesAPI] Failed to fetch whale transactions for ${symbol}:`, error);
      return [];
    }
  }
}
