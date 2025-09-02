// services/api/trading.ts - Trading-API
import { BaseAPI } from './base';
import { Trade, OrderBookEntry } from '../../types';

export class TradingAPI extends BaseAPI {
  static async getOrderBook(symbol: string, market_type: string, limit: number = 15): Promise<{ bids: OrderBookEntry[], asks: OrderBookEntry[] }> {
    const response = await this.request<any>(`/orderbook?symbol=${symbol}&market_type=${market_type}&limit=${limit}`);
    return {
      bids: response.bids || [],
      asks: response.asks || []
    };
  }

  static async getTrades(symbol: string, from_time?: string, to_time?: string, limit: number = 1000): Promise<Trade[]> {
    let url = `/trades?symbol=${symbol}&limit=${limit}`;
    if (from_time) url += `&from_time=${from_time}`;
    if (to_time) url += `&to_time=${to_time}`;
    
    const response = await this.request<{ trades: Trade[] }>(url);
    return response.trades || [];
  }

  static async getCandles(symbol: string, market: string, interval: string, limit?: number): Promise<any[]> {
    let url = `/candles?symbol=${symbol}&market=${market}&interval=${interval}`;
    if (limit) url += `&limit=${limit}`;
    
    const response = await this.request<{ candles: any[] }>(url);
    return response.candles || [];
  }
}