// Symbols API Service
// Centralized symbol and market data handling

import { BaseAPI, ErrorHandler } from './base';
import { ENDPOINTS } from '../../config';
import { CoinData, APIResponse, Exchange } from '../../types';

interface BackendSymbol {
  symbol: string;
  market_type: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
}

interface BackendTicker {
  symbol: string;
  last: number;
  high24h: number;
  low24h: number;
  changeRate: number;
  baseVol: number;
  quoteVol: number;
  market_type: string;
}

interface BackendSymbolsResponse {
  symbols: BackendSymbol[];
  db_symbols: any[];
}

export class SymbolsAPI extends BaseAPI {
  static async getSymbols(exchange: Exchange, marketFilter?: string): Promise<CoinData[]> {
    try {
      const params = new URLSearchParams({ exchange });
      if (marketFilter) {
        params.append('market', marketFilter);
      }
      
      const response = await this.get<BackendSymbolsResponse>(
        `${ENDPOINTS.SYMBOLS}?${params.toString()}`
      );
      
      // Transform backend symbols to CoinData format
      return response.symbols.map(symbol => ({
        symbol: symbol.symbol,
        market: this.formatMarketType(symbol.market_type),
        price: '0.00',
        change: '+0.00%',
        changePercent: 0,
        isFavorite: false,
        liveStatus: 'red' as const,
        histStatus: 'red' as const,
      }));
    } catch (error) {
      ErrorHandler.logError(error, 'SymbolsAPI.getSymbols');
      throw error;
    }
  }
  
  static async getTicker(symbol: string, market: string, exchange: Exchange = 'bitget'): Promise<any> {
    try {
      const params = new URLSearchParams({ symbol, market, exchange });
      return await this.get(`${ENDPOINTS.TICKER}?${params.toString()}`);
    } catch (error) {
      ErrorHandler.logError(error, 'SymbolsAPI.getTicker');
      throw error;
    }
  }
  
  static async getMultipleTickers(symbols: string[], market: string, exchange: Exchange = 'bitget'): Promise<BackendTicker[]> {
    try {
      const response = await this.post<{ tickers: BackendTicker[] }>('/api/market/tickers', {
        symbols,
        market,
        exchange
      });
      return response.tickers || [];
    } catch (error) {
      ErrorHandler.logError(error, 'SymbolsAPI.getMultipleTickers');
      return [];
    }
  }
  
  // Utility methods
  private static formatMarketType(marketType: string): string {
    const marketMap: Record<string, string> = {
      'spot': 'spot', 
      'usdtm': 'USDT-M', 
      'coinm': 'COIN-M', 
      'usdcm': 'USDC-M',
      'USDT-FUTURES': 'USDT-M', 
      'COIN-FUTURES': 'COIN-M', 
      'USDC-FUTURES': 'USDC-M',
      'linear': 'USDT-M',
      'inverse': 'COIN-M'
    };
    return marketMap[marketType.toLowerCase()] || marketType;
  }
  
  static formatSymbol(symbol: string): string {
    if (symbol.includes('_')) return symbol.replace('_', '/').toUpperCase();
    if (symbol.endsWith('USDT')) return `${symbol.slice(0, -4)}/USDT`;
    if (symbol.endsWith('USDC')) return `${symbol.slice(0, -4)}/USDC`;
    if (symbol.endsWith('BTC')) return `${symbol.slice(0, -3)}/BTC`;
    return symbol;
  }
}