// components/navigation/TradingNav.tsx - Haupt-Navigation (max 80 Zeilen)
import React, { useState } from 'react';
import { ViewSelector } from './ViewSelector';
import { MarketSelector } from './MarketSelector';
import { ExchangeSelector } from './ExchangeSelector';
import ThemeToggle from '../ui/theme-toggle';
import SettingsModal from '../ui/settings-modal';
import { ViewMode } from '../../types';

interface TradingNavProps {
  onTradingModeChange?: (mode: string) => void;
  onExchangeChange?: (exchange: string) => void;
  onViewChange?: (view: ViewMode) => void;
}

export const TradingNav: React.FC<TradingNavProps> = ({
  onTradingModeChange,
  onExchangeChange,
  onViewChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeMarketLabel, setActiveMarketLabel] = useState("Market");

  const handleMarketChange = (market: string) => {
    setActiveMarketLabel(market);
    setIsDropdownOpen(false);
    if (onTradingModeChange) {
      onTradingModeChange(market);
    }
  };

  const handleViewChange = (view: ViewMode) => {
    if (view === "api") {
      // Special handling for API view
      setIsSettingsOpen(true);
    } else if (onViewChange) {
      onViewChange(view);
    }
    setIsDropdownOpen(false);
  };

  return (
    <nav className="flex justify-between items-center mb-5">
      {/* Left side: Navigation items */}
      <div className="flex gap-2">
        {/* Market button with dropdown */}
        <div className="relative">
          <button
            className={`px-5 py-1.5 rounded font-medium transition-colors ${
              !isDropdownOpen
                ? "bg-[#e4261c] text-white"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-[#222] dark:text-white"
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {activeMarketLabel} ▽
          </button>

          {isDropdownOpen && (
            <MarketSelector onMarketChange={handleMarketChange} />
          )}
        </div>

        {/* View selector buttons */}
        <ViewSelector onViewChange={handleViewChange} />

        {/* Settings button */}
        <button
          className="px-5 py-1.5 rounded font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-[#222] dark:text-white"
          onClick={() => setIsSettingsOpen(true)}
        >
          Settings
        </button>
      </div>

      {/* Right side: Exchange selector + Theme toggle */}
      <div className="flex items-center gap-3">
        <ExchangeSelector onExchangeChange={onExchangeChange} />
        <ThemeToggle />
      </div>

      {/* Overlay to close dropdowns */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </nav>
  );
};