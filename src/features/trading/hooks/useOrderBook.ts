import { useState, useEffect } from 'react';
import { TradingAPI } from '../../../services/api/trading';
import { OrderBookEntry } from '../types/trading';

export const useOrderBook = (
  symbol: string,
  market: string,
  exchange: string,
  limit: number = 15
) => {
  const [orderbook, setOrderbook] = useState<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }>({ asks: [], bids: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol || !market || !exchange) {
      setOrderbook({ asks: [], bids: [] });
      return;
    }

    const fetchOrderBookData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await TradingAPI.getOrderBook(symbol, market, exchange, limit);
        setOrderbook(data);
      } catch (err) {
        setError('Failed to fetch orderbook data.');
        console.error('Error fetching orderbook data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBookData();
    const interval = setInterval(fetchOrderBookData, 2000); // Refresh every 2s

    return () => clearInterval(interval);
  }, [symbol, market, exchange, limit]);

  return { orderbook, loading, error };
};
