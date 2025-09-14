import { useState, useEffect } from 'react';
import { ChartData } from '../types/trading';
import { ChartAPI } from '../../../services/api/chart';

export const useChartData = (
  symbol: string,
  market: string,
  interval: string,
  exchange: string
) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol || !market || !interval || !exchange) {
      setData([]);
      return;
    }

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const historicalData = await ChartAPI.getHistoricalData(
          symbol,
          market,
          interval,
          exchange
        );
        setData(historicalData);
      } catch (err) {
        setError('Failed to fetch chart data.');
        console.error('Error fetching chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, market, interval, exchange]);

  return { data, loading, error };
};
