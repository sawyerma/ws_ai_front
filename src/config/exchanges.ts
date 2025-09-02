// Exchange-specific Configuration
// Configuration for different cryptocurrency exchanges

import { ExchangeConfig } from '../types/api';

export const EXCHANGE_CONFIG: Record<string, ExchangeConfig> = {
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

export const getExchangeConfig = (exchange: string): ExchangeConfig => {
  return EXCHANGE_CONFIG[exchange] || EXCHANGE_CONFIG.bitget;
};