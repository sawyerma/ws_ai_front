// Central Trading Type Definitions
// All trading-related interfaces consolidated here

export interface CoinData {
  id?: string;
  symbol: string;
  market: string;
  price: string;
  change: string;
  changePercent: number;
  volume?: string;
  high?: string;
  low?: string;
  isFavorite?: boolean;
  liveStatus?: "green" | "red";
  histStatus?: "green" | "red";
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total?: number;
  side: "buy" | "sell";
}

export interface Trade {
  id: string;
  price: number;
  size: number;
  time: string;
  side: "buy" | "sell";
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

export interface TickerData {
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  turnover24h: string;
  category: string;
}