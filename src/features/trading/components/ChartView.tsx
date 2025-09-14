import React, { useEffect, useRef, useState } from "react";
import { useChartTheme } from '../hooks/useChartTheme';
import { useWebSocket } from '../hooks/useWebSocket';
import { ChartData } from '../types/trading';
import { WebSocketService, ChartAPI } from "../../../services/api";

declare const LightweightCharts: any;

interface ChartViewProps {
  symbol: string;
  market: string;
  exchange: string;
  interval: string;
  historicalData?: ChartData[];
  isLoading?: boolean;
}

const ChartView: React.FC<ChartViewProps> = ({
  symbol,
  market,
  exchange,
  interval,
  historicalData,
  isLoading: isLoadingProp,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  const [liveCandle, setLiveCandle] = useState<ChartData | null>(null);

  const { chartSettings, getChartTheme } = useChartTheme();

  // Connect to WebSocket and subscribe to candle updates
  useWebSocket('candle', (candle: ChartData) => {
    setLiveCandle(candle);
  });
  
  useEffect(() => {
    const wsService = WebSocketService.getInstance();
    wsService.connect(symbol, market, exchange);
    
    return () => {
      // Don't disconnect here as other components might be using it
      // WebSocketService manages connection lifecycle
    };
  }, [symbol, market, exchange]);


  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || typeof LightweightCharts === 'undefined') return;

    const theme = getChartTheme();
    chartInstance.current = LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: container.clientHeight,
        layout: theme.layout,
        grid: theme.grid,
        timeScale: { borderColor: theme.layout.textColor, timeVisible: true, secondsVisible: interval.includes('s') },
        rightPriceScale: { borderColor: theme.layout.textColor },
    });
    seriesRef.current = chartInstance.current.addCandlestickSeries(theme.candleColors);

    if (chartSettings.volumeVisible) {
        volumeSeriesRef.current = chartInstance.current.addHistogramSeries({ color: 'var(--color-buy)', priceFormat: { type: 'volume' }, priceScaleId: '', scaleMargins: { top: 0.8, bottom: 0 } });
    }

    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width, height } = entries[0].contentRect;
            chartInstance.current.applyOptions({ width, height });
        }
    });
    resizeObserver.observe(container);

    return () => {
        resizeObserver.disconnect();
        chartInstance.current.remove();
    };
  }, [getChartTheme, interval, chartSettings.volumeVisible]);

  useEffect(() => {
	if (historicalData && seriesRef.current) {
		const formattedData = historicalData.map(d => ({ ...d, time: d.time / 1000 }));
		seriesRef.current.setData(formattedData);
		if (volumeSeriesRef.current) {
			const volumeData = formattedData.map(candle => ({ time: candle.time, value: candle.volume, color: candle.close >= candle.open ? 'var(--color-buy)' : 'var(--color-sell)' }));
			volumeSeriesRef.current.setData(volumeData);
		}
	}
  }, [historicalData]);
  
  useEffect(() => {
    if (liveCandle && seriesRef.current) {
      seriesRef.current.update(liveCandle);
    }
    if (liveCandle && volumeSeriesRef.current) {
      volumeSeriesRef.current.update({ time: liveCandle.time, value: liveCandle.volume, color: liveCandle.close >= liveCandle.open ? 'var(--color-buy)' : 'var(--color-sell)' });
    }
  }, [liveCandle]);


  return (
    <div className="chart-container bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-600 h-full w-full overflow-hidden">
      {/* Chart Container - No Header, just pure chart like in original */}
      <div className="relative w-full h-full">
        <div ref={chartContainerRef} className="chart-container w-full h-full" />
        {isLoadingProp && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartView;
