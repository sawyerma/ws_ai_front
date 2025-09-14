import { useState, useEffect } from "react";
import { SymbolsAPI } from '../../../services/api';

interface CoinData {
  id: string;
  symbol: string;
  market: string;  // ✅ ENTERPRISE: Market property für Interface-Kompatibilität
  price: string;
  change: string;
  changePercent: number;
  isFavorite: boolean;
  liveStatus: "green" | "red";
  histStatus: "green" | "red";
}

interface MarketData {
  change24h: string; // z.B. "-3.56%"
  high24h: string; // z.B. "110.157,20"
  low24h: string; // z.B. "99.666,04"
  volume24h: string; // z.B. "6.08K"
  turnover24h: string; // z.B. "645.65M"
  category: string; // z.B. "Public Chain"
}

interface PriceDisplayProps {
  currentCoinData: CoinData;
  marketData?: MarketData; // Optional - falls nicht übergeben werden Dummy-Daten verwendet
  tradingMode?: string; // "Spot" oder gewählte Futures-Option
  selectedExchange?: string; // ✅ ENTERPRISE: Exchange für API-Calls
  selectedCoin?: string; // ✅ ENTERPRISE: Coin für API-Calls  
  selectedMarket?: string; // ✅ ENTERPRISE: Market für API-Calls
  onPriceUpdate?: (coinData: CoinData) => void; // ✅ ENTERPRISE: Callback für Live-Updates
  onMarketDataUpdate?: (marketData: MarketData) => void; // ✅ ENTERPRISE: Callback für Market-Updates
}

const PriceDisplay = ({
  currentCoinData,
  marketData,
  tradingMode = "Spot",
  selectedExchange = "bitget",
  selectedCoin,
  selectedMarket = "spot",
  onPriceUpdate,
  onMarketDataUpdate,
}: PriceDisplayProps) => {
  // Fallback zu Dummy-Daten wenn keine MarketData übergeben werden
  const defaultMarketData: MarketData = {
    change24h: currentCoinData.change,
    high24h: "108,957.20",
    low24h: "103,399.96",
    volume24h: "6.08K",
    turnover24h: "645.65M",
    category: "Public Chain",
  };

  const data = marketData || defaultMarketData;

  // State für Preisvergleich
  const [previousPrice, setPreviousPrice] = useState<string>(
    currentCoinData.price,
  );
  const [priceColor, setPriceColor] = useState<string>("text-foreground");

  // ✅ ENTERPRISE-WEBSOCKET-REAL-TIME-UPDATES (MS-BEREICH):
  useEffect(() => {
    if (!selectedCoin || !selectedExchange) return;
    
    // Initial API load
    const initialLoad = async () => {
      try {
        const ticker = await SymbolsAPI.getTicker(
          selectedExchange, 
          selectedCoin.replace('/', ''), 
          selectedMarket
        );
        
        if (ticker) {
          const changePercent = ticker.changeRate * 100;
          const changeStr = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
          
          const updatedCoinData = {
            ...currentCoinData,
            price: ticker.last.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 8 
            }),
            change: changeStr,
            changePercent: changePercent
          };
          
          const updatedMarketData = {
            ...data,
            change24h: changeStr,
            high24h: ticker.high24h?.toLocaleString() || data.high24h,
            low24h: ticker.low24h?.toLocaleString() || data.low24h,
            volume24h: ticker.baseVol?.toLocaleString() || data.volume24h
          };
          
          if (onPriceUpdate) onPriceUpdate(updatedCoinData);
          if (onMarketDataUpdate) onMarketDataUpdate(updatedMarketData);
        }
      } catch (error) {
        console.error('Failed to load initial price:', error);
      }
    };
    
    // WebSocket-basierte Real-time-Updates (ms-Bereich)
    const wsUrl = `ws://localhost:8100/ws/${selectedExchange}/${selectedCoin.replace('/', '')}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log(`[PriceDisplay] WebSocket connected: ${wsUrl}`);
      initialLoad(); // Load initial data
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle real-time ticker updates (ms-Bereich)
        if (data.type === 'ticker' || data.type === 'trade') {
          const price = data.price || data.last;
          if (price) {
            const updatedCoinData = {
              ...currentCoinData,
              price: price.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 8 
              })
            };
            
            if (onPriceUpdate) onPriceUpdate(updatedCoinData);
            console.log(`[PriceDisplay] WebSocket price update: ${price}`);
          }
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('[PriceDisplay] WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('[PriceDisplay] WebSocket disconnected');
    };
    
    return () => {
      ws.close();
    };
  }, [selectedExchange, selectedCoin, selectedMarket]);

  // Preis-Änderungen überwachen
  useEffect(() => {
    const currentPriceNum = parseFloat(currentCoinData.price.replace(/,/g, ""));
    const previousPriceNum = parseFloat(previousPrice.replace(/,/g, ""));

    if (currentPriceNum > previousPriceNum) {
      setPriceColor("text-green-600"); // Preis gestiegen = grün
    } else if (currentPriceNum < previousPriceNum) {
      setPriceColor("text-red-600"); // Preis gefallen = rot
    } else {
      setPriceColor("text-foreground"); // Kein Preischange = neutral
    }

    setPreviousPrice(currentCoinData.price);
  }, [currentCoinData.price]);

  // Δ 24h Farbe basierend auf Vorzeichen
  const getDelta24hColor = () => {
    if (data.change24h.startsWith("+")) {
      return "text-green-600"; // Positiv = grün
    } else if (data.change24h.startsWith("-")) {
      return "text-red-600"; // Negativ = rot
    }
    return "text-foreground"; // Neutral = foreground
  };

  return (
    <div className="flex items-start gap-8 mb-1">
      {/* Price + Type */}
      <div className="flex flex-col items-start min-w-[170px]">
        <span
          className={`text-[1.65rem] font-bold ${priceColor} leading-tight tracking-wider`}
        >
          {currentCoinData.price}
        </span>
        <span className="text-sm text-muted-foreground tracking-wider mt-0">
          {tradingMode}
        </span>
      </div>

      {/* Market Data - All in one line */}
      <div className="flex items-center gap-x-6 text-[0.8rem] mt-2 font-sans whitespace-nowrap text-muted-foreground">
        <span>
          Δ 24h:{" "}
          <span className={`font-bold ${getDelta24hColor()}`}>
            {data.change24h}
          </span>
        </span>
        <span>
          24h Hoch: <b>{data.high24h}</b>
        </span>
        <span>
          24h Tief: <b>{data.low24h}</b>
        </span>
        <span>
          24h Vol ({currentCoinData.symbol.split("/")[0]}):{" "}
          <b>{data.volume24h}</b>
        </span>
        <span>
          24h Umsatz ({currentCoinData.symbol.split("/")[1]}):{" "}
          <b>{data.turnover24h}</b>
        </span>
        <span>
          Kategorie: <span className="font-bold">{data.category}</span>
        </span>
      </div>
    </div>
  );
};

export default PriceDisplay;
