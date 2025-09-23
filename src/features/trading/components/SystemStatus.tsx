import React from 'react';
import { useGlobalPerformance } from '../../../shared/hooks/useGlobalPerformance';
import { useMarketHealth } from '../hooks/useMarketData';

const SystemStatus: React.FC = () => {
  const { metrics, isBackendOnline, getAmpelStatus } = useGlobalPerformance();
  const { health, loading: healthLoading, error: healthError } = useMarketHealth();

  // Get ampel status with proper thresholds
  const ampelStatus = getAmpelStatus();
  const backendStatus = isBackendOnline ? 'online' : 'offline';
  
  // Health status from new API
  const healthStatus = health?.status || 'unknown';
  const servicesStatus = health?.services || {};

  // Helper function to get status class based on latency
  const getStatusClass = (latency: number) => {
    if (latency < 5) return 'text-[hsl(var(--status-success))]';
    if (latency <= 39) return 'text-[hsl(var(--status-warning))]';
    return 'text-[hsl(var(--status-error))]';
  };

  // Helper function to get ampel background class
  const getAmpelClass = (status: string) => {
    switch (status) {
      case 'GRÜN': return 'bg-[hsl(var(--status-success))]';
      case 'ORANGE': return 'bg-[hsl(var(--status-warning))]';
      case 'ROT': return 'bg-[hsl(var(--status-error))]';
      default: return 'bg-[hsl(var(--status-success))]';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 text-xs font-mono">
      <div className="flex items-center gap-1">
        {/* AMPEL-SYSTEM: Verwendet globale CSS-Variablen */}
        <div className={`w-2 h-2 rounded-full ${getAmpelClass(ampelStatus.status)}`}></div>
        <span className="text-[hsl(var(--status-success))] font-medium">System connection {backendStatus}</span>
        
        {/* ✅ NEU: Health Status */}
        {!healthLoading && health && (
          <span className="text-muted-foreground ml-2">
            | Health: <span className={healthStatus === 'healthy' ? 'text-[hsl(var(--status-success))]' : 'text-[hsl(var(--status-warning))]'}>
              {healthStatus}
            </span>
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">FastAPI =</span>
        <span className={`font-medium w-12 text-right ${
          backendStatus === 'online' ? getStatusClass(metrics.fastApiLatency) : 'text-muted-foreground'
        }`}>
          {backendStatus === 'online' ? `${metrics.fastApiLatency.toFixed(1)}ms` : 'N/A'}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">WS =</span>
        <span className={`font-medium w-12 text-right ${
          backendStatus === 'online' ? getStatusClass(metrics.websocketLatency) : 'text-muted-foreground'
        }`}>
          {backendStatus === 'online' ? `${metrics.websocketLatency.toFixed(1)}ms` : 'N/A'}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">GUI =</span>
        <span className={`font-medium w-12 text-right ${getStatusClass(metrics.frontendLatency)}`}>
          {metrics.frontendLatency.toFixed(1)}ms
        </span>
      </div>
    </div>
  );
};

export default SystemStatus;
