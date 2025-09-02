// Chart-specific Type Definitions

export interface ChartTheme {
  upColor: string;
  downColor: string;
  wickUpColor: string;
  wickDownColor: string;
  backgroundColor: string;
  gridColor: string;
}

export interface ChartIndicator {
  id: string;
  name: string;
  type: string;
  params?: Record<string, any>;
  visible: boolean;
}

export interface ChartSettings {
  theme: ChartTheme;
  indicators: ChartIndicator[];
  timeframe: string;
  barSpacing: number;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}