// Trading API Service
// Handles trades, orderbook, and market data

import { BaseAPI, ErrorHandler } from './base';
import { ENDPOINTS } from '../../config';
import { Trade, OrderBookEntry, Exchange } from '../../types';

interface BackendTrade {
  id: string;
  price: number;
  size: number;
  time: string;
  side: 'buy' | 'sell';
  ts: string;
}

interface BackendOrderBook {
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

export class TradingAPI extends BaseAPI {
  static async getTrades(symbol: string, market: string, exchange: Exchange = 'bitget'): Promise<Trade[]> {
    try {
      const params = new URLSearchParams({ symbol, market, exchange });
      const response = await this.get<{ trades: BackendTrade[] }>(
        `${ENDPOINTS.TRADES}?${params.toString()}`
      );
      
      return response.trades.map(trade => ({
        id: trade.id,
        price: trade.price,
        size: trade.size,
        time: trade.time,
        side: trade.side,
        ts: trade.ts,
      }));
    } catch (error) {
      ErrorHandler.logError(error, 'TradingAPI.getTrades');
      return [];
    }
  }
  
  static async getOrderBook(symbol: string, market: string, exchange: Exchange = 'bitget'): Promise<{
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  }> {
    try {
      const params = new URLSearchParams({ symbol, market, exchange });
      const response = await this.get<BackendOrderBook>(
        `${ENDPOINTS.ORDERBOOK}?${params.toString()}`
      );
      
      return {
        bids: response.bids.map(([price, size]) => ({
          price,
          size,
          side: 'buy' as const,
        })),
        asks: response.asks.map(([price, size]) => ({
          price,
          size,
          side: 'sell' as const,
        })),
      };
    } catch (error) {
      ErrorHandler.logError(error, 'TradingAPI.getOrderBook');
      return { bids: [], asks: [] };
    }
  }
  
  static async getCandles(
    symbol: string, 
    market: string, 
    interval: string, 
    exchange: Exchange = 'bitget'
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({ symbol, market, interval, exchange });
      const response = await this.get<{ candles: any[] }>(
        `${ENDPOINTS.CANDLES}?${params.toString()}`
      );
      
      return response.candles || [];
    } catch (error) {
      ErrorHandler.logError(error, 'TradingAPI.getCandles');
      return [];
    }
  }
}