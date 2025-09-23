/**
 * WEBSOCKET CACHE - 0ms Latenz für Symbol-Daten
 * TradingView-Style LocalStorage-Cache + Live WebSocket-Updates
 */

import { CoinData } from '../../features/trading/types/trading';

interface CachedSymbolData {
  symbols: CoinData[];
  tickers: Record<string, any>;
  timestamp: number;
  exchange: string;
}

interface WebSocketMessage {
  type: 'symbols_initial' | 'ticker_update' | 'ping' | 'pong';
  exchange?: string;
  symbols?: any[];
  tickers?: Record<string, any>;
  symbol?: string;
  ticker?: any;
  timestamp: string;
  server_time: number;
}

interface WebSocketConfig {
  symbolsRefreshInterval: number;    // 5min-24h (User-konfigurierbar)
  tickerRefreshInterval: number;     // 1s-30s 
  ohlcRefreshInterval: number;       // 50ms-5s (KRITISCH für Trading!)
  orderbookRefreshInterval: number;  // 50ms-1s (ULTRA-KRITISCH!)
  whalesRefreshInterval: number;     // 30s-10min
  newsRefreshInterval: number;       // 1min-1h
  aiRefreshInterval: number;         // 10s-5min
  backgroundUpdates: boolean;        // Background-Updates aktiv
}

class WebSocketCache {
  private static instance: WebSocketCache;
  private connections: Map<string, WebSocket> = new Map();
  private cache: Map<string, CachedSymbolData> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();
  private connectionPromises: Map<string, Promise<WebSocket>> = new Map();
  private isConnecting: Set<string> = new Set();
  
  // ✅ Configuration
  private readonly baseUrl: string;
  private readonly reconnectDelay = 2000;
  private readonly maxReconnectAttempts = 5;
  private reconnectAttempts: Map<string, number> = new Map();
  
  // 🚀 USER-CONFIGURABLE: Cache-Intervalle (aus API-Panel)
  private config: WebSocketConfig = {
    symbolsRefreshInterval: 15 * 60 * 1000,     // 15min Standard
    tickerRefreshInterval: 5 * 1000,            // 5s für Ticker
    ohlcRefreshInterval: 100,                   // <5ms für Live-Trading!
    orderbookRefreshInterval: 50,               // <5ms ULTRA-KRITISCH!
    whalesRefreshInterval: 60 * 1000,           // 1min Whale-Alerts
    newsRefreshInterval: 10 * 60 * 1000,        // 10min News
    aiRefreshInterval: 30 * 1000,               // 30s AI-Updates
    backgroundUpdates: true                     // Background aktiv
  };

  private constructor() {
    // ✅ WebSocket-URL aus bestehender API-Config (TypeScript-kompatibel)
    const apiBaseUrl = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:8100';
    this.baseUrl = apiBaseUrl.replace('http', 'ws');
    
    // 🚀 Config aus LocalStorage laden (Persistierung)
    this.loadConfigFromStorage();
    
    console.log('🚀 WebSocketCache initialized:', {
      baseUrl: this.baseUrl,
      config: this.config
    });
  }

  static getInstance(): WebSocketCache {
    if (!WebSocketCache.instance) {
      WebSocketCache.instance = new WebSocketCache();
    }
    return WebSocketCache.instance;
  }

  // ✅ INSTANT ACCESS - 0ms Latenz für gecachte Daten
  async getSymbols(exchange: string): Promise<CoinData[]> {
    // ✅ Instant return wenn Cache vorhanden
    const cached = this.cache.get(exchange);
    if (cached && this.isDataFresh(cached.timestamp)) {
      console.log(`⚡ Instant symbols from cache: ${exchange} (${cached.symbols.length} symbols)`);
      return cached.symbols;
    }

    // ✅ WebSocket-Verbindung initialisieren falls nötig
    await this.ensureConnection(exchange);

    // ✅ Auf initiale Daten warten (max 3 Sekunden)
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`⚠️ WebSocket timeout for ${exchange}, falling back to HTTP`);
        this.fallbackToHTTP(exchange).then(resolve);
      }, 3000);

      this.onData(exchange, (data) => {
        clearTimeout(timeout);
        resolve(data.symbols);
      });
    });
  }

  // ✅ Live Ticker-Updates
  async getTicker(exchange: string, symbol: string): Promise<any> {
    const cached = this.cache.get(exchange);
    if (cached?.tickers?.[symbol]) {
      return cached.tickers[symbol];
    }
    return null;
  }

  // ✅ Real-Time Updates abonnieren
  onSymbolsUpdate(exchange: string, callback: (data: CachedSymbolData) => void): () => void {
    const key = `symbols:${exchange}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Cleanup-Funktion zurückgeben
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  // ✅ Ticker-Updates abonnieren
  onTickerUpdate(exchange: string, callback: (symbol: string, ticker: any) => void): () => void {
    const key = `ticker:${exchange}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  // ✅ PRIVATE: WebSocket-Verbindung sicherstellen
  private async ensureConnection(exchange: string): Promise<WebSocket> {
    const key = exchange;
    
    // Bereits verbunden
    if (this.connections.has(key)) {
      const ws = this.connections.get(key)!;
      if (ws.readyState === WebSocket.OPEN) {
        return ws;
      }
    }

    // Bereits am Verbinden
    if (this.connectionPromises.has(key)) {
      return this.connectionPromises.get(key)!;
    }

    // Neue Verbindung erstellen
    const connectionPromise = this.createConnection(exchange);
    this.connectionPromises.set(key, connectionPromise);

    try {
      const ws = await connectionPromise;
      this.connectionPromises.delete(key);
      return ws;
    } catch (error) {
      this.connectionPromises.delete(key);
      throw error;
    }
  }

  // ✅ PRIVATE: WebSocket-Verbindung erstellen
  private async createConnection(exchange: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.baseUrl}/ws/symbols/${exchange}`;
      console.log(`🔌 Connecting WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`✅ WebSocket connected: ${exchange}`);
        this.connections.set(exchange, ws);
        this.reconnectAttempts.set(exchange, 0);
        resolve(ws);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(exchange, message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed: ${exchange} (${event.code})`);
        this.connections.delete(exchange);
        
        // ✅ Auto-Reconnect
        if (!event.wasClean) {
          this.scheduleReconnect(exchange);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error: ${exchange}`, error);
        reject(error);
      };

      // ✅ Connection Timeout
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          reject(new Error(`WebSocket connection timeout: ${exchange}`));
        }
      }, 10000);
    });
  }

  // ✅ PRIVATE: WebSocket-Messages verarbeiten
  private handleMessage(exchange: string, message: WebSocketMessage) {
    switch (message.type) {
      case 'symbols_initial':
        console.log(`📦 Received initial data for ${exchange}: ${message.symbols?.length} symbols`);
        
        const symbolData: CachedSymbolData = {
          symbols: this.transformSymbols(message.symbols || []),
          tickers: message.tickers || {},
          timestamp: Date.now(),
          exchange: exchange
        };
        
        this.cache.set(exchange, symbolData);
        this.notifyListeners(`symbols:${exchange}`, symbolData);
        break;

      case 'ticker_update':
        const cached = this.cache.get(exchange);
        if (cached && message.symbol && message.ticker) {
          cached.tickers[message.symbol] = message.ticker;
          cached.timestamp = Date.now();
          
          this.notifyListeners(`ticker:${exchange}`, message.symbol, message.ticker);
        }
        break;

      case 'ping':
        // ✅ Pong senden
        const ws = this.connections.get(exchange);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
        break;
    }
  }

  // ✅ PRIVATE: Symbol-Daten transformieren (bestehende Logik aus symbols.ts)
  private transformSymbols(rawSymbols: any[]): CoinData[] {
    return rawSymbols.map(symbol => ({
      symbol: this.formatSymbol(symbol.symbol),
      market: this.formatMarketType(symbol.market_type),
      price: this.formatPrice(symbol.price || 0),
      change: symbol.change || '+0.00%',
      changePercent: symbol.changePercent || 0,
    })).sort((a, b) => {
      if (a.market !== b.market) return a.market === 'spot' ? -1 : 1;
      return a.symbol.localeCompare(b.symbol);
    });
  }

  // ✅ PRIVATE: Helper-Funktionen (aus symbols.ts kopiert)
  private formatSymbol(symbol: string): string {
    if (symbol.includes('_')) return symbol.replace('_', '/').toUpperCase();
    if (symbol.endsWith('USDT')) return `${symbol.slice(0, -4)}/USDT`;
    if (symbol.endsWith('USDC')) return `${symbol.slice(0, -4)}/USDC`;
    if (symbol.endsWith('BTC')) return `${symbol.slice(0, -3)}/BTC`;
    return symbol;
  }

  private formatMarketType(marketType: string): string {
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

  private formatPrice(price: number): string {
    if (price === 0) return '0.00';
    if (price < 0.0001) return price.toFixed(8);
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ✅ PRIVATE: Listener benachrichtigen
  private notifyListeners(key: string, ...args: any[]) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  // ✅ PRIVATE: Daten-Frische prüfen (5 Minuten TTL)
  private isDataFresh(timestamp: number): boolean {
    return Date.now() - timestamp < 5 * 60 * 1000;
  }

  // ✅ PRIVATE: HTTP-Fallback (nutzt bestehende SymbolsAPI)
  private async fallbackToHTTP(exchange: string): Promise<CoinData[]> {
    console.log(`🔄 Falling back to HTTP for ${exchange}`);
    try {
      const { SymbolsAPI } = await import('../api/symbols');
      return await SymbolsAPI.getSymbols(exchange);
    } catch (error) {
      console.error('HTTP fallback failed:', error);
      return [];
    }
  }

  // ✅ PRIVATE: Auto-Reconnect Logic
  private scheduleReconnect(exchange: string) {
    const attempts = this.reconnectAttempts.get(exchange) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`❌ Max reconnect attempts reached for ${exchange}`);
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, attempts); // Exponential backoff
    console.log(`⏳ Reconnecting ${exchange} in ${delay}ms (attempt ${attempts + 1})`);

    setTimeout(async () => {
      try {
        await this.ensureConnection(exchange);
        console.log(`✅ Reconnected ${exchange}`);
      } catch (error) {
        console.error(`❌ Reconnect failed for ${exchange}:`, error);
        this.reconnectAttempts.set(exchange, attempts + 1);
        this.scheduleReconnect(exchange);
      }
    }, delay);
  }

  // ✅ PRIVATE: Helper für onData
  private onData(exchange: string, callback: (data: CachedSymbolData) => void): void {
    const cleanup = this.onSymbolsUpdate(exchange, callback);
    
    // Check if data already exists
    const cached = this.cache.get(exchange);
    if (cached) {
      callback(cached);
    }
  }

  // 🚀 PUBLIC: Cache-Intervalle konfigurieren (aus API-Panel)
  updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // LocalStorage für Persistierung
    localStorage.setItem('websocket_cache_config', JSON.stringify(this.config));
    
    console.log('⚙️ WebSocket-Config updated:', {
      symbolsInterval: `${this.config.symbolsRefreshInterval / 1000}s`,
      tickerInterval: `${this.config.tickerRefreshInterval / 1000}s`, 
      ohlcInterval: `${this.config.ohlcRefreshInterval}ms`,
      orderbookInterval: `${this.config.orderbookRefreshInterval}ms`,
      backgroundUpdates: this.config.backgroundUpdates
    });

    // Backend über neue Intervalle informieren
    this.notifyBackendConfig();
  }

  // 🚀 PUBLIC: Aktuelle Config abrufen
  getConfig(): WebSocketConfig {
    return { ...this.config };
  }

  // 🚀 PRIVATE: Config aus LocalStorage laden
  private loadConfigFromStorage(): void {
    try {
      const stored = localStorage.getItem('websocket_cache_config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        this.config = { ...this.config, ...parsedConfig };
        console.log('📱 Config loaded from LocalStorage:', this.config);
      }
    } catch (error) {
      console.warn('Failed to load config from LocalStorage:', error);
    }
  }

  // 🚀 PRIVATE: Backend über neue Intervalle informieren
  private notifyBackendConfig(): void {
    this.connections.forEach((ws, exchange) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({
            type: 'config_update',
            config: this.config,
            timestamp: Date.now()
          }));
          console.log(`📡 Config sent to backend: ${exchange}`);
        } catch (error) {
          console.error(`Failed to send config to ${exchange}:`, error);
        }
      }
    });
  }

  // ✅ PUBLIC: Cache-Status abrufen
  getCacheStatus(): Record<string, { connected: boolean; dataAge: number; symbolCount: number }> {
    const status: Record<string, any> = {};
    
    this.cache.forEach((data, exchange) => {
      const ws = this.connections.get(exchange);
      status[exchange] = {
        connected: ws?.readyState === WebSocket.OPEN,
        dataAge: Date.now() - data.timestamp,
        symbolCount: data.symbols.length,
        tickerCount: Object.keys(data.tickers).length,
        config: this.config  // Config auch im Status
      };
    });
    
    return status;
  }

  // ✅ PUBLIC: Cleanup bei Komponenten-Unmount
  cleanup() {
    this.connections.forEach((ws, exchange) => {
      console.log(`🛑 Closing WebSocket: ${exchange}`);
      ws.close();
    });
    this.connections.clear();
    this.cache.clear();
    this.listeners.clear();
  }
}

// ✅ Singleton Export
export const webSocketCache = WebSocketCache.getInstance();

// ✅ Type Exports
export type { CachedSymbolData, WebSocketMessage };
