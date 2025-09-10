import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shared/ui/resizable";
import OrderBook from "./OrderBook";
import ChartView from "./ChartView";
import { MarketTrades } from "./MarketTrades";

interface ChartSectionProps {
  selectedCoin?: string;
  selectedMarket?: string;
  selectedInterval?: string;
  selectedIndicators?: string[];
  selectedExchange?: string;
  onIndicatorRemove?: (indicator: string) => void;
}

const ChartSection = ({
  selectedCoin = "BTC/USDT",
  selectedMarket = "spot",
  selectedInterval = "1m",
  selectedIndicators = [],
  selectedExchange = "bitget",
  onIndicatorRemove,
}: ChartSectionProps) => {
  return (
    <div className="mt-1 space-y-4">
      <div className="h-[500px]">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[500px] rounded-lg border"
        >
          {/* Chart Panel */}
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="h-full">
              <ChartView
                symbol={selectedCoin}
                market={selectedMarket}
                exchange={selectedExchange}
                interval={selectedInterval}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - OrderBook with Tabs (like original) */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={50}>
            <div className="h-full">
              <OrderBook 
                selectedCoin={selectedCoin}
                symbol={selectedCoin}
                market={selectedMarket}
                exchange={selectedExchange}
                currentPrice={104534.14}
                onDataUpdate={(data) => {
                  console.log("Orderbook data updated:", data);
                }}
                onTabChange={(tab) => {
                  console.log("Tab changed:", tab);
                }}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ChartSection;
