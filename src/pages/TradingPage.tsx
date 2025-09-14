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
    price: "104,911.62",
    change: "-3.56%",
    changePercent: -3.56,
    isFavorite: true,
    liveStatus: "green",
    histStatus: "green",
  });

  // Live Marktdaten aus Backend-API
  const [marketData, setMarketData] = useState({
    change24h: "-3.56%",
    high24h: "110,157.20",
    low24h: "99,666.04",
    volume24h: "6.08K",
    turnover24h: "645.65M",
    category: "Public Chain",
  });

  const handleSymbolSelect = (symbol: string, market: string) => {
    setSelectedCoin(symbol);
    setSelectedMarket(market);
    
    // Update current coin data
    setCurrentCoinData({
      id: symbol,
      symbol: symbol.includes('/') ? symbol : `${symbol.substring(0, symbol.length - 4)}/${symbol.substring(symbol.length - 4)}`,
      market: market,
      price: "104,911.62", // Placeholder
      change: "-3.56%", // Placeholder  
      changePercent: -3.56, // Placeholder
      isFavorite: false,
      liveStatus: "green",
      histStatus: "green",
    });
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
            selectedMarket={tradingMode}
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
