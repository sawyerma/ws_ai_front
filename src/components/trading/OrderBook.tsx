// components/trading/OrderBook.tsx - EINE einzige Orderbook-Komponente (max 100 Zeilen)
import React, { useState, useEffect } from 'react';
import { OrderBookEntry } from '../../types';
import { TradingAPI } from '../../services/api';
import { PriceFormatter } from '../../services/utils';

interface OrderBookProps {
  symbol: string;
  market: string;
  exchange: string;
  limit?: number;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  symbol,
  market,
  exchange,
  limit = 15
}) => {
  const [orders, setOrders] = useState<{ bids: OrderBookEntry[], asks: OrderBookEntry[] }>({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await TradingAPI.getOrderBook(symbol, market, limit);
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orderbook');
        
        // Fallback to dummy data
        setOrders({
          bids: [
            { price: 43250.00, size: 0.5, side: 'buy' },
            { price: 43249.50, size: 1.2, side: 'buy' },
            { price: 43249.00, size: 0.8, side: 'buy' },
          ],
          asks: [
            { price: 43251.00, size: 0.7, side: 'sell' },
            { price: 43251.50, size: 1.1, side: 'sell' },
            { price: 43252.00, size: 0.9, side: 'sell' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBook();
  }, [symbol, market, exchange, limit]);

  const spread = orders.asks[0]?.price && orders.bids[0]?.price 
    ? orders.asks[0].price - orders.bids[0].price 
    : 0;

  if (loading) {
    return (
      <div className="orderbook-container">
        <div className="orderbook-header">Order Book</div>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="orderbook-container">
      <div className="orderbook-header">
        Order Book
        {error && (
          <span className="text-red-500 text-xs ml-2">
            Error
          </span>
        )}
      </div>
      
      {/* Asks (Sell Orders) */}
      <div className="orderbook-section">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Asks (Sell)</div>
        {orders.asks.slice().reverse().map((order, index) => (
          <div key={index} className="orderbook-row">
            <span className="text-red-500 font-mono">
              {PriceFormatter.formatPrice(order.price)}
            </span>
            <span className="text-gray-600 dark:text-gray-300 font-mono">
              {order.size.toFixed(3)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
              {(order.price * order.size).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="px-4 py-2 border-t border-b border-gray-200 dark:border-gray-600">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Spread: {PriceFormatter.formatPrice(spread)}
        </div>
      </div>

      {/* Bids (Buy Orders) */}
      <div className="orderbook-section">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Bids (Buy)</div>
        {orders.bids.map((order, index) => (
          <div key={index} className="orderbook-row">
            <span className="text-green-500 font-mono">
              {PriceFormatter.formatPrice(order.price)}
            </span>
            <span className="text-gray-600 dark:text-gray-300 font-mono">
              {order.size.toFixed(3)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-mono text-xs">
              {(order.price * order.size).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};