import { useState, useEffect } from "react";
import TradingNav from "../components/ui/trading-nav";
import PriceDisplay from "../components/ui/price-display";
import TimeButtons from "../components/ui/time-buttons";
import ChartSection from "../components/ui/chart-section";
import AdvancedCoinSelector from "../components/ui/advanced-coin-selector";
import CoinSettingsModal from "../components/ui/coin-settings-modal";
import ThemeProvider from "../components/ui/theme-provider";
import Database from "./Database";
import AI from "./AI";
import ML from "./ML";
import Whales from "./Whales";
import News from "./News";
import TradingBot from "./TradingBot";
import API from "./API";
import { getSymbols, getTicker, Exchange } from "../api/symbols";

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

const Index = () => {
  const [viewMode, setViewMode] = useState<
    "trading" | "database" | "ai" | "ml" | "whales" | "news" | "bot" | "api"
  >("trading");
  const [selectedCoin, setSelectedCoin] = useState("BTCUSDT");
  const [selectedMarket, setSelectedMarket] = useState("spot");
  const [selectedInterval, setSelectedInterval] = useState("1m");
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<Exchange>("bitget");
  const [symbols, setSymbols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const [currentCoinData, setCurrentCoinData] = useState<CoinData>({
    id: "1",
    symbol: "BTC/USDT",
    market: "spot",
    price: "104,911.62",
    change: "-3.56%",
    changePercent: -3.56,
    isFavorite: true,
    liveStatus: "green",
    histStatus: "green",
  });

  // Live Marktdaten aus Backend-API
  const [marketData, setMarketData] = useState({
    change24h: "-3.56%", // Fallback
    high24h: "110.157,20", // Fallback
    low24h: "99.666,04", // Fallback
    volume24h: "6.08K", // Fallback
    turnover24h: "645.65M", // Fallback
    category: "Public Chain", // Fallback
  });

  // Live-Ticker-Daten für aktuelles Symbol laden
  useEffect(() => {
    const loadTickerData = async () => {
      if (!selectedCoin) return;
      
      try {
        const tickerResponse = await getTicker(selectedExchange, selectedCoin, selectedMarket);
        
        if (tickerResponse && tickerResponse.tickers && tickerResponse.tickers.length > 0) {
          // Finde den passenden Ticker für den aktuellen Market
          const ticker = tickerResponse.tickers.find((t: any) => 
            t.market_type === selectedMarket
          ) || tickerResponse.tickers[0]; // Fallback zum ersten Ticker
          
          // Backend-Daten zu Frontend-Format konvertieren
          const formatPrice = (price: number) => {
            if (price === 0) return '0.00';
            return price.toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          };
          
          const formatVolume = (volume: number) => {
            if (volume > 1000000) {
              return `${(volume / 1000000).toFixed(2)}M`;
            } else if (volume > 1000) {
              return `${(volume / 1000).toFixed(2)}K`;
            }
            return volume.toFixed(2);
          };
          
          setMarketData({
            change24h: ticker.changeRate ? `${(ticker.changeRate * 100).toFixed(2)}%` : '0.00%',
            high24h: formatPrice(ticker.high || 0),
            low24h: formatPrice(ticker.low || 0),
            volume24h: formatVolume(ticker.volume || 0),
            turnover24h: formatVolume((ticker.volume || 0) * (ticker.last || 0)),
            category: selectedMarket === 'futures' ? 'Futures' : 'Spot Trading',
          });
          
          console.log(`[Index] Updated market data for ${selectedCoin}:`, ticker);
        }
      } catch (err) {
        console.error('Failed to load ticker data:', err);
        // Keep fallback data on error
      }
    };

    loadTickerData();
    
    // Aktualisiere alle 10 Sekunden
    const interval = setInterval(loadTickerData, 10000);
    
    return () => clearInterval(interval);
  }, [selectedCoin, selectedMarket, selectedExchange]);

  // Trading Mode State (Spot oder Futures-Option)
  const [tradingMode, setTradingMode] = useState("Spot");

  // Load symbols from API with exchange parameter
  useEffect(() => {
    const loadSymbols = async () => {
      try {
        setLoading(true);
        const response = await getSymbols(selectedExchange);
        setSymbols(response.symbols);
        console.log(`[Index] Loaded ${response.symbols.length} symbols from ${selectedExchange}`);
      } catch (err) {
        setError('Failed to load symbols');
        console.error('Error loading symbols:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSymbols();
  }, [selectedExchange]); // Reload when exchange changes

  const handleSymbolSelect = (symbol: string, market: string) => {
    setSelectedCoin(symbol);
    setSelectedMarket(market);
    
    // Update current coin data with real data from symbols
    const symbolData = symbols.find(s => 
      s.symbol.replace('/', '') === symbol && s.market === market
    );
    
    if (symbolData) {
      setCurrentCoinData({
        id: symbol,
        symbol: symbolData.symbol,
        market: symbolData.market,
        price: symbolData.price,
        change: symbolData.change,
        changePercent: symbolData.changePercent,
        isFavorite: false,
        liveStatus: "green",
        histStatus: "green",
      });
    }
  };

  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin.symbol.replace('/', ''));
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
          onTradingModeChange={setTradingMode}
          onExchangeChange={handleExchangeChange}
          onViewChange={setViewMode}
        />

        {/* Market & Price Section */}
        <div className="flex gap-5 max-lg:flex-col max-lg:gap-0">
          {/* Column 1: Coin Selector */}
          <div className="flex flex-col w-[17%] max-lg:w-full max-lg:ml-0">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading symbols...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-500 mb-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <AdvancedCoinSelector
                selectedSymbol={currentCoinData.symbol}
                onSymbolSelect={handleSymbolSelect}
                onSettingsClick={() => setSettingsModalOpen(true)}
                exchange={selectedExchange}
                selectedMarket={tradingMode}
              />
            )}
          </div>

          {/* Column 2: Price Display */}
          <div className="flex flex-col w-[83%] ml-5 max-lg:w-full max-lg:ml-0">
            <PriceDisplay
              currentCoinData={currentCoinData}
              marketData={marketData}
              tradingMode={tradingMode}
            />
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
          selectedMarket={currentCoinData.market}
          selectedInterval={selectedInterval}
          selectedIndicators={selectedIndicators}
          selectedExchange={selectedExchange}
          onIndicatorRemove={handleIndicatorRemove}
        />

        {/* Settings Modal */}
        <CoinSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          selectedSymbol={selectedCoin}
          selectedMarket={selectedMarket}
        />
      </div>
    </ThemeProvider>
  );
};

export default Index;
