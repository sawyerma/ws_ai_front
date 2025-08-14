import React, { useEffect, useState, useMemo, useRef } from "react";
import { apiClient } from "../../api/symbols";
import OptimizedOrderbook from "./optimized-orderbook";
import OptimizedTradesList from "./optimized-trades-list";
import { useDebouncedCallback } from "../../hooks/use-debounce";

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
  onDataUpdate?: (data: { orders: OrderbookEntry[]; trades: Trade[] }) => void;
  onTabChange?: (tab: "orderbook" | "trades") => void;
}

const Orderbook = ({
  orders = [],
  trades = [],
  currentPrice = 104534.14,
  selectedCoin = "BTC/USDT",
  onDataUpdate,
  onTabChange,
}: OrderbookProps) => {
  const [activeTab, setActiveTab] = useState<"orderbook" | "trades">("trades");
  const [liveOrders, setLiveOrders] = useState<OrderbookEntry[]>([]);
  const [liveTrades, setLiveTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tradeBatchRef = useRef<Trade[]>([]);
  const throttleCountRef = useRef(0);
  const BATCH_SIZE = 5;

  const debouncedTabChange = useDebouncedCallback((tab: "orderbook" | "trades") => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  }, 100);

  const getSymbolAndMarket = () => {
    if (selectedCoin.includes("/")) {
      const [base, quote] = selectedCoin.split("/");
      return { symbol: `${base}${quote}`, market: "spot" };
    }
    return { symbol: selectedCoin, market: "spot" };
  };

  const processedOrders = useMemo(() => {
    const ordersToProcess = liveOrders.length > 0 ? liveOrders : orders;
    return ordersToProcess.map(order => ({
      ...order,
      total: order.total || (order.price * order.size)
    }));
  }, [liveOrders, orders]);

  // Safe Fetch for Orderbook Data
  useEffect(() => {
    let isActive = true;
    const { symbol } = getSymbolAndMarket();

    const fetchOrderbook = async () => {
      if (!isActive) return;
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get(`/api/orderbook`, { 
          params: { symbol, market_type: 'spot', limit: 15 } 
        });
        
        if (isActive && response.data) {
          const data = response.data;
          const asks: OrderbookEntry[] = data.asks.map((ask: any) => ({ 
            price: parseFloat(ask[0]), 
            size: parseFloat(ask[1]), 
            side: "sell" as const 
          }));
          
          const bids: OrderbookEntry[] = data.bids.map((bid: any) => ({ 
            price: parseFloat(bid[0]), 
            size: parseFloat(bid[1]), 
            side: "buy" as const 
          }));
          
          setLiveOrders([...bids, ...asks]);
        }
      } catch (err) {
        if (isActive) {
          console.error("Failed to fetch orderbook:", err);
          setError(err instanceof Error ? err.message : "Failed to load orderbook");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchOrderbook();

    return () => { isActive = false; };
  }, [selectedCoin]);

  // WebSocket connection with reconnect and throttling
  useEffect(() => {
    let isMounted = true;
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      if (!isMounted) return;
      
      const { symbol, market } = getSymbolAndMarket();
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/${symbol}/${market}/trades`;
      
      ws = new WebSocket(wsUrl);
      tradeBatchRef.current = [];
      throttleCountRef.current = 0;

      ws.onopen = () => {
        if (isMounted) {
          console.log(`[Orderbook] Connected to trades WebSocket: ${symbol}/${market}`);
          setError(null);
        }
      };
      
      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "trade") {
            const newTrade: Trade = {
              id: `${msg.ts}-${Math.random().toString(36).substring(2, 10)}`,
              price: parseFloat(msg.price),
              size: parseFloat(msg.size),
              side: msg.side,
              time: new Date(msg.ts).toLocaleTimeString(),
              ts: msg.ts
            };
            
            tradeBatchRef.current.push(newTrade);
            throttleCountRef.current++;
            
            if (throttleCountRef.current >= BATCH_SIZE) {
              setLiveTrades(prev => {
                const updated = [...tradeBatchRef.current, ...prev];
                return updated.slice(0, 100);
              });
              tradeBatchRef.current = [];
              throttleCountRef.current = 0;
            }
          }
        } catch (err) {
          console.error("Error parsing trade message:", err);
        }
      };
      
      ws.onerror = (error) => {
        if (isMounted) {
          setError("Live-Datenverbindung unterbrochen");
          console.error("WebSocket error:", error);
        }
      };
      
      ws.onclose = () => {
        if (!isMounted) return;
        console.log(`[Orderbook] WebSocket closed, reconnecting...`);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null; // Disable reconnect on cleanup
        ws.close();
      }
    };
  }, [selectedCoin]);

  // Process remaining trades on unmount or symbol change
  useEffect(() => {
    return () => {
      if (tradeBatchRef.current.length > 0) {
        setLiveTrades(prev => [...tradeBatchRef.current, ...prev].slice(0, 100));
      }
    };
  }, [selectedCoin]);

  const tradesToShow = liveTrades.length > 0 ? liveTrades : trades;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow h-full flex flex-col"
      style={{ fontFamily: "'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'" }}
    >
      <div className="border-b border-gray-200 dark:border-gray-600 px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex relative">
            <button
              type="button"
              onClick={() => debouncedTabChange("trades")}
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
              onClick={() => debouncedTabChange("orderbook")}
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
      
      <div className="flex-1 overflow-hidden">
        {activeTab === "orderbook" ? (
          <div className="h-full">
            {error && (
              <div className="p-4 text-center text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <OptimizedOrderbook
              orders={processedOrders}
              currentPrice={currentPrice}
              onOrderClick={(order) => console.log("Order clicked:", order)}
            />
          </div>
        ) : (
          <div className="h-full">
            <OptimizedTradesList
              trades={tradesToShow}
              onTradeClick={(trade) => console.log("Trade clicked:", trade)}
            />
            
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

export default Orderbook;
