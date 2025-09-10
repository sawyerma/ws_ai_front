import { useEffect, useRef, useState } from 'react';
import { WebSocketService } from '../../../services/api/websocket';
import { ChartData, WebSocketMessage } from '../types/trading';

export const useChartWebSocket = (
  symbol: string,
  market: string,
  exchange: string,
  interval: string, // Assuming interval is needed for WebSocket connection
  onCandleUpdate: (candle: ChartData) => void
) => {
  const wsServiceRef = useRef<WebSocketService | null>(null);
  const [wsStatus, setWsStatus] = useState("disconnected");

  useEffect(() => {
    if (!symbol || !market || !exchange || !interval) {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
      setWsStatus("disconnected");
      return;
    }

    // Disconnect existing WebSocket if parameters change
    if (wsServiceRef.current) {
      wsServiceRef.current.disconnect();
    }

    const wsService = WebSocketService.getInstance();
    wsServiceRef.current = wsService;

    wsService.subscribe('connected', () => setWsStatus("connected"));
    wsService.subscribe('disconnected', () => setWsStatus("disconnected"));
    wsService.subscribe('error', () => setWsStatus("error"));
    
    wsService.subscribe('candle', (data: any) => {
      const candleData: ChartData = {
        time: Math.floor(new Date(data.timestamp).getTime() / 1000),
        open: Number(data.open),
        high: Number(data.high),
        low: Number(data.low),
        close: Number(data.close),
        volume: Number(data.volume || 0),
      };
      onCandleUpdate(candleData);
    });

    setWsStatus("connecting");
    wsService.connect(symbol, market, exchange);

    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
    };
  }, [symbol, market, exchange, interval, onCandleUpdate]);

  return { wsStatus };
};
