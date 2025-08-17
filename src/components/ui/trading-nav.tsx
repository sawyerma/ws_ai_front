import { useState } from "react";
import ThemeToggle from "./theme-toggle";
import SettingsModal from "./settings-modal";

interface TradingNavProps {
  onTradingModeChange?: (mode: string) => void;
  onExchangeChange?: (exchange: string) => void;
  onViewChange?: (
    view: "trading" | "database" | "ai" | "ml" | "whales" | "news" | "bot" | "api",
  ) => void;
}

const TradingNav = ({ onTradingModeChange, onExchangeChange, onViewChange }: TradingNavProps) => {
  const [activeTab, setActiveTab] = useState("Market");
  const [activeMarketLabel, setActiveMarketLabel] = useState("Market");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState("Bitget");
  const [isExchangeDropdownOpen, setIsExchangeDropdownOpen] = useState(false);

  const marketOptions = [
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

  const navItems = [
    { name: "Market", hasDropdown: true },
    { name: "Trading Bot" },
    { name: "AI" },
    { name: "ML" },
    { name: "Database" },
    { name: "Whales" },
    { name: "News" },
    { name: "API" },
    { name: "Settings" },
  ];

  const handleTabClick = (itemName: string) => {
    if (itemName === "Market") {
      setIsDropdownOpen(!isDropdownOpen);
    } else if (itemName === "Settings") {
      setIsSettingsOpen(true);
      setIsDropdownOpen(false);
    } else if (itemName === "Database") {
      if (onViewChange) {
        onViewChange("database");
      } else {
        // Fallback: open in new tab
        window.open("/database", "_blank");
      }
      setIsDropdownOpen(false);
    } else if (itemName === "AI") {
      if (onViewChange) {
        onViewChange("ai");
      }
      setIsDropdownOpen(false);
    } else if (itemName === "ML") {
      if (onViewChange) {
        onViewChange("ml");
      }
      setIsDropdownOpen(false);
    } else if (itemName === "Whales") {
      if (onViewChange) {
        onViewChange("whales");
      }
      setIsDropdownOpen(false);
    } else if (itemName === "News") {
      if (onViewChange) {
        onViewChange("news");
      }
      setIsDropdownOpen(false);
    } else if (itemName === "Trading Bot") {
      if (onViewChange) {
        onViewChange("bot");
      }
      setIsDropdownOpen(false);
    } else if (itemName === "API") {
      if (onViewChange) {
        onViewChange("api");
      }
      setIsDropdownOpen(false);
    } else {
      setActiveTab(itemName);
      setIsDropdownOpen(false);
      // Don't send non-market buttons to tradingMode - only market dropdown options should be displayed under price
    }
  };

  const handleMarketOptionClick = (option: string) => {
    setActiveTab("Market");
    setIsDropdownOpen(false);
    
    // Update button label based on selection
    const labelMap: { [key: string]: string } = {
      "Market": "Market",
      "Spot": "Spot", 
      "USDT-M Futures": "USDT-M",
      "USDC-M Futures": "USDC-M", 
      "Coin-M Perpetual-Futures": "Coin-M",
      "Coin-M Delivery-Futures": "Coin-M"
    };
    
    setActiveMarketLabel(labelMap[option] || "Market");
    
    if (onTradingModeChange) {
      onTradingModeChange(option);
    }
  };

  return (
    <nav className="flex justify-between items-center mb-5">
      {/* Left side: Navigation items */}
      <div className="flex gap-2">
        {navItems.map((item) => (
          <div key={item.name} className="relative">
            <button
              className={`px-5 py-1.5 rounded font-medium transition-colors ${
                activeTab === item.name
                  ? "bg-[#e4261c] text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-[#222] dark:text-white"
              }`}
              onClick={() => handleTabClick(item.name)}
            >
              {item.name === "Market" ? activeMarketLabel : item.name}
              {item.hasDropdown && " ▽"}
            </button>

            {/* Market Dropdown */}
            {item.name === "Market" && isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-600">
                {marketOptions.map((option) => (
                  <div
                    key={option.name}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    onClick={() => handleMarketOptionClick(option.name)}
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
          </div>
        ))}
      </div>

      {/* Right side: Exchange selector + Theme toggle */}
      <div className="flex items-center gap-3">
        {/* Exchange Dropdown */}
        <div className="relative">
          <button
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded font-medium text-sm transition-colors text-[#222] dark:text-white"
            onClick={() => setIsExchangeDropdownOpen(!isExchangeDropdownOpen)}
          >
            {selectedExchange} ▽
          </button>
          
          {/* Exchange Dropdown Menu */}
          {isExchangeDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 z-50 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-600">
              <div
                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm font-medium text-[#222] dark:text-white"
                onClick={() => {
                  setSelectedExchange("Bitget");
                  setIsExchangeDropdownOpen(false);
                  if (onExchangeChange) {
                    onExchangeChange("bitget");
                  }
                }}
              >
                Bitget
              </div>
              <div
                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm font-medium text-[#222] dark:text-white"
                onClick={() => {
                  setSelectedExchange("Binance");
                  setIsExchangeDropdownOpen(false);
                  if (onExchangeChange) {
                    onExchangeChange("binance");
                  }
                }}
              >
                Binance
              </div>
            </div>
          )}
        </div>
        
        <ThemeToggle />
      </div>

      {/* Overlay to close dropdowns */}
      {(isDropdownOpen || isExchangeDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsExchangeDropdownOpen(false);
          }}
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

export default TradingNav;
