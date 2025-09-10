export type Exchange = "bitget" | "binance";
export type TradingMode = "Spot" | "USDT-M Futures" | "Coin-M Perpetual-Futures" | "Coin-M Delivery-Futures" | "USDC-M Futures";

export interface CoinData {
  symbol: string;
  market: string;
  price: string;
  change: string;
  changePercent: number;
  isFavorite?: boolean;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total?: number;
  side: 'buy' | 'sell';
}

export interface Trade {
  id: string;
  price: number;
  size: number;
  time: string;
  side: 'buy' | 'sell';
  ts: string;
}

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  turnover24h: string;
  category: string;
}

export interface WebSocketMessage {
  type: "candle" | "trade" | "orderbook" | "connected" | "error";
  data: any;
  timestamp?: string;
}
