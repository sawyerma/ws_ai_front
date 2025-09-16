import { BaseAPI } from './base';
import { OrderBookEntry, Trade } from '../../features/trading/types/trading';

export class TradingAPI extends BaseAPI {
  static async getOrderBook(
    symbol: string,
    market: string,
    exchange: string,
    limit: number = 15
  ): Promise<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }> {
    try {
      // OrderBook API has .data wrapper (latenz-optimiert structure)
      const response = await this.request<{ 
        data: { 
          asks: OrderBookEntry[]; 
          bids: OrderBookEntry[] 
        } 
      }>(`/api/market/orderbook`, {
        params: { symbol, market_type: market, exchange, limit }
      });
      return response?.data || { asks: [], bids: [] };
    } catch (error) {
      console.error(`[TradingAPI] Failed to fetch orderbook for ${symbol}:`, error);
      return { asks: [], bids: [] };
    }
  }

  static async getTrades(
    symbol: string,
    market: string,
    exchange: string,
    limit: number = 100
  ): Promise<Trade[]> {
    try {
      // Trades API format based on backend structure
      const response = await this.request<Trade[]>(`/api/market/trades`, {
        params: { symbol, market_type: market, exchange, limit }
      });
      return response || [];
    } catch (error) {
      console.error(`[TradingAPI] Failed to fetch trades for ${symbol}:`, error);
      return [];
    }
  }
}
