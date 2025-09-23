import { BaseAPI } from './base';

export class BinanceAPI extends BaseAPI {
  static async getUserData() {
    try {
      const response = await this.request('/api/binance/user');
      return response;
    } catch (error) {
      console.error('[BinanceAPI] Failed to fetch user data:', error);
      return null;
    }
  }

  static async getHealth() {
    try {
      const response = await this.request('/api/binance/health');
      return response;
    } catch (error) {
      console.error('[BinanceAPI] Failed to fetch health:', error);
      return null;
    }
  }

  static async getTrades(symbol: string, limit: number = 100) {
    try {
      const response = await this.request('/api/binance/trades', {
        params: { symbol, limit }
      });
      return response;
    } catch (error) {
      console.error(`[BinanceAPI] Failed to fetch trades for ${symbol}:`, error);
      return [];
    }
  }
}

export class BitgetAPI extends BaseAPI {
  static async getUserData() {
    try {
      const response = await this.request('/api/bitget/user');
      return response;
    } catch (error) {
      console.error('[BitgetAPI] Failed to fetch user data:', error);
      return null;
    }
  }

  static async getHealth() {
    try {
      const response = await this.request('/api/bitget/health');
      return response;
    } catch (error) {
      console.error('[BitgetAPI] Failed to fetch health:', error);
      return null;
    }
  }

  static async getTrades(symbol: string, limit: number = 100) {
    try {
      const response = await this.request('/api/bitget/trades', {
        params: { symbol, limit }
      });
      return response;
    } catch (error) {
      console.error(`[BitgetAPI] Failed to fetch trades for ${symbol}:`, error);
      return [];
    }
  }
}
