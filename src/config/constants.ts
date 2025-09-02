// Trading Constants
// All trading-related constants and defaults

export const TRADING_CONSTANTS = {
  DEFAULT_SYMBOL: 'BTCUSDT',
  DEFAULT_MARKET: 'spot',
  DEFAULT_INTERVAL: '1m',
  DEFAULT_EXCHANGE: 'bitget',
  
  INTERVALS: ['1s', '5s', '15s', '1m', '5m', '15m', '1h', '4h', '1d'],
  MARKETS: ['spot', 'usdt-m', 'coin-m-perp', 'coin-m-delivery', 'usdc-m'],
  EXCHANGES: ['bitget', 'binance'],
  
  TRADING_MODES: [
    'Market',
    'Spot', 
    'USDT-M Futures', 
    'Coin-M Perpetual-Futures', 
    'Coin-M Delivery-Futures', 
    'USDC-M Futures'
  ],
} as const;

export const VIEW_MODES = [
  'trading',
  'database', 
  'ai',
  'whales',
  'news',
  'bot',
  'api'
] as const;

export const CHART_CONSTANTS = {
  DEFAULT_BAR_SPACING: 4,
  MIN_BAR_SPACING: 1,
  MAX_BAR_SPACING: 20,
  DEFAULT_CANDLE_COUNT: 500,
} as const;