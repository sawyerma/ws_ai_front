import React, { useState, useEffect, useMemo } from 'react';
import { Search, Star, TrendingUp, TrendingDown, RefreshCw, Settings } from 'lucide-react';
import { getSymbols, ApiSymbol, clearCache } from '../../api/symbols';

interface AdvancedCoinSelectorProps {
  selectedSymbol: string;
  onSymbolSelect: (symbol: string, market: string) => void;
  onSettingsClick?: () => void;
  maxHeight?: number;
}

const AdvancedCoinSelector: React.FC<AdvancedCoinSelectorProps> = ({
  selectedSymbol,
  onSymbolSelect,
  onSettingsClick,
  maxHeight = 500,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [symbols, setSymbols] = useState<ApiSymbol[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'symbol' | 'change' | 'volume'>('symbol');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('coin-favorites');
    if (savedFavorites) {
      try {
        const favArray = JSON.parse(savedFavorites);
        setFavorites(new Set(favArray));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem('coin-favorites', JSON.stringify(Array.from(newFavorites)));
    setFavorites(newFavorites);
  };

  // Load symbols from API
  const loadSymbols = async (forceRefresh = false) => {
    if (forceRefresh) {
      clearCache();
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getSymbols();
      setSymbols(response.symbols);
      console.log(`[CoinSelector] Loaded ${response.symbols.length} symbols`);
    } catch (err) {
      setError('Failed to load symbols');
      console.error('Error loading symbols:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load symbols on mount
  useEffect(() => {
    loadSymbols();
  }, []);

  // Get available markets
  const availableMarkets = useMemo(() => {
    const markets = new Set(symbols.map(s => s.market).filter(Boolean));
    return ['all', ...Array.from(markets).sort()];
  }, [symbols]);

  // Filter and sort symbols
  const filteredSymbols = useMemo(() => {
    let filtered = symbols;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(symbol =>
        symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by market
    if (selectedMarket !== 'all') {
      filtered = filtered.filter(symbol => symbol.market === selectedMarket);
    }

    // Sort symbols
    filtered.sort((a, b) => {
      // Favorites first
      const aFav = favorites.has(a.symbol);
      const bFav = favorites.has(b.symbol);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      // Then by selected sort
      let comparison = 0;
      switch (sortBy) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'change':
          comparison = a.changePercent - b.changePercent;
          break;
        default:
          comparison = a.symbol.localeCompare(b.symbol);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [symbols, searchTerm, selectedMarket, sortBy, sortOrder, favorites]);

  // Toggle favorite
  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(symbol)) {
      newFavorites.delete(symbol);
    } else {
      newFavorites.add(symbol);
    }
    saveFavorites(newFavorites);
  };

  // Handle symbol selection
  const handleSymbolSelect = (symbol: ApiSymbol) => {
    const cleanSymbol = symbol.symbol.replace('/', '');
    onSymbolSelect(cleanSymbol, symbol.market);
    setIsOpen(false);
  };

  // Get display symbol for current selection
  const displaySymbol = selectedSymbol.includes('/') ? selectedSymbol : 
    symbols.find(s => s.symbol.replace('/', '') === selectedSymbol)?.symbol || selectedSymbol;

  return (
    <div className="relative">
      {/* Selected Symbol Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#111827] dark:bg-[#111827] border border-gray-700 dark:border-gray-700 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800 transition-colors min-w-[200px]"
      >
        <span className="font-medium text-white dark:text-white">
          {displaySymbol}
        </span>
        {favorites.has(displaySymbol) && (
          <Star size={16} className="text-yellow-500 fill-current" />
        )}
        <svg
          className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e2433] dark:bg-[#1e2433] border border-gray-700 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-700 dark:border-gray-700">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 dark:border-gray-600 rounded-lg bg-[#111827] dark:bg-[#111827] text-white dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Header Row */}
          <div className="flex items-center px-[30px] bg-[#1e2433] dark:bg-[#1e2433] font-bold h-14 text-[#65717c] tracking-[0.03em] border-b border-gray-700">
            <div className="w-[68px] text-center text-[0.78em]">
              <span className="text-yellow-500">★</span>
            </div>
            <div className="w-[190px] font-bold text-[0.83em]">COIN ↑</div>
            <div className="w-[178px] text-right text-[0.83em]">PRICE</div>
            <div className="w-[160px] text-right text-[0.83em]">24H</div>
            <div className="w-[70px] text-center text-[0.82em]">L</div>
            <div className="w-[70px] text-center text-[0.82em]">H</div>
          </div>

          {/* Coins list */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                Loading symbols...
              </div>
            ) : filteredSymbols.length > 0 ? (
              filteredSymbols.map((coin) => (
                <div
                  key={`${coin.symbol}_${coin.market}`}
                  className={`flex items-center px-[30px] h-[62px] text-[1.1rem] cursor-pointer transition-colors border-b border-gray-700 ${
                    coin.symbol === displaySymbol
                      ? "bg-[#1a2035]"
                      : "hover:bg-[#1a2035]"
                  }`}
                  onClick={() => handleSymbolSelect(coin)}
                >
                  <div className="w-[68px] text-center">
                    <span
                      className={`text-[0.83em] cursor-pointer ${
                        favorites.has(coin.symbol) ? "text-[#ffd600]" : "text-[#e7e7e7]"
                      }`}
                      onClick={(e) => toggleFavorite(coin.symbol, e)}
                    >
                      ★
                    </span>
                  </div>
                  <div className="w-[190px] font-bold text-white">
                    {coin.symbol}
                  </div>
                  <div className="w-[178px] text-right font-medium font-mono text-white">
                    {coin.price}
                  </div>
                  <div
                    className={`w-[160px] text-right font-bold ${
                      (coin.changePercent || 0) >= 0 ? "text-[#15b446]" : "text-[#d53939]"
                    }`}
                  >
                    {coin.change}
                  </div>
                  <div className="w-[70px] text-center">
                    <span
                      className={`inline-block w-4 h-4 rounded-full border-2 ${
                        coin.market === "spot"
                          ? "bg-[#41cf58] border-[#40ba59]"
                          : "bg-[#ef4444] border-[#d73c3c]"
                      }`}
                    ></span>
                  </div>
                  <div className="w-[70px] text-center">
                    <span
                      className={`inline-block w-4 h-4 rounded-full border-2 ${
                        coin.market === "spot"
                          ? "bg-[#41cf58] border-[#40ba59]"
                          : "bg-[#ef4444] border-[#d73c3c]"
                      }`}
                    ></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                No symbols found matching your criteria
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-700 text-xs text-gray-400 flex justify-between items-center">
            <div>
              {filteredSymbols.length} symbols
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadSymbols(true)}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-white disabled:opacity-50"
                title="Refresh symbols"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              {onSettingsClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSettingsClick();
                    setIsOpen(false);
                  }}
                  className="p-1 text-gray-400 hover:text-white"
                  title="Settings"
                >
                  <Settings size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default AdvancedCoinSelector;