/**
 * Latency Indicator Mini
 * Schmale Zeile unten rechts mit FastAPI/WS/GUI Latenz-Werten
 * Jeder MS-Wert in individueller Ampel-Farbe ohne Symbole
 */

import React from 'react';
import { useGlobalPerformance } from '../hooks/useGlobalPerformance';

interface LatencyIndicatorMiniProps {
  onClick: () => void;
}

export const LatencyIndicatorMini: React.FC<LatencyIndicatorMiniProps> = ({ onClick }) => {
  const { metrics, isBackendOnline } = useGlobalPerformance();

  // Individuelle Thresholds für jeden Wert - ABER: Offline = immer rot
  const getLatencyColor = (value: number, type: 'fastapi' | 'websocket' | 'gui'): string => {
    // ❌ Backend offline → alle Werte rot
    if (!isBackendOnline) return 'text-red-500';
    
    // ✅ Backend online → normale Ampel-Logik
    switch (type) {
      case 'fastapi':
        if (value < 5) return 'text-green-500';
        if (value <= 20) return 'text-yellow-500';
        return 'text-red-500';
      
      case 'websocket':
        if (value < 10) return 'text-green-500';
        if (value <= 50) return 'text-yellow-500';
        return 'text-red-500';
      
      case 'gui':
        if (value < 5) return 'text-green-500';
        if (value <= 39) return 'text-yellow-500';
        return 'text-red-500';
      
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 bg-card/90 backdrop-blur-sm border border-border rounded-md px-4 py-2 cursor-pointer hover:bg-card/95 transition-colors text-sm"
    >
      <div className="flex items-center gap-4 whitespace-nowrap">
        {/* Status-Anzeige: Grün wenn online, Rot wenn offline */}
        <span className={isBackendOnline ? 'text-green-500' : 'text-red-500'}>
          ● System connection {isBackendOnline ? 'stable' : 'offline'}
        </span>
        
        <span className="text-muted-foreground">FastAPI = 
          <span className={getLatencyColor(metrics.fastApiLatency, 'fastapi')}>
            {isBackendOnline ? `${metrics.fastApiLatency.toFixed(1)}ms` : 'N/A'}
          </span>
        </span>
        
        <span className="text-muted-foreground">WS = 
          <span className={getLatencyColor(metrics.websocketLatency, 'websocket')}>
            {isBackendOnline ? `${metrics.websocketLatency.toFixed(1)}ms` : 'N/A'}
          </span>
        </span>
        
        <span className="text-muted-foreground">GUI = 
          <span className={getLatencyColor(metrics.frontendLatency, 'gui')}>
            {metrics.frontendLatency.toFixed(1)}ms
          </span>
        </span>
      </div>
    </div>
  );
};

export default LatencyIndicatorMini;
