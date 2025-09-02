// config/exchanges.ts - Exchange-spezifische Konfiguration
export const EXCHANGE_CONFIG = {
  bitget: {
    name: 'Bitget',
    wsUrl: 'wss://ws.bitget.com/spot/v1/stream',
    apiUrl: 'https://api.bitget.com/api/spot/v1',
  },
  binance: {
    name: 'Binance', 
    wsUrl: 'wss://stream.binance.com:9443/ws',
    apiUrl: 'https://api.binance.com/api/v3',
  },
} as const;