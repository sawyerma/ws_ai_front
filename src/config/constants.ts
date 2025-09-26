export const TRADING_CONSTANTS = {
  DEFAULT_SYMBOL: 'BTCUSDT',
  DEFAULT_MARKET: 'spot',
  DEFAULT_INTERVAL: '1m',
  DEFAULT_EXCHANGE: 'bitget',
  
  INTERVALS: ['1s', '5s', '15s', '1m', '5m', '15m', '1h', '4h', '1d'],
  MARKETS: ['spot', 'usdt-m', 'coin-m-perp', 'coin-m-delivery', 'usdc-m'],
  EXCHANGES: ['bitget', 'binance'],
} as const;

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8100',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;
