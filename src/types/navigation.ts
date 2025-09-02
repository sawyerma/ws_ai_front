// types/navigation.ts - Navigation-Types
export interface NavigationItem {
  id: string;
  name: string;
  icon?: string;
  hasDropdown?: boolean;
}

export type ViewMode = "trading" | "database" | "ai" | "whales" | "news" | "bot" | "api";
export type TradingMode = "Spot" | "USDT-M Futures" | "Coin-M Perpetual-Futures" | "Coin-M Delivery-Futures" | "USDC-M Futures";
export type Exchange = "bitget" | "binance";