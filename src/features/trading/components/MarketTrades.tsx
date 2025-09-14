import React, { useState } from "react";
import { Trade } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

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
  maxLength = 30,
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);

  useWebSocket('trade', (newTrade: any) => {
    setTrades((prev) => {
      const trade: Trade = {
        id: newTrade.id || Date.now().toString(),
        price: Number(newTrade.price),
        size: Number(newTrade.size),
        time: new Date(newTrade.time).toLocaleTimeString(),
        side: newTrade.side,
        ts: newTrade.time,
      };
      const updated = [trade, ...prev];
      return updated.slice(0, maxLength);
    });
  });

  return (
    <div className="p-4 bg-bg-secondary rounded-xl shadow w-full max-w-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold text-lg text-text-primary">Market Trades</span>
      </div>
      <div className="overflow-y-auto max-h-80">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th align="left">Time</th>
              <th align="right">Price</th>
              <th align="right">Amount</th>
              <th align="center">Side</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, idx) => (
              <tr key={idx} className="border-b border-border-color last:border-b-0">
                <td className="py-1">{t.time}</td>
                <td align="right" className={t.side === "buy" ? "text-color-buy" : "text-color-sell"}>{t.price.toFixed(4)}</td>
                <td align="right">{t.size.toFixed(4)}</td>
                <td align="center">{t.side}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {trades.length === 0 && <div className="text-text-secondary p-2 text-center">No trades yet.</div>}
      </div>
    </div>
  );
};
