// Central API Configuration
// All API URLs, timeouts, and connection settings

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100',
  WS_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8100',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

export const ENDPOINTS = {
  SYMBOLS: '/api/market/symbols',
  TICKER: '/api/market/ticker',
  TRADES: '/api/market/trades',
  CANDLES: '/api/market/candles',
  ORDERBOOK: '/api/market/orderbook',
} as const;