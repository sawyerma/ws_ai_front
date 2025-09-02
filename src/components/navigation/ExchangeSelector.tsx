// components/navigation/ExchangeSelector.tsx - NUR Exchange-Dropdown (max 40 Zeilen)
import React, { useState } from 'react';

interface ExchangeSelectorProps {
  onExchangeChange?: (exchange: string) => void;
}

export const ExchangeSelector: React.FC<ExchangeSelectorProps> = ({ onExchangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState("Bitget");

  const exchanges = [
    { name: "Bitget", value: "bitget" },
    { name: "Binance", value: "binance" },
  ];

  const handleExchangeSelect = (exchangeName: string, exchangeValue: string) => {
    setSelectedExchange(exchangeName);
    setIsOpen(false);
    if (onExchangeChange) {
      onExchangeChange(exchangeValue);
    }
  };

  return (
    <div className="relative">
      <button
        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded font-medium text-sm transition-colors text-[#222] dark:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedExchange} ▽
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-600">
          {exchanges.map((exchange) => (
            <div
              key={exchange.value}
              className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm font-medium text-[#222] dark:text-white"
              onClick={() => handleExchangeSelect(exchange.name, exchange.value)}
            >
              {exchange.name}
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};