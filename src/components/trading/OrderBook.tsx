// OrderBook Component
// Unified orderbook display component

import React, { useEffect, useState } from 'react';
import { TradingAPI } from '../../services/api';
import { OrderBookEntry, Exchange } from '../../types';
import { PriceFormatter } from '../../services/utils';

interface OrderBookProps {
  symbol: string;
  market: string;
  exchange?: Exchange;
  limit?: number;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  symbol,
  market,
  exchange = 'bitget',
  limit = 15
}) => {
  const [orderbook, setOrderbook] = useState<{
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
  }>({ asks: [], bids: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchOrderbook = async () => {
      if (!symbol || !market) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await TradingAPI.getOrderBook(symbol, market, exchange);
        if (!isCancelled) {
          setOrderbook({
            asks: data.asks.slice(0, limit),
            bids: data.bids.slice(0, limit)
          });
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load orderbook');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrderbook();
    const interval = setInterval(fetchOrderbook, 2000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [symbol, market, exchange, limit]);

  const calculateTotal = (entries: OrderBookEntry[], index: number): number => {
    return entries.slice(0, index + 1).reduce((sum, entry) => sum + entry.size, 0);
  };

  const maxTotal = Math.max(
    orderbook.asks.length > 0 ? calculateTotal(orderbook.asks, orderbook.asks.length - 1) : 0,
    orderbook.bids.length > 0 ? calculateTotal(orderbook.bids, orderbook.bids.length - 1) : 0
  );

  return (
    <div className="orderbook-container">
      <div className="orderbook-header">
        Orderbook ({symbol})
        {loading && <span className="text-xs text-gray-400 ml-2">Loading...</span>}
        {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
      </div>
      
      <div className="grid grid-cols-3 gap-2 p-2 text-xs font-mono">
        <div className="text-center font-semibold">Price</div>
        <div className="text-center font-semibold">Size</div>
        <div className="text-center font-semibold">Total</div>
      </div>

      {/* Asks (Sells) */}
      <div className="asks-section">
        {orderbook.asks.slice().reverse().map((ask, index) => {
          const total = calculateTotal(orderbook.asks, orderbook.asks.length - 1 - index);
          const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
          
          return (
            <div 
              key={`ask-${index}`} 
              className="orderbook-row relative"
              style={{
                background: `linear-gradient(to right, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.1) ${percentage}%, transparent ${percentage}%)`
              }}
            >
              <div className="text-red-500">{PriceFormatter.formatPrice(ask.price)}</div>
              <div>{ask.size.toFixed(6)}</div>
              <div>{total.toFixed(6)}</div>
            </div>
          );
        })}
      </div>

      {/* Spread */}
      {orderbook.asks.length > 0 && orderbook.bids.length > 0 && (
        <div className="p-2 text-center text-xs bg-gray-100 dark:bg-gray-800">
          Spread: {PriceFormatter.formatPrice(orderbook.asks[0].price - orderbook.bids[0].price)}
        </div>
      )}

      {/* Bids (Buys) */}
      <div className="bids-section">
        {orderbook.bids.map((bid, index) => {
          const total = calculateTotal(orderbook.bids, index);
          const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
          
          return (
            <div 
              key={`bid-${index}`} 
              className="orderbook-row relative"
              style={{
                background: `linear-gradient(to right, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.1) ${percentage}%, transparent ${percentage}%)`
              }}
            >
              <div className="text-green-500">{PriceFormatter.formatPrice(bid.price)}</div>
              <div>{bid.size.toFixed(6)}</div>
              <div>{total.toFixed(6)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};