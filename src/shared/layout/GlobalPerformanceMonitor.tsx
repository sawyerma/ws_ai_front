/**
 * Global Performance Monitor
 * EXAKT gleicher Stil wie originales PerformanceDashboard
 * Position: RECHTS UNTEN auf allen Seiten
 */

import React, { useState, useCallback } from 'react';
import { useGlobalPerformance } from '../hooks/useGlobalPerformance';

export const GlobalPerformanceMonitor: React.FC = () => {
  const {
    metrics,
    historicalData,
    isRecording,
    alertThreshold,
    toggleRecording,
    exportPerformanceReport,
    getAmpelStatus
  } = useGlobalPerformance();

  // Verwende corrected Ampel Status direkt aus Hook
  const ampelStatus = getAmpelStatus();
  const slaStatus = metrics.slaCompliance >= 99 ? 'COMPLIANT' : 'VIOLATION';

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      {/* Header - EXAKT wie original */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Ultra-Low-Latency Monitor</h3>
          <p className="text-sm text-muted-foreground">
            Real-time Performance für &lt;5ms SLA-Compliance
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={toggleRecording}
            className={`px-3 py-1 rounded text-sm font-medium ${
              isRecording 
                ? 'bg-[hsl(var(--status-error-bg))] text-[hsl(var(--status-error))]' 
                : 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success))]'
            }`}
          >
            {isRecording ? '⏹ Stop' : '▶ Record'}
          </button>
          
          <button
            onClick={exportPerformanceReport}
            className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm font-medium hover:bg-muted-foreground/10"
          >
            📊 Export
          </button>
        </div>
      </div>

      {/* SLA Status Banner - EXAKT wie original */}
      <div className={`p-4 rounded-lg border-2 ${
        slaStatus === 'COMPLIANT' 
          ? 'border-[hsl(var(--status-success-border))] bg-[hsl(var(--status-success-bg))]'
          : 'border-[hsl(var(--status-error-border))] bg-[hsl(var(--status-error-bg))]'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-muted-foreground">SLA Status:</span>
            <span className={`ml-2 px-3 py-1 rounded text-sm font-bold ${
              slaStatus === 'COMPLIANT' 
                ? 'bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success))]' 
                : 'bg-[hsl(var(--status-error-bg))] text-[hsl(var(--status-error))]'
            }`}>
              {slaStatus === 'COMPLIANT' ? '✅ &lt;5ms ERREICHT' : '❌ SLA VERLETZT'}
            </span>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {metrics.slaCompliance.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Compliance</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid - EXAKT wie original */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Frontend Latenz - AMPEL SYSTEM */}
        <div className={`p-4 rounded-lg border ${ampelStatus.bgColor}`}>
          <div className="text-sm text-muted-foreground">Frontend Latenz</div>
          <div className={`text-2xl font-bold ${ampelStatus.textColor}`}>
            {ampelStatus.latencyMs}
          </div>
          <div className={`text-xs font-medium ${ampelStatus.textColor}`}>
            {ampelStatus.color} {ampelStatus.status}
          </div>
        </div>

        {/* FastAPI Latenz */}
        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">FastAPI</div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.fastApiLatency.toFixed(1)}ms
          </div>
          <div className="text-xs text-muted-foreground">
            {metrics.fastApiLatency <= 20 ? 'Excellent' : 'Needs Optimization'}
          </div>
        </div>

        {/* WebSocket Latenz */}
        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">WebSocket</div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.websocketLatency.toFixed(1)}ms
          </div>
          <div className="text-xs text-muted-foreground">
            {metrics.websocketLatency <= 50 ? 'Ultra-fast' : 'Can Improve'}
          </div>
        </div>

        {/* Parse Time */}
        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">JSON Parse</div>
          <div className="text-2xl font-bold text-foreground">
            {metrics.parseTime.toFixed(2)}ms
          </div>
          <div className="text-xs text-muted-foreground">
            {metrics.parseTime <= 1 ? 'Optimal' : 'Needs Optimization'}
          </div>
        </div>
      </div>

      {/* Detailed Metrics - EXAKT wie original */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* System Resources */}
        <div className="bg-background rounded-lg border p-4">
          <h4 className="font-medium mb-3 text-foreground">System Resources</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Memory Usage</span>
              <span className="text-sm font-mono text-foreground">
                {metrics.memoryUsage.toFixed(1)} MB
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Est. CPU Usage</span>
              <span className="text-sm font-mono text-foreground">
                {metrics.cpuUsage.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Backend Connections</span>
              <span className="text-sm font-mono text-foreground">
                {metrics.backendConnections}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-background rounded-lg border p-4">
          <h4 className="font-medium mb-3 text-foreground">Performance Trends</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Latency (10m)</span>
              <span className="text-sm font-mono text-foreground">
                {historicalData.slice(-10).length > 0
                  ? (historicalData.slice(-10).reduce((sum, d) => sum + d.latency, 0) / historicalData.slice(-10).length).toFixed(2)
                  : '0.00'
                }ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Peak Latency</span>
              <span className="text-sm font-mono text-foreground">
                {historicalData.length > 0
                  ? Math.max(...historicalData.map(d => d.latency)).toFixed(2)
                  : '0.00'
                }ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Data Points</span>
              <span className="text-sm font-mono text-foreground">
                {historicalData.length}
              </span>
            </div>
          </div>
        </div>

        {/* Recording Status */}
        <div className="bg-background rounded-lg border p-4">
          <h4 className="font-medium mb-3 text-foreground">Recording Status</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Recording</span>
              <span className={`text-sm font-mono ${
                isRecording ? 'text-[hsl(var(--status-error))]' : 'text-muted-foreground'
              }`}>
                {isRecording ? '🔴 ACTIVE' : '⚫ STOPPED'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Update</span>
              <span className="text-sm font-mono text-foreground">
                {new Date(metrics.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">SLA Threshold</span>
              <span className="text-sm font-mono text-foreground">
                {alertThreshold}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Latency Chart - EXAKT wie original */}
      <div className="bg-background rounded-lg border p-4">
        <h4 className="font-medium mb-3 text-foreground">Latency Trend (Last 20 Points)</h4>
        
        <div className="h-16 flex items-end justify-between gap-1">
          {historicalData.slice(-20).map((point, index) => {
            const height = Math.min((point.latency / (alertThreshold * 2)) * 100, 100);
            const isAlert = point.latency > alertThreshold;
            
            // Verwende Ampel-System für Chart Colors mit CSS-Variablen
            const getChartColor = (latency: number) => {
              if (latency < 5) return 'bg-[hsl(var(--status-success))]';
              if (latency <= 39) return 'bg-[hsl(var(--status-warning))]'; 
              return 'bg-[hsl(var(--status-error))]';
            };
            
            return (
              <div
                key={index}
                className={`flex-1 rounded-t ${getChartColor(point.latency)}`}
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${point.latency.toFixed(2)}ms at ${new Date(point.timestamp).toLocaleTimeString()}`}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>20 points ago</span>
          <span className="text-[hsl(var(--status-error))]">— {alertThreshold}ms SLA</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalPerformanceMonitor;
