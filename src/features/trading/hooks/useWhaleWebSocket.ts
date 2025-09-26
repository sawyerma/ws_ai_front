import { useState, useEffect, useCallback } from 'react';
import { WhalesAPI, whaleWebSocketManager } from '../../../services/api/whales';

// 🐋 WHALE WEBSOCKET HOOK
export const useWhaleWebSocket = (symbol?: string, autoConnect = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [whaleEvents, setWhaleEvents] = useState<any[]>([]);
  const [whaleAlerts, setWhaleAlerts] = useState<any[]>([]);
  const [latestEvent, setLatestEvent] = useState<any>(null);

  const addWhaleEvent = useCallback((event: any) => {
    setLatestEvent(event);
    setWhaleEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
  }, []);

  const addWhaleAlert = useCallback((alert: any) => {
    setWhaleAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
  }, []);

  useEffect(() => {
    if (!autoConnect) return;

    // Connect to WebSocket
    WhalesAPI.connectWebSocket();

    // Subscribe to events
    if (symbol) {
      WhalesAPI.subscribeToWhaleEvents(symbol, addWhaleEvent);
    }
    
    WhalesAPI.subscribeToWhaleAlerts(addWhaleAlert);

    // Connection status monitoring
    const checkConnection = () => {
      setIsConnected(whaleWebSocketManager.ws?.readyState === WebSocket.OPEN);
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => {
      clearInterval(interval);
      if (symbol) {
        WhalesAPI.unsubscribeFromSymbol(symbol);
      }
    };
  }, [symbol, autoConnect, addWhaleEvent, addWhaleAlert]);

  const subscribeToSymbol = useCallback((newSymbol: string) => {
    WhalesAPI.subscribeToWhaleEvents(newSymbol, addWhaleEvent);
  }, [addWhaleEvent]);

  const unsubscribeFromSymbol = useCallback((symbolToRemove: string) => {
    WhalesAPI.unsubscribeFromSymbol(symbolToRemove);
  }, []);

  return {
    isConnected,
    whaleEvents,
    whaleAlerts,
    latestEvent,
    subscribeToSymbol,
    unsubscribeFromSymbol,
    connect: () => WhalesAPI.connectWebSocket(),
    disconnect: () => WhalesAPI.disconnectWebSocket()
  };
};

// 🚨 WHALE ALERTS HOOK
export const useWhaleAlerts = (filters?: {
  minAmount?: number;
  symbols?: string[];
  alertTypes?: string[];
}) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    WhalesAPI.connectWebSocket();

    const handleAlert = (alert: any) => {
      // Apply filters if provided
      if (filters) {
        if (filters.minAmount && alert.amount < filters.minAmount) return;
        if (filters.symbols && !filters.symbols.includes(alert.symbol)) return;
        if (filters.alertTypes && !filters.alertTypes.includes(alert.type)) return;
      }
      
      setAlerts(prev => [alert, ...prev.slice(0, 99)]);
      setUnreadCount(prev => prev + 1);
    };

    WhalesAPI.subscribeToWhaleAlerts(handleAlert);

    return () => {
      WhalesAPI.disconnectWebSocket();
    };
  }, [filters]);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    alerts,
    unreadCount,
    isConnected,
    markAsRead
  };
};
