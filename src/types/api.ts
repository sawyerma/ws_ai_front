// Central API Type Definitions
// All API-related interfaces consolidated here

export interface APIResponse<T> {
  symbols?: T;
  data?: T;
  status?: 'success' | 'error';
  message?: string;
}

export interface WebSocketMessage {
  type: "candle" | "trade" | "orderbook";
  data: any;
  timestamp?: string;
}

export interface ApiSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  marketType?: string;
}

export type Exchange = "bitget" | "binance";

export interface ExchangeConfig {
  name: string;
  wsUrl: string;
  apiUrl: string;
}