import React, { useMemo, useCallback } from 'react';
import { VirtualizedList } from '../../../shared/ui/virtualized-list';
import { useDebouncedCallback } from '../../../hooks/use-debounce';

interface OrderbookEntry {
  price: number;
  size: number;
  total: number;
  side: 'buy' | 'sell';
}

interface OptimizedOrderbookProps {
  orders: OrderbookEntry[];
  currentPrice: number;
  onOrderClick?: (order: OrderbookEntry) => void;
}

const OptimizedOrderbook: React.FC<OptimizedOrderbookProps> = ({
  orders,
  currentPrice,
  onOrderClick
}) => {
  // Memoized calculations für bessere Performance
  const { sellOrders, buyOrders, maxTotal } = useMemo(() => {
    const sells = orders
      .filter(order => order.side === 'sell')
      .sort((a, b) => b.price - a.price);
    
    const buys = orders
      .filter(order => order.side === 'buy')
      .sort((a, b) => b.price - a.price);
    
    const maxTotal = Math.max(...orders.map(order => order.total));
    
    return { sellOrders: sells, buyOrders: buys, maxTotal };
  }, [orders]);

  // Debounced click handler
  const debouncedOrderClick = useDebouncedCallback((order: OrderbookEntry) => {
    onOrderClick?.(order);
  }, 150);

  // Memoized render function für Orderbook-Einträge
  const renderOrderEntry = useCallback((order: OrderbookEntry, index: number) => {
    const volumeWidth = maxTotal > 0 ? (order.total / maxTotal) * 100 : 0;
    
    return (
      <div
        key={`${order.side}-${order.price}-${index}`}
        className="relative cursor-pointer hover:bg-muted transition-colors"
        onClick={() => debouncedOrderClick(order)}
      >
        {/* Volume Background */}
        <div
          className="absolute right-0 top-0 h-full"
          style={{
            width: `${volumeWidth}%`,
            backgroundColor: order.side === 'buy' 
              ? 'rgba(34, 197, 94, 0.15)' 
              : 'rgba(239, 68, 68, 0.15)',
          }}
        />

        {/* Order Row */}
        <div className="relative grid grid-cols-3 text-xs py-1 px-4">
          <div className="font-medium" style={{ 
            color: order.side === 'buy' ? 'var(--color-buy)' : 'var(--color-sell)' 
          }}>
            {order.price.toFixed(2)}
          </div>
          <div className="text-center text-foreground font-medium">
            {order.size.toFixed(6)}
          </div>
          <div className="text-right text-foreground font-medium">
            {order.total.toFixed(2)}
          </div>
        </div>
      </div>
    );
  }, [maxTotal, debouncedOrderClick]);

  return (
    <div className="h-full flex flex-col">
      {/* Sell Orders (Top) */}
      <div className="flex-1">
        <VirtualizedList
          items={sellOrders}
          itemHeight={28}
          containerHeight={200}
          renderItem={renderOrderEntry}
          className="border-b border-gray-200 dark:border-gray-600"
        />
      </div>

      {/* Current Price */}
      <div className="border-y border-border bg-muted py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold" style={{ color: 'var(--color-sell)' }}>
            {currentPrice.toFixed(2)} ↓
          </div>
          <div className="text-xs text-muted-foreground">
            ≈ ${(currentPrice - 10).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Buy Orders (Bottom) */}
      <div className="flex-1">
        <VirtualizedList
          items={buyOrders}
          itemHeight={28}
          containerHeight={200}
          renderItem={renderOrderEntry}
        />
      </div>
    </div>
  );
};

export default OptimizedOrderbook;
