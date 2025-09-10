export const TRADING_CONSTANTS = {
  DEFAULT_SYMBOL: 'BTCUSDT',
  DEFAULT_MARKET: 'spot',
  DEFAULT_INTERVAL: '1m',
  DEFAULT_EXCHANGE: 'bitget',
  
  INTERVALS: ['1s', '5s', '15s', '1m', '5m', '15m', '1h', '4h', '1d'],
  MARKETS: ['spot', 'usdt-m', 'coin-m-perp', 'coin-m-delivery', 'usdc-m'],
  EXCHANGES: ['bitget', 'binance'],
} as const;
