// components/chart/ChartWebSocket.tsx - NUR WebSocket-Logik (max 80 Zeilen)
import React, { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from '../../hooks/use-debounce';

interface ChartWebSocketProps {
  symbol: string;
  market: string;
  exchange: string;
  interval: string;
  onCandleUpdate?: (candle: any) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

export const ChartWebSocket: React.FC<ChartWebSocketProps> = ({
  symbol,
  market,
  exchange,
  interval,
  onCandleUpdate,
  onStatusChange
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // Debounced candle update
  const debouncedCandleUpdate = useDebouncedCallback((candleData: any) => {
    if (onCandleUpdate) {
      onCandleUpdate(candleData);
    }
  }, 50);

  // Update status and notify parent
  const updateStatus = (newStatus: typeof status) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  useEffect(() => {
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    updateStatus('connecting');

    // Create WebSocket connection
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/${exchange}/${symbol}/${market}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[ChartWebSocket] Connected:", wsUrl);
      updateStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "candle" && msg.data) {
          const candleData = {
            time: Math.floor(new Date(msg.data.timestamp).getTime() / 1000),
            open: Number(msg.data.open),
            high: Number(msg.data.high),
            low: Number(msg.data.low),
            close: Number(msg.data.close),
            volume: Number(msg.data.volume || 0),
          };
          
          debouncedCandleUpdate(candleData);
        }
      } catch (e) {
        console.warn("[ChartWebSocket] Parse error:", event.data, e);
      }
    };

    ws.onerror = (e) => {
      console.error("[ChartWebSocket] Error:", e);
      updateStatus('error');
    };

    ws.onclose = (event) => {
      console.log("[ChartWebSocket] Closed:", event.code, event.reason);
      updateStatus('disconnected');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol, market, exchange, interval]);

  return null; // This component doesn't render anything
};