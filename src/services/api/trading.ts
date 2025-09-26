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

  // ================== VOLLSTÄNDIGER TRADING-ROUTER ==================

  // 🎯 STRATEGY MANAGEMENT (Backend: /api/trading/*)
  static async getStrategies(exchange = 'binance', status?: string) {
    return this.request('/api/trading/strategies', { 
      params: { exchange, status }
    });
  }

  static async createStrategy(strategyData: {
    symbol: string;
    exchange: string;
    strategy_type: 'grid' | 'dca' | 'arbitrage' | 'scalping';
    settings: Record<string, any>;
  }) {
    return this.request('/api/trading/strategies', {
      method: 'POST',
      body: JSON.stringify(strategyData)
    });
  }

  static async updateStrategy(strategyId: string, updates: Record<string, any>) {
    return this.request(`/api/trading/strategies/${strategyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  static async deleteStrategy(strategyId: string) {
    return this.request(`/api/trading/strategies/${strategyId}`, {
      method: 'DELETE'
    });
  }

  static async getStrategyPerformance(strategyId: string, timeframe = '24h') {
    return this.request(`/api/trading/strategies/${strategyId}/performance`, {
      params: { timeframe }
    });
  }

  // 🔧 GRID TRADING (Backend: /api/trading/grid/*)
  static async calculateGridLevels(symbol: string, exchange: string, gridConfig: {
    min_price: number;
    max_price: number;
    grid_levels: number;
    investment_amount: number;
  }) {
    return this.request('/api/trading/grid/calculate-levels', {
      method: 'POST',
      body: JSON.stringify({ symbol, exchange, ...gridConfig })
    });
  }

  static async createGridStrategy(gridData: {
    symbol: string;
    exchange: string;
    min_price: number;
    max_price: number;
    grid_levels: number;
    investment_per_level: number;
  }) {
    return this.request('/api/trading/grid/create', {
      method: 'POST',
      body: JSON.stringify(gridData)
    });
  }

  static async getGridStatus(gridId: string) {
    return this.request(`/api/trading/grid/${gridId}/status`);
  }

  static async pauseGrid(gridId: string) {
    return this.request(`/api/trading/grid/${gridId}/pause`, { method: 'POST' });
  }

  static async resumeGrid(gridId: string) {
    return this.request(`/api/trading/grid/${gridId}/resume`, { method: 'POST' });
  }

  // ⚠️ RISK MANAGEMENT (Backend: /api/trading/risk/*)
  static async getRiskAlerts(exchange?: string, severity?: 'low' | 'medium' | 'high') {
    return this.request('/api/trading/risk/alerts', {
      params: { exchange, severity }
    });
  }

  static async createRiskRule(ruleData: {
    name: string;
    condition_type: 'drawdown' | 'position_size' | 'daily_loss';
    threshold_value: number;
    action: 'alert' | 'stop_trading' | 'reduce_position';
    exchanges?: string[];
  }) {
    return this.request('/api/trading/risk/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData)
    });
  }

  static async emergencyStopAll(reason: string) {
    return this.request('/api/trading/emergency/stop-all', {
      method: 'POST',
      body: JSON.stringify({ reason, timestamp: new Date().toISOString() })
    });
  }

  static async getSystemStatus() {
    return this.request('/api/trading/system/status');
  }

  // 💰 PORTFOLIO TRACKING (Backend: /api/trading/portfolio/*)
  static async getPortfolioMetrics(exchange?: string, timeframe = '24h') {
    return this.request('/api/trading/portfolio/metrics', {
      params: { exchange, timeframe }
    });
  }

  static async getPortfolioBalance(exchange: string) {
    return this.request('/api/trading/portfolio/balance', {
      params: { exchange }
    });
  }

  static async getPortfolioHistory(exchange?: string, period = '7d') {
    return this.request('/api/trading/portfolio/history', {
      params: { exchange, period }
    });
  }

  static async getPnLReport(exchange?: string, symbol?: string, timeframe = '24h') {
    return this.request('/api/trading/portfolio/pnl', {
      params: { exchange, symbol, timeframe }
    });
  }

  // 📊 POSITIONS & ORDERS (Backend: /api/trading/*)
  static async getActivePositions(exchange?: string) {
    return this.request('/api/trading/positions', {
      params: { exchange, status: 'active' }
    });
  }

  static async getOrderHistory(exchange?: string, symbol?: string, limit = 100) {
    return this.request('/api/trading/orders/history', {
      params: { exchange, symbol, limit }
    });
  }

  static async cancelAllOrders(exchange: string, symbol?: string) {
    return this.request('/api/trading/orders/cancel-all', {
      method: 'POST',
      body: JSON.stringify({ exchange, symbol })
    });
  }

  // 🎯 SETTINGS INTEGRATION (Nutzt bestehende Backend-Settings)
  static async getTradingSettings(exchange: string) {
    return this.request(`/api/settings/urls/${exchange}`);
  }

  static async getExchangeRateLimits(exchange: string) {
    return this.request(`/api/settings/rate-limits/${exchange}`);
  }

  static async getWebSocketConfig(exchange: string) {
    return this.request(`/api/settings/websockets/${exchange}`);
  }
}
