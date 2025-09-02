// Chart View Component
// Main chart rendering component with clean, focused responsibilities

import React, { useEffect, useRef, useState } from 'react';
import { useChartData } from '../../hooks/useChartData';
import { useChartTheme } from '../../hooks/useChartTheme';
import { useChartWebSocket } from '../../hooks/useChartWebSocket';
import { Exchange } from '../../types';

interface ChartViewProps {
  symbol: string;
  market: string;
  interval: string;
  exchange: Exchange;
  width?: number;
  height?: number;
  historicalData?: any[];
  isLoading?: boolean;
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
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  
  // Use custom hooks for data management
  const { chartData, candleCount, lastUpdate } = useChartData(
    symbol, 
    market, 
    interval, 
    exchange, 
    historicalData
  );
  
  const { theme, settings, updateChartTheme } = useChartTheme();
  
  const { wsStatus, isConnected } = useChartWebSocket(
    symbol,
    market,
    exchange,
    interval,
    (newCandle) => {
      if (seriesRef.current) {
        seriesRef.current.update(newCandle);
      }
    }
  );

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current || !window.LightweightCharts) return;

    try {
      // Create chart instance
      chartInstance.current = window.LightweightCharts.createChart(chartRef.current, {
        width,
        height,
        layout: theme.layout,
        grid: theme.grid,
        crosshair: { mode: settings.crosshairVisible ? 1 : 0 },
        timeScale: {
          visible: settings.timeScaleVisible,
          timeVisible: true,
          secondsVisible: interval.includes('s'),
          rightOffset: 12,
          barSpacing: getBarSpacing(interval),
          fixLeftEdge: false,
          lockVisibleTimeRangeOnResize: true,
          borderColor: theme.layout.textColor,
        },
        rightPriceScale: {
          visible: settings.priceScaleVisible,
          scaleMargins: { top: 0.1, bottom: 0.1 },
          borderVisible: false,
          textColor: theme.layout.textColor,
        },
      });

      // Create candlestick series
      seriesRef.current = chartInstance.current.addCandlestickSeries({
        upColor: theme.candleColors.upColor,
        downColor: theme.candleColors.downColor,
        wickUpColor: theme.candleColors.wickUpColor,
        wickDownColor: theme.candleColors.wickDownColor,
        borderVisible: theme.candleColors.borderVisible,
      });

      // Create volume series if enabled
      if (settings.volumeVisible) {
        volumeSeriesRef.current = chartInstance.current.addHistogramSeries({
          color: '#26a69a',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
      }

      isInitializedRef.current = true;
      console.log('[ChartView] Chart initialized with colors:', theme.candleColors);

    } catch (error) {
      console.error('[ChartView] Error initializing chart:', error);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
        seriesRef.current = null;
        volumeSeriesRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (chartData && chartData.length > 0 && seriesRef.current) {
      seriesRef.current.setData(chartData);
      
      if (volumeSeriesRef.current && settings.volumeVisible) {
        const volumeData = chartData.map(candle => ({
          time: candle.time,
          value: candle.volume || 0,
          color: candle.close >= candle.open ? theme.candleColors.upColor : theme.candleColors.downColor,
        }));
        volumeSeriesRef.current.setData(volumeData);
      }
    }
  }, [chartData, settings.volumeVisible]);

  // Update chart theme
  useEffect(() => {
    updateChartTheme(chartInstance.current, seriesRef.current, volumeSeriesRef.current);
  }, [theme, settings, updateChartTheme]);

  // Handle resize
  useEffect(() => {
    if (!chartInstance.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !chartRef.current) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      chartInstance.current.applyOptions({ width: newWidth, height: newHeight });
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Utility function for bar spacing
  const getBarSpacing = (interval: string): number => {
    const spacingMap: Record<string, number> = {
      '1s': 2, '5s': 3, '15s': 3, '30s': 4,
      '1m': 4, '5m': 6, '15m': 8, '30m': 10,
      '1h': 12, '4h': 16, '1d': 20
    };
    return spacingMap[interval] || 4;
  };

  return (
    <div className="chart-container">
      {/* Chart Status Bar */}
      <div className="chart-status-bar">
        <span className={`status-indicator ${isConnected ? 'connected' : 'error'}`}></span>
        <span>{wsStatus === 'connected' ? 'Live' : 'Connecting...'}</span>
        <span>|</span>
        <span>{interval}</span>
        <span>|</span>
        <span>{candleCount} candles</span>
      </div>
      
      {/* Chart Canvas */}
      <div 
        ref={chartRef} 
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Loading overlay */}
      {(isLoading || !chartData.length) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">Loading chart data...</div>
        </div>
      )}
    </div>
  );
};