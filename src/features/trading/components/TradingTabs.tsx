import React, { useState } from 'react';
import OrderBook from './OrderBook';
import { MarketTrades } from './MarketTrades';

interface TradingTabsProps {
  symbol: string;
  market: string;
  exchange: string;
}

const TradingTabs: React.FC<TradingTabsProps> = ({ symbol, market, exchange }) => {
  const [activeTab, setActiveTab] = useState<'trades' | 'orderbook'>('trades');

  return (
    <div className="card-container h-full flex flex-col">
      {/* Tab Header */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('trades')}
          className="px-4 py-2 text-sm font-medium transition-colors"
          style={{
            color: activeTab === 'trades' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'trades' ? '2px solid var(--color-info)' : 'none'
          }}
        >
          Markt-Trades
        </button>
        <button
          onClick={() => setActiveTab('orderbook')}
          className="px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
          style={{
            color: activeTab === 'orderbook' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'orderbook' ? '2px solid var(--color-info)' : 'none'
          }}
        >
          Orderbuch
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-sell)' }} title="Error"></div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'trades' ? (
          <div className="p-4">
            <MarketTrades symbol={symbol} market={market} exchange={exchange} />
          </div>
        ) : (
          <div className="p-4">
            <OrderBook symbol={symbol} market={market} exchange={exchange} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingTabs;
