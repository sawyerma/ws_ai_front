import { BaseAPI } from './base';
import { CoinData } from '../../features/trading/types/trading';

// --- HELPERS (extracted from original symbols.ts) ---

function formatSymbol(symbol: string): string {
  if (symbol.includes('_')) return symbol.replace('_', '/').toUpperCase();
  if (symbol.endsWith('USDT')) return `${symbol.slice(0, -4)}/USDT`;
  if (symbol.endsWith('USDC')) return `${symbol.slice(0, -4)}/USDC`;
  if (symbol.endsWith('BTC')) return `${symbol.slice(0, -3)}/BTC`;
  return symbol;
}

function formatMarketType(marketType: string): string {
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

function formatPrice(price: number): string {
  if (price === 0) return '0.00';
  if (price < 0.0001) return price.toFixed(8);
  if (price < 1) return price.toFixed(6);
  if (price < 100) return price.toFixed(4);
  if (price < 1000) return price.toFixed(2);
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatChangePercent(changeRate: number): { change: string; changePercent: number } {
  const changePercent = changeRate * 100;
  const sign = changePercent >= 0 ? '+' : '';
  return {
    change: `${sign}${changePercent.toFixed(2)}%`,
    changePercent: changePercent,
  };
}

// --- INTERFACES (extracted from original symbols.ts, adapted) ---

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

// --- API FUNCTIONS ---

export class SymbolsAPI extends BaseAPI {
  static async getSymbols(exchange: string, marketFilter?: string): Promise<CoinData[]> {
    try {
      const params: any = { exchange };
      if (marketFilter) {
        params.market = marketFilter;
      }
      
      const symbolsData = await this.request<{ symbols: BackendSymbol[], count: number }>(`/api/market/symbols`, { params: params });
      const tickersData = await this.request<{ tickers: BackendTicker[], count: number }>(`/api/market/ticker`, { params: { exchange } });

      const tickerMap = new Map<string, BackendTicker>();
      tickersData.tickers?.forEach(ticker => {
        const key = `${ticker.symbol}_${ticker.market_type}`;
        tickerMap.set(key, ticker);
      });
      
      const symbols: CoinData[] = symbolsData.symbols?.map(symbol => {
        const tickerKey = `${symbol.symbol}_${symbol.market_type}`;
        const ticker = tickerMap.get(tickerKey) ?? {
          last: 0,
          changeRate: 0
        } as BackendTicker;
        
        const { change, changePercent } = formatChangePercent(ticker.changeRate);
        
        return {
          symbol: formatSymbol(symbol.symbol),
          market: formatMarketType(symbol.market_type),
          price: formatPrice(ticker.last),
          change,
          changePercent,
        };
      }) || [];
      
      return symbols.sort((a, b) => {
        if (a.market !== b.market) return a.market === 'spot' ? -1 : 1;
        return a.symbol.localeCompare(b.symbol);
      });
    } catch (error) {
      console.error('[SymbolsAPI] Error in getSymbols:', error);
      return [];
    }
  }

  static async getTicker(exchange: string, symbol: string, market?: string): Promise<BackendTicker | null> {
    try {
      const response = await this.request<{ tickers: BackendTicker[], count: number }>(`/api/market/ticker`, { 
        params: { exchange, symbol, market_type: market } 
      });
      return response.tickers?.[0] || null; // Direct access to tickers array
    } catch (error) {
      console.error(`[SymbolsAPI] Failed to fetch ticker for ${symbol}:`, error);
      return null;
    }
  }
}
