import { BaseAPI } from './base';
import { ChartData } from '../../features/trading/types/trading';

export class ChartAPI extends BaseAPI {
  static async getHistoricalData(
    symbol: string,
    market: string,
    interval: string,
    exchange: string,
    limit: number = 1000
  ): Promise<ChartData[]> {
    try {
      const response = await this.request<ChartData[]>(`/api/chart/history`, {
        params: { symbol, market, interval, exchange, limit }
      });
      return response || [];
    } catch (error) {
      console.error(`[ChartAPI] Failed to fetch historical data for ${symbol}:`, error);
      return [];
    }
  }
}
