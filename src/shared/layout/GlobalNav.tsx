import { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from "../ui/theme-toggle";

const GlobalNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState(() => {
    // Set active tab based on current route
    const path = location.pathname;
    if (path === '/trading' || path === '/') return "Market";
    if (path === '/quantum') return "Quantum";
    if (path === '/database') return "Database";
    if (path === '/whales') return "Whales";
    if (path === '/news') return "News";
    if (path === '/bot') return "Trading Bot";
    if (path === '/api') return "API";
    if (path === '/ml') return "ML";
    if (path === '/settings') return "Settings";
    return "Market";
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState("Bitget");
  const [isExchangeDropdownOpen, setIsExchangeDropdownOpen] = useState(false);

  const marketOptions = [
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
    { name: "Market", path: "/trading", hasDropdown: true },
    { name: "Trading Bot", path: "/bot" },
    { name: "Quantum", path: "/quantum" },
    { name: "ML", path: "/ml" },
    { name: "Database", path: "/database" },
    { name: "Whales", path: "/whales" },
    { name: "News", path: "/news" },
    { name: "API", path: "/api" },
    { name: "Settings", path: "/settings" },
  ];

  const handleTabClick = (itemName: string, itemPath?: string) => {
    if (itemName === "Market") {
      setIsDropdownOpen(!isDropdownOpen);
      setActiveTab(itemName);
    } else if (itemName === "Settings") {
      setIsDropdownOpen(false);
      setActiveTab(itemName);
      if (itemPath) navigate(itemPath);
    } else {
      setActiveTab(itemName);
      setIsDropdownOpen(false);
      if (itemPath) navigate(itemPath);
    }
  };

  const handleMarketOptionClick = (option: string) => {
    setActiveTab("Market");
    setIsDropdownOpen(false);
    navigate("/trading"); // Always go to trading page for market options
  };

  const handleExchangeChange = (exchange: string) => {
    // This functionality can be extended later if needed
    console.log('Exchange changed to:', exchange);
  };

  return (
    <nav className="flex justify-between items-center mb-5 px-6 py-5">
      {/* Left side: Navigation items */}
      <div className="flex gap-2">
        {navItems.map((item) => (
          <div key={item.name} className="relative">
            <button
              className={`px-5 py-1.5 rounded font-medium transition-colors ${
                activeTab === item.name
                  ? "bg-destructive text-destructive-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
              onClick={() => handleTabClick(item.name, item.path)}
            >
              {item.name}
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
            className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded font-medium text-sm transition-colors text-foreground"
            onClick={() => setIsExchangeDropdownOpen(!isExchangeDropdownOpen)}
          >
            {selectedExchange} ▽
          </button>
          
          {/* Exchange Dropdown Menu */}
          {isExchangeDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 z-50 w-32 bg-card rounded-lg shadow-xl border border-border">
              <div
                className="p-2 hover:bg-muted cursor-pointer text-sm font-medium text-foreground"
                onClick={() => {
                  setSelectedExchange("Bitget");
                  setIsExchangeDropdownOpen(false);
                  handleExchangeChange("bitget");
                }}
              >
                Bitget
              </div>
              <div
                className="p-2 hover:bg-muted cursor-pointer text-sm font-medium text-foreground"
                onClick={() => {
                  setSelectedExchange("Binance");
                  setIsExchangeDropdownOpen(false);
                  handleExchangeChange("binance");
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
    </nav>
  );
};

export default GlobalNav;
