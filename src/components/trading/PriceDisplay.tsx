// components/trading/PriceDisplay.tsx - Preis-Anzeige (max 60 Zeilen)
import React from 'react';
import { CoinData } from '../../types';
import { PriceFormatter } from '../../services/utils';

interface PriceDisplayProps {
  coinData: CoinData;
  showVolume?: boolean;
  showChange?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  coinData,
  showVolume = true,
  showChange = true,
  size = 'medium'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'text-lg';
      case 'large': return 'text-4xl';
      default: return 'text-2xl';
    }
  };

  const isPositive = coinData.changePercent >= 0;

  return (
    <div className="price-display-container">
      {/* Symbol */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        {coinData.symbol} / {coinData.market.toUpperCase()}
      </div>

      {/* Main Price */}
      <div className={`price-display ${getSizeClasses()}`}>
        {PriceFormatter.formatPrice(Number(coinData.price))}
      </div>

      {/* Change Information */}
      {showChange && (
        <div className={`flex items-center gap-2 mt-1 ${
          isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          <span className="text-sm">
            {isPositive ? '▲' : '▼'}
          </span>
          <span className="text-sm font-medium">
            {coinData.change}
          </span>
          <span className="text-xs">
            ({isPositive ? '+' : ''}{coinData.changePercent.toFixed(2)}%)
          </span>
        </div>
      )}

      {/* Volume */}
      {showVolume && coinData.volume && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Vol: {PriceFormatter.formatVolume(Number(coinData.volume))}
        </div>
      )}

      {/* High/Low */}
      {coinData.high && coinData.low && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>H: {PriceFormatter.formatPrice(Number(coinData.high))}</span>
          <span>L: {PriceFormatter.formatPrice(Number(coinData.low))}</span>
        </div>
      )}

      {/* Status Indicators */}
      <div className="flex items-center gap-2 mt-2">
        {coinData.liveStatus && (
          <div className={`status-indicator ${
            coinData.liveStatus === 'green' ? 'connected' : 'error'
          }`} title="Live Status" />
        )}
        {coinData.histStatus && (
          <div className={`status-indicator ${
            coinData.histStatus === 'green' ? 'connected' : 'error'
          }`} title="Historical Status" />
        )}
        {coinData.isFavorite && (
          <span className="text-yellow-500 text-xs">★</span>
        )}
      </div>
    </div>
  );
};