// components/navigation/MarketSelector.tsx - NUR Market-Dropdown (max 60 Zeilen)
import React, { useState } from 'react';

interface MarketOption {
  name: string;
  description: string;
  icon: string;
}

interface MarketSelectorProps {
  onMarketChange?: (market: string) => void;
}

export const MarketSelector: React.FC<MarketSelectorProps> = ({ onMarketChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState("Market");

  const marketOptions: MarketOption[] = [
    {
      name: "Market",
      description: "Alle Märkte anzeigen",
      icon: "📊",
    },
    {
      name: "Spot",
      description: "Spot-Trading mit sofortiger Abwicklung",
      icon: "💱",
    },
    {
      name: "USDT-M Futures",
      description: "Perpetual-Futures abgerechnet in USDT",
      icon: "💰",
    },
    {
      name: "Coin-M Perpetual-Futures",
      description: "Futures-Trading ohne Ablaufdatum",
      icon: "⚡",
    },
    {
      name: "Coin-M Delivery-Futures",
      description: "Futures-Trading mit Ablaufdatum",
      icon: "⏰",
    },
    {
      name: "USDC-M Futures",
      description: "Perpetual-Futures abgerechnet in USDC",
      icon: "💲",
    },
  ];

  const handleMarketSelect = (marketName: string) => {
    setSelectedMarket(marketName);
    setIsOpen(false);
    if (onMarketChange) {
      onMarketChange(marketName);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-600">
          {marketOptions.map((option) => (
            <div
              key={option.name}
              className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              onClick={() => handleMarketSelect(option.name)}
            >
              <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded flex items-center justify-center mr-2 text-xs">
                {option.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-xs">
                  {option.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};