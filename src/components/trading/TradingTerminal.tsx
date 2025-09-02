// components/trading/TradingTerminal.tsx - Trading Terminal (max 100 Zeilen)
import React, { useState } from 'react';

interface TradingTerminalProps {
  symbol: string;
  market: string;
  exchange: string;
  onTrade?: (order: any) => void;
}

interface OrderData {
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: string;
  price: string;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  symbol,
  market,
  exchange,
  onTrade
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orderData, setOrderData] = useState<OrderData>({
    side: 'buy',
    type: 'market',
    amount: '',
    price: ''
  });

  const handleInputChange = (field: keyof OrderData, value: string) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderData.amount) {
      alert('Please enter amount');
      return;
    }

    if (orderData.type === 'limit' && !orderData.price) {
      alert('Please enter price for limit order');
      return;
    }

    const order = {
      ...orderData,
      side: activeTab,
      symbol,
      market,
      exchange,
      timestamp: new Date().toISOString()
    };

    if (onTrade) {
      onTrade(order);
    }

    // Reset form
    setOrderData({
      side: activeTab,
      type: 'market',
      amount: '',
      price: ''
    });
  };

  return (
    <div className="card-container">
      {/* Tab Headers */}
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'buy'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setActiveTab('buy')}
        >
          Buy {symbol.replace('USDT', '')}
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            activeTab === 'sell'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          onClick={() => setActiveTab('sell')}
        >
          Sell {symbol.replace('USDT', '')}
        </button>
      </div>

      {/* Order Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Order Type</label>
          <select
            value={orderData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>

        {/* Price (for limit orders) */}
        {orderData.type === 'limit' && (
          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <input
              type="number"
              step="0.0001"
              value={orderData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0.0000"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <input
            type="number"
            step="0.0001"
            value={orderData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="0.0000"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded font-medium transition-colors ${
            activeTab === 'buy'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {activeTab === 'buy' ? 'Buy' : 'Sell'} {symbol.replace('USDT', '')}
        </button>
      </form>
    </div>
  );
};