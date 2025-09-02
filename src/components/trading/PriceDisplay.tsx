// Price Display Component
// Shows current price with change indicator

import React from 'react';
import { PriceFormatter } from '../../services/utils';

interface PriceDisplayProps {
  symbol: string;
  price: string | number;
  change: string;
  changePercent: number;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  symbol,
  price,
  change,
  changePercent,
  className = ''
}) => {
  const priceValue = typeof price === 'string' ? parseFloat(price) : price;
  const isPositive = changePercent >= 0;
  
  return (
    <div className={`price-display ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg font-medium">{symbol}</span>
        <div className="flex flex-col">
          <span className="text-2xl font-bold">
            {PriceFormatter.formatPrice(priceValue)}
          </span>
          <span className={`text-sm ${isPositive ? 'price-up' : 'price-down'}`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
};