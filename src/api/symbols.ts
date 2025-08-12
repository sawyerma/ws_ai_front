import axios from 'axios';

// API endpoint for symbols data
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

// Backend API interfaces
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

// Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';
const CACHE_TTL = 300000; // 5 minutes for symbols
const TICKER_CACHE_TTL = 10000; // 10 seconds for tickers

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Globaler Error-Handler (Interceptor)
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status >= 500) {
      // Hier könnte eine globale Toast-Notification ausgelöst werden
      console.error("Server-Fehler erkannt:", error.response.data);
    }
    return Promise.reject(error);
  }
);


// Cache storage
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<any>>();

// Cache utilities
function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}


// Format symbol for display (BTCUSDT -> BTC/USDT)
function formatSymbol(symbol: string): string {
  if (symbol.includes('_')) return symbol.replace('_', '/').toUpperCase();
  if (symbol.endsWith('USDT')) return `${symbol.slice(0, -4)}/USDT`;
  if (symbol.endsWith('USDC')) return `${symbol.slice(0, -4)}/USDC`;
  if (symbol.endsWith('BTC')) return `${symbol.slice(0, -3)}/BTC`;
  return symbol;
}

// Format market type for display
function formatMarketType(marketType: string): string {
  const marketMap: { [key: string]: string } = {
    'spot': 'spot', 'usdtm': 'USDT-M', 'coinm': 'COIN-M', 'usdcm': 'USDC-M',
    'USDT-FUTURES': 'USDT-M', 'COIN-FUTURES': 'COIN-M', 'USDC-FUTURES': 'USDC-M',
  };
  return marketMap[marketType] || marketType;
}

// Format price for display
function formatPrice(price: number): string {
  if (price === 0) return '0.00';
  if (price < 1) return price.toFixed(6);
  if (price < 100) return price.toFixed(4);
  if (price < 1000) return price.toFixed(2);
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format change percentage
function formatChangePercent(changeRate: number): { change: string; changePercent: number } {
  const changePercent = changeRate * 100;
  const sign = changePercent >= 0 ? '+' : '';
  return {
    change: `${sign}${changePercent.toFixed(2)}%`,
    changePercent: changePercent,
  };
}

// Exchange configuration
export type Exchange = 'binance' | 'bitget';
export const DEFAULT_EXCHANGE: Exchange = 'bitget';

// Fetch symbols from backend with exchange support
export async function fetchSymbols(exchange: Exchange = DEFAULT_EXCHANGE): Promise<BackendSymbolsResponse> {
  const cacheKey = `symbols_${exchange}`;
  const cached = getCached<BackendSymbolsResponse>(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await apiClient.get(`/api/market/symbols?exchange=${exchange}`);
    const data = response.data;
    setCache(cacheKey, data, CACHE_TTL);
    console.log(`[SymbolsAPI] Fetched ${data.symbols?.length || 0} symbols from ${exchange}`);
    return data;
  } catch (error) {
    console.error(`[SymbolsAPI] Failed to fetch symbols from ${exchange}:`, error);
    throw error;
  }
}

// Fetch tickers from backend with exchange support
export async function fetchTickers(exchange: Exchange = DEFAULT_EXCHANGE): Promise<BackendTicker[]> {
  const cacheKey = `tickers_${exchange}`;
  const cached = getCached<BackendTicker[]>(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await apiClient.get(`/api/market/ticker?exchange=${exchange}`);
    const data = response.data;
    const tickers = data.tickers || data;
    setCache(cacheKey, tickers, TICKER_CACHE_TTL);
    console.log(`[SymbolsAPI] Fetched ${tickers.length} tickers from ${exchange}`);
    return tickers;
  } catch (error) {
    console.error(`[SymbolsAPI] Failed to fetch tickers from ${exchange}:`, error);
    throw error;
  }
}

// Main function to get symbols with price
export async function getSymbols(exchange: Exchange = DEFAULT_EXCHANGE): Promise<ApiResponse> {
  try {
    const [symbolsData, tickersData] = await Promise.all([
      fetchSymbols(exchange),
      fetchTickers(exchange),
    ]);
    
    const tickerMap = new Map<string, BackendTicker>();
    tickersData.forEach(ticker => {
      const key = `${ticker.symbol}_${ticker.market_type}`;
      tickerMap.set(key, ticker);
    });
    
    const symbols: ApiSymbol[] = symbolsData.symbols.map(symbol => {
      const tickerKey = `${symbol.symbol}_${symbol.market_type}`;
      const ticker = tickerMap.get(tickerKey);
      const { change, changePercent } = ticker ? formatChangePercent(ticker.changeRate) : { change: '0.00%', changePercent: 0 };
      
      return {
        symbol: formatSymbol(symbol.symbol),
        market: formatMarketType(symbol.market_type),
        price: ticker ? formatPrice(ticker.last) : '0.00',
        change,
        changePercent,
      };
    });
    
    return {
      symbols: symbols.sort((a, b) => {
        if (a.market !== b.market) {
          if (a.market === 'spot') return -1;
          if (b.market === 'spot') return 1;
          return a.market.localeCompare(b.market);
        }
        return a.symbol.localeCompare(b.symbol);
      }),
    };
  } catch (error) {
    console.error('[SymbolsAPI] Error in getSymbols:', error);
    return { symbols: [] };
  }
}

// Settings API functions
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

export async function getSettings(exchange?: Exchange, symbol?: string, market?: string): Promise<CoinSetting[]> {
  try {
    const params = new URLSearchParams();
    if (exchange) params.append('exchange', exchange);
    if (symbol) params.append('symbol', symbol);
    if (market) params.append('market', market);
    
    const response = await apiClient.get(`/api/config/settings`, { params });
    return response.data;
  } catch (error) {
    console.error('[SymbolsAPI] Failed to fetch settings:', error);
    return [];
  }
}

export async function saveSettings(settings: CoinSetting[]): Promise<boolean> {
  try {
    const settingsWithExchange = settings.map(setting => ({
      ...setting,
      exchange: setting.exchange || DEFAULT_EXCHANGE,
      db_resolutions: Array.isArray(setting.db_resolutions) ? setting.db_resolutions : [(setting as any).db_resolution || 60]
    }));
    
    await apiClient.put(`/api/config/settings`, settingsWithExchange);
    return true;
  } catch (error) {
    console.error('[SymbolsAPI] Failed to save settings:', error);
    return false;
  }
}

export async function getTicker(exchange: Exchange = DEFAULT_EXCHANGE, symbol: string, market?: string): Promise<any> {
  try {
    const params = new URLSearchParams();
    params.append('exchange', exchange);
    params.append('symbol', symbol);
    if (market) params.append('market_type', market);
    
    const response = await apiClient.get(`/api/market/ticker`, { params });
    return response.data;
  } catch (error) {
    console.error(`[SymbolsAPI] Failed to fetch ticker for ${symbol}:`, error);
    throw error;
  }
}

// --- Integration from umsetzen_6.md ---
function parseTimeframe(tf: string): number {
  const unit = tf.slice(-1);
  const value = parseInt(tf.slice(0, -1), 10);
  if (isNaN(value)) return 3600000;
  switch(unit) {
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 3600000;
  }
}

export const fetchTrades = async (symbol: string, timeframe = '1h') => {
  const now = new Date();
  const from = new Date(now.getTime() - parseTimeframe(timeframe));
  try {
    const response = await apiClient.get('/api/trades', {
      params: { symbol, from_time: from.toISOString(), to_time: now.toISOString(), limit: 1000 }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch trades for ${symbol}:`, error);
    throw error;
  }
};

export const saveUserConfig = async (config: Partial<CoinSetting>) => {
  try {
    const response = await apiClient.post('/api/config', config);
    return response.data;
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
};

export const getLatestUserConfig = async () => {
    try {
        const response = await apiClient.get('/api/config/latest');
        return response.data;
    } catch (error) {
        console.error('Failed to get latest config:', error);
        throw error;
    }
};
