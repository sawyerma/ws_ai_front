import { BaseAPI } from './base';

export class EnterpriseAPI extends BaseAPI {
  // 🏢 ENTERPRISE MARKET FEATURES (Backend: /api/market/enterprise/*)
  static async getEnterpriseMarketData(exchange = 'binance', symbols?: string[]) {
    return this.request('/api/market/enterprise/data', {
      method: 'POST',
      body: JSON.stringify({ exchange, symbols })
    });
  }

  static async getAdvancedAnalytics(timeframe = '24h', metrics?: string[]) {
    return this.request('/api/market/enterprise/analytics', {
      params: { timeframe, metrics: metrics?.join(',') }
    });
  }

  static async getInstitutionalFlow(exchange = 'binance', timeframe = '1h') {
    return this.request('/api/market/enterprise/institutional-flow', {
      params: { exchange, timeframe }
    });
  }

  // 📊 CHART ROUTER FEATURES (Backend: /api/charts/*)
  static async getAdvancedChartData(symbol: string, interval = '1h', indicators?: string[]) {
    return this.request('/api/charts/advanced', {
      params: { symbol, interval, indicators: indicators?.join(',') }
    });
  }

  static async getMultiTimeframeAnalysis(symbol: string, timeframes?: string[]) {
    return this.request('/api/charts/multi-timeframe', {
      method: 'POST',
      body: JSON.stringify({ symbol, timeframes })
    });
  }

  static async getVolumeProfileData(symbol: string, exchange = 'binance', period = '7d') {
    return this.request('/api/charts/volume-profile', {
      params: { symbol, exchange, period }
    });
  }

  static async getMarketStructureAnalysis(symbol: string, exchange = 'binance') {
    return this.request('/api/charts/market-structure', {
      params: { symbol, exchange }
    });
  }

  // 🎯 ENTERPRISE SETTINGS & CONFIG (Nutzt bestehende Settings-Endpoints)
  static async getEnterpriseConfig() {
    return this.request('/api/settings/enterprise/rate-limits');
  }

  static async updateEnterpriseSettings(settings: Record<string, any>) {
    return this.request('/api/settings/enterprise/rate-limits', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // 🔧 ENTERPRISE DIAGNOSTICS (Backend: /api/diagnostics/*)
  static async getSystemDiagnostics() {
    return this.request('/api/diagnostics/endpoints');
  }

  static async getOpenAPISchema() {
    return this.request('/api/diagnostics/openapi');
  }

  // 🎯 ENTERPRISE WHALE SETTINGS (Nutzt bestehende Settings)
  static async getWhaleConfig() {
    return this.request('/api/settings/whales/exchange-addresses');
  }

  static async updateWhaleConfig(config: Record<string, any>) {
    return this.request('/api/settings/whales/exchange-addresses', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }

  // 📈 ENTERPRISE MARKET CONFIG
  static async getMarketConfig() {
    return this.request('/api/settings/market/orderbook-config');
  }

  static async updateMarketConfig(config: Record<string, any>) {
    return this.request('/api/settings/market/orderbook-config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }
}
