import axios from 'axios';

// --- INTERFACES ---

export interface ApiSymbol {
  symbol: string;
  market: string;
  price: string;
  change: string;
  changePercent: number;
}

export interface ApiResponse {
  symbols: ApiSymbol[];
}

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

interface DbSymbol {
  id: string;
  symbol: string;
  market: string;
  exchange: string;
}

interface BackendSymbolsResponse {
  symbols: BackendSymbol[];
  db_symbols: DbSymbol[];
}

export interface CoinSetting {
  exchange?: string;
  symbol: string;
  market: string;
  store_live: boolean;
  load_history: boolean;
  history_until?: string;
  favorite: boolean;
  db_resolutions: number[];
  chart_resolution: string;
}

export type Exchange = 'binance' | 'bitget';
export const DEFAULT_EXCHANGE: Exchange = 'bitget';

// --- CONFIGURATION ---

const API_BASE = ''; // Korrekt für Proxy
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status >= 500) {
      console.error("Server-Fehler erkannt:", error.response.data);
    }
    return Promise.reject(error);
  }
);

// --- HELPERS ---

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

function parseTimeframe(tf: string): number {
  const unit = tf.slice(-1);
  const value = parseInt(tf.slice(0, -1), 10);
  const validUnits = ['m', 'h', 'd'];
  
  if (isNaN(value) || !validUnits.includes(unit)) {
    console.warn(`Invalid timeframe: ${tf}, using default 1h`);
    return 3600000;
  }
  
  switch(unit) {
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 3600000;
  }
}

// --- API FUNCTIONS ---

async function fetchRawSymbols(
  exchange: Exchange = DEFAULT_EXCHANGE,
  marketFilter?: string
): Promise<BackendSymbolsResponse> {
  try {
    const params: any = { exchange };
    if (marketFilter) {
      params.market = marketFilter;
    }
    
    const response = await apiClient.get(`/api/market/symbols`, { params });
    return response.data;
  } catch (error) {
    console.error(`[SymbolsAPI] Failed to fetch symbols from ${exchange}:`, error);
    throw error;
  }
}

async function fetchRawTickers(exchange: Exchange = DEFAULT_EXCHANGE): Promise<BackendTicker[]> {
  try {
    const response = await apiClient.get(`/api/market/ticker`, { 
      params: { exchange } 
    });
    return response.data.tickers || [];
  } catch (error) {
    console.error(`[SymbolsAPI] Failed to fetch tickers from ${exchange}:`, error);
    throw error;
  }
}

export async function getSymbols(
  exchange: Exchange = DEFAULT_EXCHANGE, 
  marketFilter?: string
): Promise<ApiResponse> {
  try {
    const [symbolsData, tickersData] = await Promise.all([
      fetchRawSymbols(exchange, marketFilter),
      fetchRawTickers(exchange)
    ]);
    
    const tickerMap = new Map<string, BackendTicker>();
    tickersData.forEach(ticker => {
      const key = `${ticker.symbol}_${ticker.market_type}`;
      tickerMap.set(key, ticker);
    });
    
    const symbols: ApiSymbol[] = symbolsData.symbols.map(symbol => {
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
    });
    
    return {
      symbols: symbols.sort((a, b) => {
        if (a.market !== b.market) return a.market === 'spot' ? -1 : 1;
        return a.symbol.localeCompare(b.symbol);
      }),
    };
  } catch (error) {
    console.error('[SymbolsAPI] Error in getSymbols:', error);
    return { symbols: [] };
  }
}

export async function getSettings(exchange?: Exchange, symbol?: string, market?: string): Promise<CoinSetting[]> {
  try {
    const response = await apiClient.get(`/api/config/settings`, { 
      params: { exchange, symbol, market } 
    });
    return response.data;
  } catch (error) {
    console.error('[SymbolsAPI] Failed to fetch settings:', error);
    return [];
  }
}

export async function saveSettings(settings: Partial<CoinSetting>): Promise<boolean> {
  try {
    await apiClient.post(`/api/config/settings`, settings);
    return true;
  } catch (error) {
    console.error('[SymbolsAPI] Failed to save settings:', error);
    return false;
  }
}

export async function getTicker(exchange: Exchange = DEFAULT_EXCHANGE, symbol: string, market?: string): Promise<any> {
  try {
    const response = await apiClient.get(`/api/market/ticker`, { 
      params: { exchange, symbol, market_type: market } 
    });
    return response.data;
  } catch (error) {
    console.error(`[SymbolsAPI] Failed to fetch ticker for ${symbol}:`, error);
    return null;
  }
}

export const fetchTrades = async (symbol: string, timeframe = '1h') => {
  const now = new Date();
  const from = new Date(now.getTime() - parseTimeframe(timeframe));
  try {
    const response = await apiClient.get('/api/trades', {
      params: { 
        symbol, 
        from_time: from.toISOString(), 
        to_time: now.toISOString(), 
        limit: 1000 
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch trades for ${symbol}:`, error);
    return [];
  }
};

export const saveUserConfig = async (config: Partial<CoinSetting>) => {
  try {
    const response = await apiClient.post('/api/config', config);
    return response.data;
  } catch (error) {
    console.error('Failed to save config:', error);
    return null;
  }
};

export const getLatestUserConfig = async () => {
  try {
    const response = await apiClient.get('/api/config/latest');
    return response.data;
  } catch (error) {
    console.error('Failed to get latest config:', error);
    return null;
  }
};

export function clearCache(): void {
  console.log('[SymbolsAPI] Cache management is now handled by React Query.');
}
