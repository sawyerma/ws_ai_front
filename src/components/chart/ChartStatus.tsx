// components/chart/ChartStatus.tsx - NUR Status-Anzeige (max 60 Zeilen)
import React from 'react';

interface ChartStatusProps {
  wsStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  interval: string;
  candleCount: number;
  lastUpdate?: string;
  changePercent?: number;
  isLoading?: boolean;
}

export const ChartStatus: React.FC<ChartStatusProps> = ({
  wsStatus,
  interval,
  candleCount,
  lastUpdate,
  changePercent,
  isLoading
}) => {
  const getStatusColor = () => {
    switch (wsStatus) {
      case "connected": return "#10b981";
      case "connecting": return "#f59e0b";
      case "error": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusText = () => {
    switch (wsStatus) {
      case "connected": return "Live";
      case "connecting": return "Connecting...";
      case "error": return "Connection Error";
      default: return "Disconnected";
    }
  };

  return (
    <>
      {/* Status Bar */}
      <div className="absolute top-2 right-2 flex items-center gap-3 bg-white dark:bg-gray-800 bg-opacity-90 px-3 py-1 rounded-lg text-xs border border-gray-200 dark:border-gray-600">
        {/* Connection Status */}
        <div className="flex items-center gap-1">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getStatusColor() }}
          />
          <span className="text-gray-900 dark:text-white">{getStatusText()}</span>
        </div>

        <div className="text-gray-400">|</div>
        <div className="text-gray-700 dark:text-gray-300 font-mono">{interval}</div>

        {!isLoading && (
          <>
            <div className="text-gray-400">|</div>
            <div className="text-gray-700 dark:text-gray-300">{candleCount} candles</div>
            
            {lastUpdate && (
              <>
                <div className="text-gray-400">|</div>
                <div className="text-gray-700 dark:text-gray-300">{lastUpdate}</div>
              </>
            )}
            
            {changePercent !== undefined && (
              <>
                <div className="text-gray-400">|</div>
                <div className="text-gray-700 dark:text-gray-300">
                  {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Error State */}
      {wsStatus === "error" && !isLoading && (
        <div className="absolute bottom-2 left-2 bg-red-600 bg-opacity-90 px-3 py-1 rounded text-white text-xs">
          WebSocket connection failed
        </div>
      )}
    </>
  );
};