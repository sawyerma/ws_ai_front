// components/chart/ChartView.tsx - NUR Chart-Rendering (max 120 Zeilen)
import React, { useRef, useEffect } from 'react';
import { ChartData } from '../../types';
import { useChartTheme } from '../../hooks/useChartTheme';

interface ChartViewProps {
  symbol: string;
  market: string;
  interval: string;
  exchange: string;
  width?: number;
  height?: number;
  historicalData?: any[];
  isLoading?: boolean;
  onChartReady?: (chart: any, series: any) => void;
}

export const ChartView: React.FC<ChartViewProps> = ({
  symbol,
  market,
  interval,
  exchange,
  width = 800,
  height = 400,
  historicalData,
  isLoading,
  onChartReady
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  
  const { theme, isDarkMode } = useChartTheme();

  // Interval mapping for bar spacing
  const getBarSpacing = (interval: string): number => {
    const spacing: Record<string, number> = {
      '1s': 2, '5s': 2, '15s': 3, '1m': 4, '5m': 6,
      '15m': 8, '1h': 10, '4h': 15, '1d': 20
    };
    return spacing[interval] || 4;
  };

  // Initialize chart
  useEffect(() => {
    const container = chartRef.current;
    if (!container || !window.LightweightCharts) return;

    // Clean up existing chart
    if (chartInstance.current) {
      chartInstance.current.remove();
      chartInstance.current = null;
      seriesRef.current = null;
      volumeSeriesRef.current = null;
      isInitializedRef.current = false;
    }

    // Get container size
    const containerRect = container.getBoundingClientRect();
    const chartWidth = Math.max(containerRect.width || width, 300);
    const chartHeight = Math.max(containerRect.height || height, 200);

    // Create chart
    const chart = window.LightweightCharts.createChart(container, {
      width: chartWidth,
      height: chartHeight,
      layout: {
        background: { type: "Solid", color: theme.backgroundColor },
        textColor: theme.textColor,
      },
      grid: {
        vertLines: { color: theme.gridColor },
        horzLines: { color: theme.gridColor },
      },
      timeScale: {
        visible: true,
        timeVisible: true,
        secondsVisible: interval.includes('s'),
        rightOffset: 12,
        barSpacing: getBarSpacing(interval),
        borderColor: theme.textColor,
      },
      rightPriceScale: {
        visible: true,
        scaleMargins: { top: 0.1, bottom: 0.1 },
        borderVisible: false,
        textColor: theme.textColor,
      },
      autoSize: false,
    });

    chartInstance.current = chart;

    // Add candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: theme.upCandleColor,
      downColor: theme.downCandleColor,
      borderUpColor: theme.upCandleColor,
      borderDownColor: theme.downCandleColor,
      wickUpColor: theme.upWickColor,
      wickDownColor: theme.downWickColor,
      borderVisible: false,
    });
    seriesRef.current = candleSeries;
    isInitializedRef.current = true;

    // Load historical data
    if (historicalData && seriesRef.current) {
      const formattedCandles = historicalData.map(candle => ({
        time: Math.floor(new Date(candle.ts).getTime() / 1000),
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume || 0),
      })).sort((a, b) => a.time - b.time);

      seriesRef.current.setData(formattedCandles);
    }

    // Notify parent about chart readiness
    if (onChartReady) {
      onChartReady(chart, candleSeries);
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
        seriesRef.current = null;
        volumeSeriesRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [symbol, market, interval, theme]);

  return (
    <div className="relative flex flex-col justify-center items-center w-full h-full bg-white dark:bg-gray-800 transition-colors">
      {isLoading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-900 dark:text-white text-sm">Loading chart data...</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{symbol} • {market.toUpperCase()} • {interval}</div>
          </div>
        </div>
      )}

      <div
        ref={chartRef}
        className="w-full h-full"
        style={{
          minWidth: "300px",
          minHeight: "200px",
          border: "1px solid",
          borderColor: isDarkMode ? "#374151" : "#e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </div>
  );
};