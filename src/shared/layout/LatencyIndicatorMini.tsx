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

  // Individuelle Thresholds für jeden Wert - GUI IMMER nach Wert färben!
  const getLatencyColor = (value: number, type: 'fastapi' | 'websocket' | 'gui'): string => {
    // ✅ GUI wird IMMER nach Wert gefärbt (unabhängig vom Backend-Status)
    if (type === 'gui') {
      if (value < 5) return 'text-[hsl(var(--status-success))]';
      if (value <= 39) return 'text-[hsl(var(--status-warning))]';
      return 'text-[hsl(var(--status-error))]';
    }
    
    // ❌ Backend offline → FastAPI/WebSocket rot
    if (!isBackendOnline) return 'text-[hsl(var(--status-error))]';
    
    // ✅ Backend online → normale Ampel-Logik für FastAPI/WebSocket
    switch (type) {
      case 'fastapi':
        if (value < 5) return 'text-[hsl(var(--status-success))]';
        if (value <= 20) return 'text-[hsl(var(--status-warning))]';
        return 'text-[hsl(var(--status-error))]';
      
      case 'websocket':
        if (value < 10) return 'text-[hsl(var(--status-success))]';
        if (value <= 50) return 'text-[hsl(var(--status-warning))]';
        return 'text-[hsl(var(--status-error))]';
      
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
        <span className={isBackendOnline ? 'text-[hsl(var(--status-success))]' : 'text-[hsl(var(--status-error))]'}>
          ● System connection {isBackendOnline ? 'stable' : 'offline'}
        </span>
        
        <span className="text-muted-foreground">FastAPI =
          <span className={`${getLatencyColor(metrics.fastApiLatency, 'fastapi')} inline-block w-16 text-right`}>
            {isBackendOnline ? `${metrics.fastApiLatency.toFixed(1)}ms` : 'N/A'}
          </span>
        </span>
        
        <span className="text-muted-foreground">WS =
          <span className={`${getLatencyColor(metrics.websocketLatency, 'websocket')} inline-block w-16 text-right`}>
            {isBackendOnline ? `${metrics.websocketLatency.toFixed(1)}ms` : 'N/A'}
          </span>
        </span>
        
        <span className="text-muted-foreground">GUI =
          <span className={`${getLatencyColor(metrics.frontendLatency, 'gui')} inline-block w-16 text-right`}>
            {metrics.frontendLatency.toFixed(1)}ms
          </span>
        </span>
      </div>
    </div>
  );
};

export default LatencyIndicatorMini;
