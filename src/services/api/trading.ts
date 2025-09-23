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
      // ✅ KORREKT: /trades (legacy router ohne prefix)
      const response = await this.request<Trade[]>(`/trades`, {
        params: { symbol, market_type: market, exchange, limit }
      });
      return response || [];
    } catch (error) {
      console.error(`[TradingAPI] Failed to fetch trades for ${symbol}:`, error);
      return [];
    }
  }

  // ✅ NEUE METHODEN für weitere Backend-Endpoints:
  static async getTicker(
    exchange: string = 'binance',
    symbol?: string,
    market_type: string = 'spot'
  ) {
    try {
      // ✅ KORREKT: /api/market/ticker (market router mit /api/market prefix)
      const response = await this.request('/api/market/ticker', {
        params: { exchange, symbol, market_type }
      });
      return response;
    } catch (error) {
      console.error(`[TradingAPI] Failed to fetch ticker:`, error);
      return null;
    }
  }

  static async getSymbols(
    exchange: string = 'binance',
    market?: string
  ) {
    try {
      // ✅ KORREKT: /api/market/symbols (market router mit /api/market prefix)
      const response = await this.request('/api/market/symbols', {
        params: { exchange, market }
      });
      return response;
    } catch (error) {
      console.error(`[TradingAPI] Failed to fetch symbols:`, error);
      return [];
    }
  }

  static async getOHLC(
    symbol: string,
    interval: string = '1m',
    exchange: string = 'binance',
    market_type: string = 'spot',
    limit: number = 100
  ) {
    try {
      // ✅ KORREKT: /ohlc (legacy router ohne prefix)
      const response = await this.request('/ohlc', {
        params: { symbol, interval, exchange, market_type, limit }
      });
      return response;
    } catch (error) {
      console.error(`[TradingAPI] Failed to fetch OHLC data:`, error);
      return [];
    }
  }
}
