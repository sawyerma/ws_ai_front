// Chart WebSocket Hook
// Manages WebSocket connection for real-time chart data

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketService } from '../services/api';
import { Exchange } from '../types';

export const useChartWebSocket = (
  symbol: string,
  market: string,
  exchange: Exchange,
  interval: string,
  onCandleUpdate?: (candle: any) => void
) => {
  const [wsStatus, setWsStatus] = useState<string>('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  
  const wsService = useRef<WebSocketService | null>(null);
  const shouldConnect = useRef(true);

  // Initialize WebSocket service
  useEffect(() => {
    wsService.current = new WebSocketService();
    
    return () => {
      shouldConnect.current = false;
      if (wsService.current) {
        wsService.current.disconnect();
      }
    };
  }, []);

  // Set up WebSocket connection
  useEffect(() => {
    if (!wsService.current || !symbol || !market || !shouldConnect.current) return;

    const ws = wsService.current;

    // Connection handlers
    const handleConnected = (data: any) => {
      console.log('[ChartWebSocket] Connected:', data);
      setWsStatus('connected');
      setIsConnected(true);
      setReconnectCount(0);
    };

    const handleDisconnected = (data: any) => {
      console.log('[ChartWebSocket] Disconnected:', data);
      setWsStatus('disconnected');
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      console.error('[ChartWebSocket] Error:', error);
      setWsStatus('error');
      setIsConnected(false);
    };

    const handleCandle = (candleData: any) => {
      setLastMessage(candleData);
      if (onCandleUpdate) {
        onCandleUpdate(candleData);
      }
    };

    const handleTrade = (tradeData: any) => {
      // Handle real-time trades if needed
      setLastMessage(tradeData);
    };

    const handleMaxReconnectAttemptsReached = () => {
      console.warn('[ChartWebSocket] Max reconnect attempts reached');
      setWsStatus('failed');
      setIsConnected(false);
    };

    // Subscribe to events
    ws.subscribe('connected', handleConnected);
    ws.subscribe('disconnected', handleDisconnected);
    ws.subscribe('error', handleError);
    ws.subscribe('candle', handleCandle);
    ws.subscribe('trade', handleTrade);
    ws.subscribe('maxReconnectAttemptsReached', handleMaxReconnectAttemptsReached);

    // Connect
    setWsStatus('connecting');
    ws.connect(symbol, market, exchange);

    return () => {
      ws.unsubscribe('connected', handleConnected);
      ws.unsubscribe('disconnected', handleDisconnected);
      ws.unsubscribe('error', handleError);
      ws.unsubscribe('candle', handleCandle);
      ws.unsubscribe('trade', handleTrade);
      ws.unsubscribe('maxReconnectAttemptsReached', handleMaxReconnectAttemptsReached);
    };
  }, [symbol, market, exchange, onCandleUpdate]);

  // Handle interval changes - reconnect if needed
  useEffect(() => {
    if (wsService.current && isConnected) {
      // Reconnect with new interval
      wsService.current.disconnect();
      setTimeout(() => {
        if (wsService.current && shouldConnect.current) {
          setWsStatus('connecting');
          wsService.current.connect(symbol, market, exchange);
        }
      }, 100);
    }
  }, [interval]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (wsService.current && shouldConnect.current) {
      setReconnectCount(prev => prev + 1);
      setWsStatus('connecting');
      wsService.current.disconnect();
      setTimeout(() => {
        if (wsService.current && shouldConnect.current) {
          wsService.current.connect(symbol, market, exchange);
        }
      }, 1000);
    }
  }, [symbol, market, exchange]);

  // Disconnect function
  const disconnect = useCallback(() => {
    shouldConnect.current = false;
    if (wsService.current) {
      wsService.current.disconnect();
    }
    setWsStatus('disconnected');
    setIsConnected(false);
  }, []);

  // Get connection state
  const getConnectionState = useCallback(() => {
    return wsService.current?.getConnectionState() || 'disconnected';
  }, []);

  return {
    wsStatus,
    isConnected,
    lastMessage,
    reconnectCount,
    reconnect,
    disconnect,
    getConnectionState,
  };
};