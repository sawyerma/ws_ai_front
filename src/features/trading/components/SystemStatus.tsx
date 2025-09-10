import React, { useState, useEffect } from 'react';
import { performanceMetrics, PerformanceMetrics } from '../../../services/performanceMetrics';

const SystemStatus: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'stable' | 'unstable'>('stable');

  // Subscribe to real performance metrics
  useEffect(() => {
    // Get initial metrics
    setMetrics(performanceMetrics.getMetrics());
    
    // Subscribe to updates
    const unsubscribe = performanceMetrics.subscribe((newMetrics: PerformanceMetrics) => {
      setMetrics(newMetrics);
      
      // Update connection status based on system health
      setConnectionStatus(newMetrics.systemStatus === 'OPTIMAL' || newMetrics.systemStatus === 'STABLE' ? 'stable' : 'unstable');
    });

    return unsubscribe;
  }, []);

  if (!metrics) {
    return (
      <div className="fixed bottom-4 right-4 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
          <span className="text-yellow-500 font-medium">Initializing performance monitoring...</span>
        </div>
      </div>
    );
  }

  // Determine status colors based on performance
  const getLatencyColor = (latency: number, threshold: number = 2.0) => {
    if (latency <= threshold) return 'text-green-500';
    if (latency <= threshold * 2) return 'text-yellow-500';
    return 'text-red-500';
  };

  const slaStatusColor = metrics.slaStatus === 'ACHIEVED' ? 'text-green-500' :
                        metrics.slaStatus === 'WARNING' ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 text-xs">
      {/* SLA Compliance Status */}
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'stable' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={`font-medium ${slaStatusColor}`}>
          SLA: {metrics.slaCompliance.toFixed(1)}% ({metrics.slaStatus})
        </span>
      </div>
      
      {/* FastAPI Latency */}
      <div className="flex items-center gap-1">
        <span className="text-text-secondary">FastAPI =</span>
        <span className={`font-medium ${getLatencyColor(metrics.fastApiLatency)}`}>
          {metrics.fastApiLatency.toFixed(2)}ms
        </span>
      </div>
      
      {/* WebSocket Latency */}
      <div className="flex items-center gap-1">
        <span className="text-text-secondary">WS =</span>
        <span className={`font-medium ${getLatencyColor(metrics.webSocketLatency)}`}>
          {metrics.webSocketLatency.toFixed(2)}ms
        </span>
      </div>

      {/* JSON Parse Performance */}
      <div className="flex items-center gap-1">
        <span className="text-text-secondary">Parse =</span>
        <span className={`font-medium ${getLatencyColor(metrics.jsonParseLatency, 0.5)}`}>
          {metrics.jsonParseLatency.toFixed(3)}ms
        </span>
      </div>

      {/* DOM Update Performance */}
      <div className="flex items-center gap-1">
        <span className="text-text-secondary">DOM =</span>
        <span className={`font-medium ${getLatencyColor(metrics.domUpdateLatency, 1.0)}`}>
          {metrics.domUpdateLatency.toFixed(3)}ms
        </span>
      </div>

      {/* Messages per Second */}
      <div className="flex items-center gap-1">
        <span className="text-text-secondary">Msg/s =</span>
        <span className="text-blue-500 font-medium">
          {Math.round(metrics.messagesPerSecond)}
        </span>
      </div>
    </div>
  );
};

export default SystemStatus;
