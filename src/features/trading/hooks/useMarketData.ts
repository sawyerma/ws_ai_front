import { useState, useEffect } from 'react';
import { TradingAPI } from '../../../services/api/trading';
import { MarketAPI } from '../../../services/api/market';
import { WhalesAPI } from '../../../services/api/whales';

export const useMarketHealth = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const healthData = await MarketAPI.getSystemHealth();
        setHealth(healthData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  return { health, loading, error };
};

export const useTicker = (exchange: string = 'binance', symbol?: string) => {
  const [ticker, setTicker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const tickerData = await TradingAPI.getTicker(exchange, symbol);
        setTicker(tickerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 2000); // 2s
    return () => clearInterval(interval);
  }, [exchange, symbol]);

  return { ticker, loading, error };
};

export const useOHLC = (
  symbol: string,
  interval: string = '1m',
  exchange: string = 'binance'
) => {
  const [ohlc, setOhlc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOHLC = async () => {
      try {
        const ohlcData = await TradingAPI.getOHLC(symbol, interval, exchange);
        setOhlc(ohlcData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchOHLC();
    const intervalId = setInterval(fetchOHLC, 5000); // 5s
    return () => clearInterval(intervalId);
  }, [symbol, interval, exchange]);

  return { ohlc, loading, error };
};

export const useWhaleEvents = (symbol?: string, limit: number = 100, timeframe: string = '24h') => {
  const [whales, setWhales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWhales = async () => {
      try {
        const whaleData = await WhalesAPI.getWhaleEvents(symbol, limit, timeframe);
        setWhales(Array.isArray(whaleData) ? whaleData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWhales();
    const interval = setInterval(fetchWhales, 10000); // 10s
    return () => clearInterval(interval);
  }, [symbol, limit, timeframe]);

  return { whales, loading, error };
};

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metricsData = await MarketAPI.getPerformanceMetrics();
        setMetrics(metricsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // 5s
    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
};
