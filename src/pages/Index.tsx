import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TradingNav from "../components/ui/trading-nav";
import PriceDisplay from "../components/ui/price-display";
import TimeButtons from "../components/ui/time-buttons";
import ChartSection from "../components/ui/chart-section";
import AdvancedCoinSelector from "../components/ui/advanced-coin-selector";
import ThemeProvider from "../components/ui/theme-provider";
import Database from "./Database";
import AI from "./AI";
import ML from "./ML";
import Whales from "./Whales";
import News from "./News";
import TradingBot from "./TradingBot";
import API from "./API";
import { getSymbols, getTicker, Exchange, ApiSymbol, fetchTrades } from "../api/symbols";

// Behalten Sie die ursprüngliche CoinData-Schnittstelle für die Kompatibilität mit Kindkomponenten bei
interface CoinData {
  id: string;
  symbol: string;
  market: string;
  price: string;
  change: string;
  changePercent: number;
  isFavorite: boolean;
  liveStatus: "green" | "red";
  histStatus: "green" | "red";
}

// Interface für die Ticker-Daten, die vom Backend erwartet werden
interface TickerData {
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  turnover24h: string;
  category: string;
}

const Index = () => {
  const [viewMode, setViewMode] = useState<"trading" | "database" | "ai" | "ml" | "whales" | "news" | "bot" | "api">("trading");
  const [selectedCoin, setSelectedCoin] = useState("BTCUSDT");
  const [selectedMarket, setSelectedMarket] = useState("spot");
  const [selectedInterval, setSelectedInterval] = useState("1m");
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<Exchange>("bitget");
  const [tradingMode, setTradingMode] = useState("Market"); // Start with Market (alle)
  const [selectedMarketType, setSelectedMarketType] = useState("Market"); // Präziser Markttyp
  const [currentCoinData, setCurrentCoinData] = useState<CoinData | null>(null);

  // Daten-Fetching mit React Query für Symbole
  const { data: symbolsResponse, isLoading: isLoadingSymbols, error: symbolsError } = useQuery({
    queryKey: ['symbols', selectedExchange],
    queryFn: () => getSymbols(selectedExchange),
    refetchOnWindowFocus: false,
  });

  // Daten-Fetching mit React Query für Ticker-Daten
  const { data: tickerData, error: tickerError } = useQuery({
    queryKey: ['ticker', selectedExchange, selectedCoin, selectedMarket],
    queryFn: async () => {
      if (!selectedCoin) return null;
      const tickerResponse = await getTicker(selectedExchange, selectedCoin, selectedMarket);
      if (!tickerResponse?.tickers?.[0]) return null;

      const ticker = tickerResponse.tickers.find((t: any) => t.market_type === selectedMarket) || tickerResponse.tickers[0];
      
      const formatPrice = (price: number) => price?.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
      const formatVolume = (volume: number) => {
        if (!volume) return '0.00';
        if (volume > 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
        if (volume > 1_000) return `${(volume / 1_000).toFixed(2)}K`;
        return volume.toFixed(2);
      };

      return {
        change24h: ticker.changeRate ? `${(ticker.changeRate * 100).toFixed(2)}%` : '0.00%',
        high24h: formatPrice(ticker.high),
        low24h: formatPrice(ticker.low),
        volume24h: formatVolume(ticker.volume),
        turnover24h: formatVolume(ticker.volume * ticker.last),
        category: selectedMarket === 'futures' ? 'Futures' : 'Spot Trading',
      };
    },
    enabled: !!selectedCoin,
    refetchInterval: 10000, // Alle 10 Sekunden aktualisieren
  });

  // Daten-Fetching für historische OHLC-Daten (Kerzen)
  const { data: ohlcData, isLoading: isLoadingOhlc } = useQuery({
    queryKey: ['ohlc', selectedExchange, selectedCoin, selectedMarket, selectedInterval],
    queryFn: () => fetchTrades(selectedCoin, selectedInterval), // Annahme: fetchTrades holt OHLC-Daten
    enabled: !!selectedCoin && !!selectedInterval,
    refetchOnWindowFocus: false,
  });

  // Setzt die erste Münze als Standard, wenn die Symbole geladen sind
  useEffect(() => {
    if (symbolsResponse?.symbols && symbolsResponse.symbols.length > 0 && !currentCoinData) {
      const defaultSymbolData = symbolsResponse.symbols.find(s => s.symbol === 'BTC/USDT') || symbolsResponse.symbols[0];
      if (defaultSymbolData) {
        // Konvertiert ApiSymbol zu CoinData
        const coinData: CoinData = {
          ...defaultSymbolData,
          id: defaultSymbolData.symbol.replace('/', ''),
          isFavorite: false, // Standardwert
          liveStatus: "green", // Standardwert
          histStatus: "green", // Standardwert
        };
        setCurrentCoinData(coinData);
        setSelectedCoin(coinData.id);
        setSelectedMarket(coinData.market);
      }
    }
  }, [symbolsResponse, currentCoinData]);

  const handleSymbolSelect = (symbol: string, market: string) => {
    const foundSymbol = symbolsResponse?.symbols.find(s => s.symbol.replace('/', '') === symbol && s.market === market);
    if (foundSymbol) {
      const coinData: CoinData = {
        ...foundSymbol,
        id: foundSymbol.symbol.replace('/', ''),
        isFavorite: currentCoinData?.isFavorite || false,
        liveStatus: "green",
        histStatus: "green",
      };
      setSelectedCoin(symbol);
      setSelectedMarket(market);
      setCurrentCoinData(coinData);
    }
  };

  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin.symbol.replace('/', ''));
    setSelectedMarket(coin.market);
    setCurrentCoinData(coin);
  };

  const handleIntervalChange = (interval: string) => {
    setSelectedInterval(interval);
  };

  const handleIndicatorSelect = (indicator: string) => {
    setSelectedIndicators(prev => {
      if (prev.includes(indicator)) {
        return prev; // Don't add duplicates
      }
      return [...prev, indicator];
    });
  };

  const handleIndicatorRemove = (indicator: string) => {
    setSelectedIndicators(prev => prev.filter(i => i !== indicator));
  };

  const handleTradingModeChange = (mode: string) => {
    setSelectedMarketType(mode);
    setTradingMode(mode); // Für Kompatibilität
  };

  const handleExchangeChange = (exchange: string) => {
    setSelectedExchange(exchange as Exchange);
  };

  // Show different views based on mode
  if (viewMode === "database") {
    return <Database onBackToTrading={() => setViewMode("trading")} />;
  }
  if (viewMode === "ai") {
    return <AI onBackToTrading={() => setViewMode("trading")} />;
  }
  if (viewMode === "ml") {
    return <ML onBackToTrading={() => setViewMode("trading")} />;
  }
  if (viewMode === "whales") {
    return <Whales onBackToTrading={() => setViewMode("trading")} />;
  }
  if (viewMode === "news") {
    return <News onBackToTrading={() => setViewMode("trading")} />;
  }
  if (viewMode === "bot") {
    return <TradingBot onBackToTrading={() => setViewMode("trading")} />;
  }
  if (viewMode === "api") {
    return <API onBackToTrading={() => setViewMode("trading")} />;
  }

  return (
    <ThemeProvider>
      <div
        className="bg-[#fbfcfd] dark:bg-gray-900 text-[#222] dark:text-white min-h-screen px-6 py-5 transition-colors"
        style={{
          fontFamily: "'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'",
        }}
      >
        {/* Top Navigation */}
        <TradingNav
          onTradingModeChange={handleTradingModeChange}
          onExchangeChange={handleExchangeChange}
          onViewChange={setViewMode}
        />

        {/* Market & Price Section */}
        <div className="flex gap-5 max-lg:flex-col max-lg:gap-0">
          {/* Column 1: Coin Selector */}
          <div className="flex flex-col w-[17%] max-lg:w-full max-lg:ml-0">
            {isLoadingSymbols ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading symbols...</p>
              </div>
            ) : symbolsError ? (
              <div className="p-4 text-center">
                <p className="text-red-500 mb-2">Failed to load symbols</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <AdvancedCoinSelector
                selectedSymbol={currentCoinData?.symbol || ''}
                onSymbolSelect={handleSymbolSelect}
                exchange={selectedExchange}
                selectedMarket={tradingMode}
              />
            )}
          </div>

          {/* Column 2: Price Display */}
          <div className="flex flex-col w-[83%] ml-5 max-lg:w-full max-lg:ml-0">
            {currentCoinData && (
              <PriceDisplay
                currentCoinData={currentCoinData}
                marketData={tickerData || undefined}
                tradingMode={selectedMarket}
              />
            )}
          </div>
        </div>

        {/* Time Buttons */}
        <TimeButtons 
          onIntervalChange={handleIntervalChange}
          onIndicatorSelect={handleIndicatorSelect}
        />

        {/* Main Content: Multi-Chart + Orderbook */}
        <ChartSection 
          selectedCoin={selectedCoin}
          selectedMarket={selectedMarket}
          selectedInterval={selectedInterval}
          selectedIndicators={selectedIndicators}
          selectedExchange={selectedExchange}
          onIndicatorRemove={handleIndicatorRemove}
          historicalData={ohlcData}
          isLoading={isLoadingOhlc}
        />
      </div>
    </ThemeProvider>
  );
};

export default Index;
