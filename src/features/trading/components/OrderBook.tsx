import React, { useEffect, useState, useMemo } from "react";
import OptimizedOrderbook from "@/features/trading/components/OptimizedOrderbook";
import OptimizedTradesList from "@/features/trading/components/OptimizedTradesList";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { useWebSocket } from "@/features/trading/hooks/useWebSocket";
import { WebSocketService } from "@/services/api/websocket";
import { BaseAPI } from "@/services/api/base";

interface OrderbookEntry {
  price: number;
  size: number;
  total?: number;
  side: "buy" | "sell";
}

interface Trade {
  id: string;
  price: number;
  size: number;
  time: string;
  side: "buy" | "sell";
  ts: string;
}

interface OrderbookProps {
  orders?: OrderbookEntry[];
  trades?: Trade[];
  currentPrice?: number;
  selectedCoin?: string;
  symbol: string;
  market: string;
  exchange: string;
  onDataUpdate?: (data: { orders: OrderbookEntry[]; trades: Trade[] }) => void;
  onTabChange?: (tab: "orderbook" | "trades") => void;
}

const OrderBook = ({
  orders = [],
  trades = [],
  currentPrice = 104534.14,
  selectedCoin = "BTC/USDT",
  symbol,
  market,
  exchange,
  onDataUpdate,
  onTabChange,
}: OrderbookProps) => {
  const [activeTab, setActiveTab] = useState<"orderbook" | "trades">("trades");
  const [liveOrders, setLiveOrders] = useState<OrderbookEntry[]>([]);
  const [liveTrades, setLiveTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced tab change handler
  const debouncedTabChange = useDebouncedCallback((tab: "orderbook" | "trades") => {
    console.log("Tab change requested:", tab);
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  }, 100);

  // Parse symbol for API calls
  const getSymbolAndMarket = () => {
    // Use props first, fallback to selectedCoin parsing
    if (symbol && market) {
      return { symbol, market };
    }
    
    // Handle both "BTC/USDT" and "BTCUSDT" formats
    let parsedSymbol: string;
    if (selectedCoin.includes("/")) {
      const [base, quote] = selectedCoin.split("/");
      parsedSymbol = `${base}${quote}`; // "BTC/USDT" → "BTCUSDT"
    } else {
      parsedSymbol = selectedCoin; // Already in "BTCUSDT" format
    }
    
    const parsedMarket = market || "spot"; // Default to spot, could be dynamic
    return { symbol: parsedSymbol, market: parsedMarket };
  };

  // Memoized processed orders with totals
  const processedOrders = useMemo(() => {
    const ordersToProcess = liveOrders.length > 0 ? liveOrders : orders;
    return ordersToProcess.map(order => ({
      ...order,
      total: order.total || (order.price * order.size)
    }));
  }, [liveOrders, orders]);

  // Fetch orderbook data
  const fetchOrderbook = async () => {
    const { symbol: apiSymbol } = getSymbolAndMarket();
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await BaseAPI.request<any>(`/api/market/orderbook`, {
        params: {
          symbol: apiSymbol,
          market_type: 'spot',
          limit: 15
        }
      });
      
      // Transform API data to component format
      const asks: OrderbookEntry[] = data.asks?.map((ask: any) => ({
        price: ask.price,
        size: ask.size,
        total: ask.price * ask.size,
        side: "sell" as const
      })) || [];
      
      const bids: OrderbookEntry[] = data.bids?.map((bid: any) => ({
        price: bid.price,
        size: bid.size,
        total: bid.price * bid.size,
        side: "buy" as const
      })) || [];
      
      setLiveOrders([...asks, ...bids]);
    } catch (err) {
      console.error("Failed to fetch orderbook:", err);
      setError(err instanceof Error ? err.message : "Failed to load orderbook");
    } finally {
      setIsLoading(false);
    }
  };

  // WebSocket hooks for live data
  useWebSocket('trade', (tradeData: any) => {
    const newTrade: Trade = {
      id: `${tradeData.ts}-${Math.random()}`,
      price: parseFloat(tradeData.price),
      size: parseFloat(tradeData.size),
      side: tradeData.side,
      time: new Date(tradeData.ts).toLocaleTimeString(),
      ts: tradeData.ts
    };
    
    setLiveTrades(prev => {
      const updated = [newTrade, ...prev];
      return updated.slice(0, 100); // Keep last 100 trades for performance
    });
  }, []);

  useWebSocket('orderbook', (orderbookData: any) => {
    // Transform API data to component format
    const asks: OrderbookEntry[] = orderbookData.asks.map((ask: any) => ({
      price: ask.price,
      size: ask.size,
      total: ask.price * ask.size,
      side: "sell" as const
    }));
    
    const bids: OrderbookEntry[] = orderbookData.bids.map((bid: any) => ({
      price: bid.price,
      size: bid.size,
      total: bid.price * bid.size,
      side: "buy" as const
    }));
    
    setLiveOrders([...asks, ...bids]);
  }, []);

  // Connect to WebSocket service
  useEffect(() => {
    const wsService = WebSocketService.getInstance();
    wsService.connect(symbol, market, exchange);
    
    return () => {
      // Don't disconnect here as other components might be using it
      // WebSocketService manages connection lifecycle
    };
  }, [symbol, market, exchange]);

  // Initial orderbook fetch only - no polling, pure WebSocket updates
  useEffect(() => {
    fetchOrderbook(); // Single initial fetch only
  }, [selectedCoin, symbol]);

  // Use live data if available, fallback to props
  const tradesToShow = liveTrades.length > 0 ? liveTrades : trades;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-600 px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex relative">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                debouncedTabChange("trades");
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer ${
                activeTab === "trades"
                  ? "text-black dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              Markt-Trades
              {activeTab === "trades" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"></div>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                debouncedTabChange("orderbook");
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ml-6 relative cursor-pointer ${
                activeTab === "orderbook"
                  ? "text-black dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              Orderbuch
              {activeTab === "orderbook" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"></div>
              )}
            </button>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            )}
            {!isLoading && !error && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
            {error && (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading ? "Loading..." : error ? "Error" : "Live"}
            </span>
          </div>
        </div>

        {/* Column Headers */}
        {activeTab === "orderbook" && (
          <div className="grid grid-cols-3 text-xs text-gray-500 dark:text-gray-400 pb-2">
            <div className="text-left">
              Preis ({selectedCoin.split("/")[1] || "USDT"})
            </div>
            <div className="text-center">
              Betrag ({selectedCoin.split("/")[0] || "BTC"})
            </div>
            <div className="text-right">Umsatz</div>
          </div>
        )}

        {activeTab === "trades" && (
          <div className="grid grid-cols-3 text-xs text-gray-500 dark:text-gray-400 pb-2">
            <div className="text-left">
              Preis ({selectedCoin.split("/")[1] || "USDT"})
            </div>
            <div className="text-center">
              Betrag ({selectedCoin.split("/")[0] || "BTC"})
            </div>
            <div className="text-right">Zeit</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "orderbook" ? (
          <div className="h-full">
            {/* Error State */}
            {error && (
              <div className="p-4 text-center text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <OptimizedOrderbook
              orders={processedOrders}
              currentPrice={currentPrice}
              onOrderClick={(order: OrderbookEntry) => {
                console.log("Order clicked:", order);
              }}
            />
          </div>
        ) : (
          /* Trades Tab */
          <div className="h-full">
            <OptimizedTradesList
              trades={tradesToShow}
              onTradeClick={(trade: Trade) => {
                console.log("Trade clicked:", trade);
              }}
            />
            
            {/* Empty State */}
            {tradesToShow.length === 0 && !isLoading && (
              <div className="text-gray-400 p-4 text-center">
                {error ? "Failed to load trades" : "No trades yet."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderBook;
