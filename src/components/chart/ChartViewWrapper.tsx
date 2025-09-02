// components/chart/ChartViewWrapper.tsx - Compatibility wrapper for testing
import React from 'react';
import { ChartContainer } from './ChartContainer';

// Compatibility wrapper with exact same props as original ChartView.jsx
interface ChartViewWrapperProps {
  wsUrl?: string;
  width?: number;
  height?: number;
  symbol?: string;
  market?: string;
  exchange?: string;
  interval?: string;
  historicalData?: any[];
  isLoading?: boolean;
}

export const ChartViewWrapper: React.FC<ChartViewWrapperProps> = ({
  width = 800,
  height = 400,
  symbol = "BTCUSDT",
  market = "spot",
  exchange = "bitget",
  interval = "1m",
  historicalData,
  isLoading
}) => {
  return (
    <ChartContainer
      symbol={symbol}
      market={market}
      interval={interval}
      exchange={exchange}
      width={width}
      height={height}
      historicalData={historicalData}
      isLoading={isLoading}
    />
  );
};

// Default export for compatibility
export default ChartViewWrapper;