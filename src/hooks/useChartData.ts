// Chart Data Hook
// Manages chart data fetching and state

import { useState, useEffect, useMemo } from 'react';
import { TradingAPI } from '../services/api';
import { Exchange, ChartData } from '../types';

export const useChartData = (
  symbol: string,
  market: string,
  interval: string,
  exchange: Exchange,
  historicalData?: any[]
) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Memoized calculations
  const candleCount = useMemo(() => chartData.length, [chartData]);
  
  const chartStats = useMemo(() => {
    if (chartData.length === 0) return { high: 0, low: 0, volume: 0 };
    
    const high = Math.max(...chartData.map(c => c.high));
    const low = Math.min(...chartData.map(c => c.low));
    const volume = chartData.reduce((sum, c) => sum + (c.volume || 0), 0);
    
    return { high, low, volume };
  }, [chartData]);

  // Load historical data
  useEffect(() => {
    let isCancelled = false;

    const loadChartData = async () => {
      if (!symbol || !market || !interval) return;

      setLoading(true);
      setError(null);

      try {
        // Use provided historical data or fetch from API
        if (historicalData && historicalData.length > 0) {
          const transformedData = transformHistoricalData(historicalData);
          if (!isCancelled) {
            setChartData(transformedData);
            setLastUpdate(new Date());
          }
        } else {
          const candles = await TradingAPI.getCandles(symbol, market, interval, exchange);
          const transformedData = transformApiData(candles);
          if (!isCancelled) {
            setChartData(transformedData);
            setLastUpdate(new Date());
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load chart data');
          console.error('Chart data loading error:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadChartData();

    return () => {
      isCancelled = true;
    };
  }, [symbol, market, interval, exchange, historicalData]);

  // Transform historical data to chart format
  const transformHistoricalData = (data: any[]): ChartData[] => {
    return data.map(item => ({
      time: Math.floor(new Date(item.ts || item.timestamp).getTime() / 1000),
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close),
      volume: Number(item.volume || 0),
    })).sort((a, b) => a.time - b.time);
  };

  // Transform API data to chart format
  const transformApiData = (data: any[]): ChartData[] => {
    return data.map(item => ({
      time: Math.floor((item.timestamp || item.time) / 1000),
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close),
      volume: Number(item.volume || 0),
    })).sort((a, b) => a.time - b.time);
  };

  // Update single candle
  const updateCandle = (newCandle: any) => {
    const transformedCandle: ChartData = {
      time: Math.floor(new Date(newCandle.ts || newCandle.timestamp).getTime() / 1000),
      open: Number(newCandle.open),
      high: Number(newCandle.high),
      low: Number(newCandle.low),
      close: Number(newCandle.close),
      volume: Number(newCandle.volume || 0),
    };

    setChartData(prev => {
      const lastCandle = prev[prev.length - 1];
      if (lastCandle && lastCandle.time === transformedCandle.time) {
        // Update existing candle
        return [...prev.slice(0, -1), transformedCandle];
      } else {
        // Add new candle
        return [...prev, transformedCandle];
      }
    });
    
    setLastUpdate(new Date());
  };

  return {
    chartData,
    loading,
    error,
    candleCount,
    chartStats,
    lastUpdate,
    updateCandle,
  };
};