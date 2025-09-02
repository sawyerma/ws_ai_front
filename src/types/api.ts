// types/api.ts - ALLE API-Interfaces zentral
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
  market: string;
  price: string;
  change: string;
  changePercent: number;
  isFavorite?: boolean;
  liveStatus?: "green" | "red";
  histStatus?: "green" | "red";
}

export type Exchange = "bitget" | "binance";