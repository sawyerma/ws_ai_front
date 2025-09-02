// Market Trades Component
// Real-time market trades display

import React, { useEffect, useState } from 'react';
import { TradingAPI, WebSocketService } from '../../services/api';
import { Trade, Exchange } from '../../types';
import { PriceFormatter, TimeFormatter } from '../../services/utils';

interface MarketTradesProps {
  symbol: string;
  market: string;
  exchange?: Exchange;
  maxLength?: number;
}

export const MarketTrades: React.FC<MarketTradesProps> = ({
  symbol,
  market,
  exchange = 'bitget',
  maxLength = 30
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial trades
  useEffect(() => {
    let isCancelled = false;

    const loadInitialTrades = async () => {
      if (!symbol || !market) return;

      setLoading(true);
      setError(null);

      try {
        const initialTrades = await TradingAPI.getTrades(symbol, market, exchange);
        if (!isCancelled) {
          setTrades(initialTrades.slice(0, maxLength));
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load trades');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialTrades();

    return () => {
      isCancelled = true;
    };
  }, [symbol, market, exchange, maxLength]);

  // WebSocket connection for real-time trades
  useEffect(() => {
    if (!symbol || !market) return;

    const wsService = new WebSocketService();

    const handleConnected = () => {
      setWsStatus('connected');
    };

    const handleDisconnected = () => {
      setWsStatus('disconnected');
    };

    const handleError = () => {
      setWsStatus('error');
    };

    const handleTrade = (tradeData: any) => {
      const newTrade: Trade = {
        id: tradeData.id || Date.now().toString(),
        price: Number(tradeData.price),
        size: Number(tradeData.size),
        time: tradeData.time || new Date().toISOString(),
        side: tradeData.side || 'buy',
        ts: tradeData.ts || new Date().toISOString(),
      };

      setTrades(prev => {
        const updated = [newTrade, ...prev];
        return updated.slice(0, maxLength);
      });
    };

    wsService.subscribe('connected', handleConnected);
    wsService.subscribe('disconnected', handleDisconnected);
    wsService.subscribe('error', handleError);
    wsService.subscribe('trade', handleTrade);

    setWsStatus('connecting');
    wsService.connect(symbol, market, exchange);

    return () => {
      wsService.disconnect();
    };
  }, [symbol, market, exchange, maxLength]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'error': return 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200';
      default: return 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="trades-container">
      <div className="trades-header">
        <span>Market Trades ({symbol})</span>
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(wsStatus)}`}>
          {wsStatus}
        </span>
      </div>

      {loading && (
        <div className="p-4 text-center text-sm text-gray-500">
          Loading trades...
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="trades-header grid grid-cols-3">
            <div>Price ({market === 'spot' ? 'USDT' : 'USD'})</div>
            <div>Size ({symbol.replace('USDT', '').replace('USD', '')})</div>
            <div>Time</div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {trades.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No trades available
              </div>
            ) : (
              trades.map((trade, index) => (
                <div 
                  key={`${trade.id}-${index}`} 
                  className={`trade-row ${trade.side === 'buy' ? 'trade-buy' : 'trade-sell'}`}
                >
                  <div className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    {PriceFormatter.formatPrice(trade.price)}
                  </div>
                  <div>
                    {trade.size.toFixed(6)}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {TimeFormatter.formatTime(new Date(trade.time).getTime())}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};