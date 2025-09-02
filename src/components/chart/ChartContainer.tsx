// components/chart/ChartContainer.tsx - Haupt-Chart-Container (max 120 Zeilen)
import React, { useState, useRef, useCallback } from 'react';
import { ChartView } from './ChartView';
import { ChartWebSocket } from './ChartWebSocket';
import { ChartStatus } from './ChartStatus';
import { useMemoizedAggregations } from '../../hooks/use-memoized-calculations';

interface ChartContainerProps {
  symbol: string;
  market: string;
  interval: string;
  exchange: string;
  width?: number;
  height?: number;
  historicalData?: any[];
  isLoading?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  symbol,
  market,
  interval,
  exchange,
  width,
  height,
  historicalData,
  isLoading
}) => {
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<string | undefined>();
  const [candleCount, setCandleCount] = useState(0);
  const [candleData, setCandleData] = useState<any[]>([]);
  
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  
  // Memoized calculations for performance
  const chartStats = useMemoizedAggregations(candleData);

  // Handle chart ready
  const handleChartReady = useCallback((chart: any, series: any) => {
    chartRef.current = chart;
    seriesRef.current = series;
    
    // Update candle count from historical data
    if (historicalData) {
      setCandleCount(historicalData.length);
      setCandleData(historicalData.map(candle => ({
        time: Math.floor(new Date(candle.ts).getTime() / 1000),
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume || 0),
      })));
    }
  }, [historicalData]);

  // Handle WebSocket candle updates
  const handleCandleUpdate = useCallback((candleData: any) => {
    if (seriesRef.current) {
      seriesRef.current.update(candleData);
      setLastUpdate(new Date().toLocaleTimeString());
      
      // Update local candle data for stats
      setCandleData(prev => {
        const updated = [...prev];
        const lastIndex = updated.findIndex(c => c.time === candleData.time);
        if (lastIndex >= 0) {
          updated[lastIndex] = candleData;
        } else {
          updated.push(candleData);
        }
        return updated.sort((a, b) => a.time - b.time);
      });
    }
  }, []);

  // Handle WebSocket status changes
  const handleStatusChange = useCallback((status: typeof wsStatus) => {
    setWsStatus(status);
  }, []);

  return (
    <div className="relative w-full h-full">
      <ChartView
        symbol={symbol}
        market={market}
        interval={interval}
        exchange={exchange}
        width={width}
        height={height}
        historicalData={historicalData}
        isLoading={isLoading}
        onChartReady={handleChartReady}
      />
      
      <ChartWebSocket
        symbol={symbol}
        market={market}
        exchange={exchange}
        interval={interval}
        onCandleUpdate={handleCandleUpdate}
        onStatusChange={handleStatusChange}
      />
      
      <ChartStatus
        wsStatus={wsStatus}
        interval={interval}
        candleCount={candleCount}
        lastUpdate={lastUpdate}
        changePercent={chartStats?.changePercent}
        isLoading={isLoading}
      />
    </div>
  );
};