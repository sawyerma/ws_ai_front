import { useState, useEffect } from "react";
import {
  PriceDisplay,
  CoinSelector,
  TradingTerminal
} from "../features/trading";
import TimeButtons from "../features/trading/components/TimeButtons";
import ChartSection from "../features/trading/components/ChartSection";

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

const TradingPage = () => {
  const [selectedCoin, setSelectedCoin] = useState("BTCUSDT");
  const [selectedMarket, setSelectedMarket] = useState("spot");
  const [selectedInterval, setSelectedInterval] = useState("1m");
  const [selectedExchange, setSelectedExchange] = useState("bitget");
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [tradingMode, setTradingMode] = useState("Spot");
  
  const [currentCoinData, setCurrentCoinData] = useState<CoinData>({
    id: "1",
    symbol: "BTC/USDT",
    market: "spot",
    price: "Loading...",
    change: "Loading...",
    changePercent: 0,
    isFavorite: true,
    liveStatus: "green",
    histStatus: "green",
  });

  // Live Marktdaten aus Backend-API
  const [marketData, setMarketData] = useState({
    change24h: "Loading...",
    high24h: "Loading...",
    low24h: "Loading...",
    volume24h: "Loading...",
    turnover24h: "Loading...",
    category: "Public Chain",
  });

  // ✅ ECHTE API-INTEGRATION: Load real market data
  useEffect(() => {
    const loadRealData = async () => {
      try {
        const { SymbolsAPI } = await import('../services/api');
        const ticker = await SymbolsAPI.getTicker(
          selectedExchange, 
          selectedCoin.replace('/', ''), 
          selectedMarket
        );
        
        if (ticker) {
          const changePercent = ticker.changeRate * 100;
          const changeStr = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
          
          setCurrentCoinData(prev => ({
            ...prev,
            price: ticker.last.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 8 
            }),
            change: changeStr,
            changePercent: changePercent
          }));
          
          setMarketData(prev => ({
            ...prev,
            change24h: changeStr,
            high24h: ticker.high24h?.toLocaleString() || prev.high24h,
            low24h: ticker.low24h?.toLocaleString() || prev.low24h,
            volume24h: ticker.baseVol?.toLocaleString() || prev.volume24h
          }));
        }
      } catch (error) {
        console.error('Failed to load real trading data:', error);
      }
    };
    
    if (selectedCoin && selectedExchange) {
      loadRealData();
    }
  }, [selectedCoin, selectedExchange, selectedMarket]);

  const handleSymbolSelect = (symbol: string, market: string) => {
    setSelectedCoin(symbol);
    setSelectedMarket(market);
    
    // ✅ ECHTE API-INTEGRATION: Update current coin data without hardcoded values
    setCurrentCoinData(prev => ({
      ...prev,
      id: symbol,
      symbol: symbol.includes('/') ? symbol : `${symbol.substring(0, symbol.length - 4)}/${symbol.substring(symbol.length - 4)}`,
      market: market,
      price: "Loading...", // Wird durch useEffect API-Call aktualisiert
      change: "Loading...", // Wird durch useEffect API-Call aktualisiert
      changePercent: 0, // Wird durch useEffect API-Call aktualisiert
      isFavorite: false,
      liveStatus: "green",
      histStatus: "green",
    }));
    
    console.log(`[TradingPage] Symbol selected: ${symbol}, Market: ${market} - loading real data...`);
  };

  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin.symbol.replace('/', ''));
    setCurrentCoinData(coin);
  };

  const handleTradingModeChange = (mode: string) => {
    setTradingMode(mode);
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
    setSelectedExchange(exchange);
    console.log(`[TradingPage] Exchange changed to: ${exchange}`);
  };

  // ✅ ENTERPRISE: Callbacks für Live-Price-Updates
  const handlePriceUpdate = (coinData: typeof currentCoinData) => {
    setCurrentCoinData(coinData);
  };

  const handleMarketDataUpdate = (newMarketData: typeof marketData) => {
    setMarketData(newMarketData);
  };

  return (
    <div className="px-6 py-5">
      {/* Market & Price Section */}
      <div className="flex gap-5 max-lg:flex-col max-lg:gap-0">
        {/* Column 1: Coin Selector */}
        <div className="flex flex-col w-[17%] max-lg:w-full max-lg:ml-0">
          <CoinSelector
            selectedSymbol={currentCoinData.symbol}
            onSymbolSelect={handleSymbolSelect}
            exchange={selectedExchange}
            selectedMarket={selectedMarket}
          />
        </div>

        {/* Column 2: Price Display */}
        <div className="flex flex-col w-[83%] ml-5 max-lg:w-full max-lg:ml-0">
          <PriceDisplay
            currentCoinData={currentCoinData}
            marketData={marketData}
            tradingMode={tradingMode}
            selectedExchange={selectedExchange}
            selectedCoin={selectedCoin}
            selectedMarket={selectedMarket}
            onPriceUpdate={handlePriceUpdate}
            onMarketDataUpdate={handleMarketDataUpdate}
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

      {/* Trading Terminal */}
      <div className="mt-4 space-y-2">
        <TradingTerminal />

      </div>
    </div>
  );
};

export default TradingPage;
