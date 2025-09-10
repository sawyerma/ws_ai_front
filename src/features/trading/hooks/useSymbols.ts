import { useState, useEffect, useMemo } from 'react';
import { SymbolsAPI } from '../../../services/api/symbols';
import { CoinData, Exchange, TradingMode } from '../types/trading';
import { FavoritesService } from '../../../services/storage/favorites';

export const useSymbols = (
  exchange: Exchange = "bitget",
  selectedMarket?: string // This can be "Market" or a specific TradingMode
) => {
  const [symbols, setSymbols] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    setFavorites(new Set(FavoritesService.getFavorites()));
  }, []);

  // Market mapping: TradingNav → API market values
  const getMarketFilter = (market?: string): TradingMode | undefined => {
    if (!market || market === "Market") {
      return undefined; // No filter - show all coins
    }
    // Ensure the market is a valid TradingMode before returning
    const validTradingModes: TradingMode[] = ["Spot", "USDT-M Futures", "Coin-M Perpetual-Futures", "Coin-M Delivery-Futures", "USDC-M Futures"];
    if (validTradingModes.includes(market as TradingMode)) {
      return market as TradingMode;
    }
    return undefined;
  };

  // Load symbols from API
  const loadSymbols = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await SymbolsAPI.getSymbols(exchange, getMarketFilter(selectedMarket));
      setSymbols(response);
    } catch (err) {
      setError('Failed to load symbols');
      console.error('Error loading symbols:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load symbols on mount and when exchange or selectedMarket changes
  useEffect(() => {
    loadSymbols();
  }, [exchange, selectedMarket]);

  // Toggle favorite
  const toggleFavorite = (symbol: string) => {
    if (FavoritesService.isFavorite(symbol)) {
      FavoritesService.removeFavorite(symbol);
    } else {
      FavoritesService.addFavorite(symbol);
    }
    setFavorites(new Set(FavoritesService.getFavorites())); // Refresh state
  };

  return { symbols, loading, error, favorites, toggleFavorite, loadSymbols };
};
