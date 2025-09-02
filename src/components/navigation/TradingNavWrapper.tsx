// components/navigation/TradingNavWrapper.tsx - Compatibility wrapper
import React from 'react';
import { TradingNav } from './TradingNav';
import { ViewMode } from '../../types';

interface TradingNavWrapperProps {
  onTradingModeChange?: (mode: string) => void;
  onExchangeChange?: (exchange: string) => void;
  onViewChange?: (view: ViewMode) => void;
}

export const TradingNavWrapper: React.FC<TradingNavWrapperProps> = (props) => {
  return <TradingNav {...props} />;
};

// Default export for compatibility with existing imports
export default TradingNavWrapper;