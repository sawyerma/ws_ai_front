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

// Configuration - Uses Vite Environment Variables (TypeScript-safe)
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8100/api/v1';
const CACHE_TTL = 300000; // 5 minutes for symbols
const TICKER_CACHE_TTL = 10000; // 10 seconds for tickers

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

// Settings API functions
export interface CoinSetting {
  exchange?: string;  // New: Exchange parameter
  symbol: string;
  market: string;
  store_live: boolean;
  load_history: boolean;
  history_until?: string;
  favorite: boolean;
  db_resolutions: number[];  // Updated: Now array instead of single value
  chart_resolution: string;
}

// Exchange configuration
export type Exchange = 'binance' | 'bitget';
export const DEFAULT_EXCHANGE: Exchange = 'bitget'; // Legacy compatibility

// Fetch settings with exchange support
export async function getSettings(exchange?: Exchange, symbol?: string, market?: string): Promise<CoinSetting[]> {
  try {
    const params = new URLSearchParams();
    if (exchange) params.append('exchange', exchange);
    if (symbol) params.append('symbol', symbol);
    if (market) params.append('market', market);
    
    const queryString = params.toString();
    const url = `${API_BASE}/config/settings${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[SymbolsAPI] Fetched ${data.length} settings from backend (exchange: ${exchange || 'all'})`);
    return data;
  } catch (error) {
    console.error('[SymbolsAPI] Failed to fetch settings:', error);
    return [];
  }
}

// Save settings with exchange support
export async function saveSettings(settings: CoinSetting[]): Promise<boolean> {
  try {
    // Ensure each setting has an exchange field (default to bitget for legacy compatibility)
    const settingsWithExchange = settings.map(setting => ({
      ...setting,
      exchange: setting.exchange || DEFAULT_EXCHANGE,
      // Convert single db_resolution to array for backward compatibility
      db_resolutions: Array.isArray(setting.db_resolutions) 
        ? setting.db_resolutions 
        : [(setting as any).db_resolution || 60]
    }));
    
    const response = await fetch(`${API_BASE}/config/settings`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsWithExchange),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('[SymbolsAPI] Settings saved successfully:', result);
    return true;
  } catch (error) {
    console.error('[SymbolsAPI] Failed to save settings:', error);
    return false;
  }
}

// Get settings for all exchanges
export async function getAllSettings(): Promise<CoinSetting[]> {
  try {
    const [binanceSettings, bitgetSettings] = await Promise.all([
      getSettings('binance').catch(() => []),
      getSettings('bitget').catch(() => [])
    ]);
    
    const allSettings = [...binanceSettings, ...bitgetSettings];
    console.log(`[SymbolsAPI] Combined ${allSettings.length} settings from all exchanges`);
    return allSettings;
  } catch (error) {
    console.error('[SymbolsAPI] Failed to fetch settings from all exchanges:', error);
    return [];
  }
}

// Fetch symbols from backend with exchange support
export async function fetchSymbols(exchange: Exchange = DEFAULT_EXCHANGE): Promise<BackendSymbolsResponse> {
  const cacheKey = `symbols_${exchange}`;
  const cached = getCached<BackendSymbolsResponse>(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await fetch(`${API_BASE}/market/symbols?exchange=${exchange}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
        timeout: parseInt((import.meta as any)?.env?.VITE_API_TIMEOUT || '10000'),
    } as any);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
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
    const response = await fetch(`${API_BASE}/market/ticker?exchange=${exchange}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: parseInt((import.meta as any)?.env?.VITE_API_TIMEOUT || '10000'),
    } as any);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    // Handle new unified backend response format
    const tickers = data.tickers || data; // Support both old and new format
    setCache(cacheKey, tickers, TICKER_CACHE_TTL);
    
    console.log(`[SymbolsAPI] Fetched ${tickers.length} tickers from ${exchange}`);
    return tickers;
  } catch (error) {
    console.error(`[SymbolsAPI] Failed to fetch tickers from ${exchange}:`, error);
    throw error;
  }
}

// Clear cache function for manual refresh
export function clearCache(): void {
  cache.clear();
  console.log('[SymbolsAPI] Cache cleared');
}
