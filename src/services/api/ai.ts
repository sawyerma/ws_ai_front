import { BaseAPI } from './base';

export class AIEngineAPI extends BaseAPI {
  // 🤖 AI STRATEGY ASSIGNMENT (Backend: /ai/tier2/*)
  static async getRecommendedStrategy(symbol: string, exchange = 'binance', timeframe = '1h') {
    return this.request('/ai/tier2/strategy-assignment', {
      params: { symbol, exchange, timeframe }
    });
  }

  static async analyzeMarketConditions(symbols: string[], exchange = 'binance') {
    return this.request('/ai/tier2/market-analysis', {
      method: 'POST',
      body: JSON.stringify({ symbols, exchange })
    });
  }

  static async getStrategyBacktest(symbol: string, strategy_type: string, timeframe = '1h', period = '30d') {
    return this.request('/ai/tier2/strategy-backtest', {
      params: { symbol, strategy_type, timeframe, period }
    });
  }

  // 📊 CHART ANALYSIS (Backend: /ai/tier2/chart-*)
  static async analyzeChart(symbol: string, exchange = 'binance', interval = '1h', analysis_type?: string) {
    return this.request('/ai/tier2/chart-analysis', {
      params: { symbol, exchange, interval, analysis_type }
    });
  }

  static async getPatternRecognition(symbol: string, exchange = 'binance', patterns?: string[]) {
    return this.request('/ai/tier2/pattern-recognition', {
      method: 'POST',
      body: JSON.stringify({ symbol, exchange, patterns })
    });
  }

  static async getTechnicalIndicators(symbol: string, exchange = 'binance', indicators?: string[]) {
    return this.request('/ai/tier2/technical-indicators', {
      params: { symbol, exchange, indicators: indicators?.join(',') }
    });
  }

  // 📈 PERFORMANCE TRACKING (Backend: /ai/tier2/performance)
  static async getAIPerformance(timeframe = '7d') {
    return this.request('/ai/tier2/performance', {
      params: { timeframe }
    });
  }

  static async getModelAccuracy(model_type?: string) {
    return this.request('/ai/tier2/model-accuracy', {
      params: { model_type }
    });
  }

  // 🎯 STRATEGY OPTIMIZATION (Backend: /ai/tier2/optimize-*)
  static async optimizeStrategy(strategyId: string, optimization_params: Record<string, any>) {
    return this.request(`/ai/tier2/optimize-strategy/${strategyId}`, {
      method: 'POST',
      body: JSON.stringify(optimization_params)
    });
  }

  static async getOptimizationResults(optimizationId: string) {
    return this.request(`/ai/tier2/optimization-results/${optimizationId}`);
  }
}
