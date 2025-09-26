import { useState, useEffect, useCallback } from 'react';
import { TradingAPI } from '../../../services/api';

// 🎯 STRATEGY MANAGEMENT HOOKS
export const useStrategies = (exchange = 'binance', autoRefresh = true) => {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStrategies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await TradingAPI.getStrategies(exchange) as any;
      setStrategies(response?.strategies || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch strategies');
    } finally {
      setLoading(false);
    }
  }, [exchange]);

  useEffect(() => {
    fetchStrategies();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStrategies, 30000); // 30s
      return () => clearInterval(interval);
    }
  }, [fetchStrategies, autoRefresh]);

  const createStrategy = useCallback(async (strategyData: any) => {
    const result = await TradingAPI.createStrategy(strategyData);
    await fetchStrategies(); // Refresh list
    return result;
  }, [fetchStrategies]);

  const updateStrategy = useCallback(async (strategyId: string, updates: any) => {
    const result = await TradingAPI.updateStrategy(strategyId, updates);
    await fetchStrategies(); // Refresh list
    return result;
  }, [fetchStrategies]);

  const deleteStrategy = useCallback(async (strategyId: string) => {
    await TradingAPI.deleteStrategy(strategyId);
    await fetchStrategies(); // Refresh list
  }, [fetchStrategies]);

  return {
    strategies,
    loading,
    error,
    refresh: fetchStrategies,
    createStrategy,
    updateStrategy,
    deleteStrategy
  };
};

// 🔧 GRID TRADING HOOKS
export const useGridTrading = () => {
  const [gridLevels, setGridLevels] = useState(null);
  const [activeGrids, setActiveGrids] = useState([]);
  const [calculating, setCalculating] = useState(false);

  const calculateLevels = useCallback(async (symbol: string, exchange: string, gridConfig: any) => {
    setCalculating(true);
    try {
      const response = await TradingAPI.calculateGridLevels(symbol, exchange, gridConfig) as any;
      setGridLevels(response.levels);
      return response;
    } finally {
      setCalculating(false);
    }
  }, []);

  const createGrid = useCallback(async (gridData: any) => {
    const result = await TradingAPI.createGridStrategy(gridData);
    // Refresh active grids
    fetchActiveGrids();
    return result;
  }, []);

  const fetchActiveGrids = useCallback(async () => {
    try {
      const response = await TradingAPI.getActivePositions() as any;
      const grids = response.positions?.filter((p: any) => p.strategy_type === 'grid') || [];
      setActiveGrids(grids);
    } catch (err) {
      console.error('Failed to fetch active grids:', err);
    }
  }, []);

  useEffect(() => {
    fetchActiveGrids();
    const interval = setInterval(fetchActiveGrids, 15000); // 15s
    return () => clearInterval(interval);
  }, [fetchActiveGrids]);

  return {
    gridLevels,
    activeGrids,
    calculating,
    calculateLevels,
    createGrid,
    refresh: fetchActiveGrids
  };
};

// ⚠️ RISK MANAGEMENT HOOKS
export const useRiskManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await TradingAPI.getRiskAlerts() as any;
      setAlerts(response.alerts || []);
    } catch (err) {
      console.error('Failed to fetch risk alerts:', err);
    }
  }, []);

  const fetchSystemStatus = useCallback(async () => {
    try {
      const response = await TradingAPI.getSystemStatus() as any;
      setSystemStatus(response);
    } catch (err) {
      console.error('Failed to fetch system status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchSystemStatus();
    
    const interval = setInterval(() => {
      fetchAlerts();
      fetchSystemStatus();
    }, 10000); // 10s for critical monitoring
    
    return () => clearInterval(interval);
  }, [fetchAlerts, fetchSystemStatus]);

  const emergencyStop = useCallback(async (reason: string) => {
    const result = await TradingAPI.emergencyStopAll(reason);
    await fetchSystemStatus(); // Refresh status
    return result;
  }, [fetchSystemStatus]);

  return {
    alerts,
    systemStatus,
    loading,
    refresh: () => {
      fetchAlerts();
      fetchSystemStatus();
    },
    emergencyStop
  };
};

// 💰 PORTFOLIO TRACKING HOOKS
export const usePortfolioTracking = (exchange: string, timeframe = '24h') => {
  const [metrics, setMetrics] = useState(null);
  const [balance, setBalance] = useState(null);
  const [pnl, setPnl] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolioData = useCallback(async () => {
    if (!exchange) return;
    
    try {
      setLoading(true);
      const [metricsRes, balanceRes, pnlRes] = await Promise.all([
        TradingAPI.getPortfolioMetrics(exchange, timeframe) as any,
        TradingAPI.getPortfolioBalance(exchange) as any,
        TradingAPI.getPnLReport(exchange, undefined, timeframe) as any
      ]);
      
      setMetrics(metricsRes);
      setBalance(balanceRes);
      setPnl(pnlRes);
    } catch (err) {
      console.error('Failed to fetch portfolio data:', err);
    } finally {
      setLoading(false);
    }
  }, [exchange, timeframe]);

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 30000); // 30s
    return () => clearInterval(interval);
  }, [fetchPortfolioData]);

  return {
    metrics,
    balance,
    pnl,
    loading,
    refresh: fetchPortfolioData
  };
};

// 🎯 SETTINGS INTEGRATION HOOKS (Nutzt Enterprise-Backend)
export const useTradingSettings = (exchange: string) => {
  const [settings, setSettings] = useState(null);
  const [rateLimits, setRateLimits] = useState(null);
  const [wsConfig, setWsConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!exchange) return;
      
      try {
        const [settingsRes, limitsRes, wsRes] = await Promise.all([
          TradingAPI.getTradingSettings(exchange) as any,
          TradingAPI.getExchangeRateLimits(exchange) as any,
          TradingAPI.getWebSocketConfig(exchange) as any
        ]);
        
        setSettings(settingsRes);
        setRateLimits(limitsRes);
        setWsConfig(wsRes);
      } catch (err) {
        console.error('Failed to fetch trading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [exchange]);

  return { settings, rateLimits, wsConfig, loading };
};
