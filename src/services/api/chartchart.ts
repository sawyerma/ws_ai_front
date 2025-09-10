import { BaseAPI } from './base';
import { ChartData, APIResponse } from '../../types';

export class ChartAPI extends BaseAPI {
  static async getHistoricalData(
    symbol: string,
    market: string,
    interval: string,
    exchange: string,
    limit: number = 1000
  ): Promise<ChartData[]> {
    try {
      const response = await this.request<APIResponse<ChartData[]>>(`/api/chart/history`, {
        params: { symbol, market, interval, exchange, limit }
      });
      return response.data || [];
    } catch (error) {
      console.error(`[ChartAPI] Failed to fetch historical data for ${symbol}:`, error);
      return [];
    }
  }
}
