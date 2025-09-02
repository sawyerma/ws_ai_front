// components/trading/MarketTrades.tsx - Market Trades (max 80 Zeilen)
import React, { useState, useEffect, useRef } from 'react';
import { Trade } from '../../types';
import { DateFormatter, PriceFormatter } from '../../services/utils';
import { API_CONFIG } from '../../config';

interface MarketTradesProps {
  symbol: string;
  market: string;
  exchange: string;
  maxLength?: number;
}

export const MarketTrades: React.FC<MarketTradesProps> = ({
  symbol,
  market,
  exchange,
  maxLength = 30
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `${API_CONFIG.WS_URL}/ws/${exchange}/${symbol}/${market}`;
    setWsStatus('connecting');
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setWsStatus('connected');
    ws.onclose = () => setWsStatus('disconnected');
    ws.onerror = () => setWsStatus('error');

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'trade') {
          const trade: Trade = {
            id: msg.id || Date.now().toString(),
            price: Number(msg.price),
            size: Number(msg.size || msg.amount),
            time: msg.time || new Date().toISOString(),
            side: msg.side as 'buy' | 'sell',
            ts: msg.ts || Date.now().toString(),
          };
          
          setTrades(prev => {
            const updated = [trade, ...prev];
            return updated.slice(0, maxLength);
          });
        }
      } catch (error) {
        console.warn('MarketTrades: Parse error:', error);
      }
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [symbol, market, exchange, maxLength]);

  const getStatusColor = () => {
    switch (wsStatus) {
      case 'connected': return 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error': return 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="card-container">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg">Market Trades</span>
        <span className={`text-xs px-2 py-1 rounded ${getStatusColor()}`}>
          {wsStatus}
        </span>
      </div>
      
      <div className="overflow-y-auto max-h-80">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left pb-2">Time</th>
              <th className="text-right pb-2">Price</th>
              <th className="text-right pb-2">Amount</th>
              <th className="text-center pb-2">Side</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="py-1">{DateFormatter.formatTime(trade.time)}</td>
                <td className={`text-right py-1 font-mono ${
                  trade.side === 'buy' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {PriceFormatter.formatPrice(trade.price)}
                </td>
                <td className="text-right py-1 font-mono">{trade.size.toFixed(4)}</td>
                <td className="text-center py-1">
                  <span className={`px-1 rounded text-xs ${
                    trade.side === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {trade.side}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {trades.length === 0 && (
          <div className="text-gray-400 p-4 text-center">No trades yet.</div>
        )}
      </div>
    </div>
  );
};