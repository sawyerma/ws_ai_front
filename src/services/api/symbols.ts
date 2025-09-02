// services/api/symbols.ts - NUR Symbol-API
import { BaseAPI } from './base';
import { CoinData, APIResponse, ApiSymbol } from '../../types';

export class SymbolsAPI extends BaseAPI {
  static async getSymbols(exchange: string): Promise<CoinData[]> {
    const response = await this.request<APIResponse<CoinData[]>>(`/api/market/symbols?exchange=${exchange}`);
    return response.symbols || [];
  }
  
  static async getTicker(symbol: string, market: string): Promise<any> {
    return this.request(`/api/market/ticker?symbol=${symbol}&market=${market}`);
  }

  static async getSymbolsDetailed(exchange: string): Promise<{ symbols: any[], db_symbols: any[] }> {
    const response = await this.request<{ symbols: any[], db_symbols: any[] }>(`/market/symbols?exchange=${exchange}`);
    return response;
  }

  static async getTickerFull(exchange: string, symbol?: string, market_type?: string): Promise<any> {
    let url = `/market/ticker?exchange=${exchange}`;
    if (symbol) url += `&symbol=${symbol}`;
    if (market_type) url += `&market_type=${market_type}`;
    return this.request(url);
  }

  static async searchSymbols(exchange: string, query: string): Promise<any[]> {
    const response = await this.request<{ symbols: any[] }>(`/market/search?exchange=${exchange}&q=${query}`);
    return response.symbols || [];
  }
}