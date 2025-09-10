/**
 * Global Performance Hook
 * Integriert mit PerformanceMetricsService für Ultra-Low-Latency Monitoring
 * Enterprise-grade Monitoring mit <5ms SLA-Compliance
 */

import { useState, useEffect, useCallback } from 'react';
import { performanceMetrics, PerformanceMetrics as NewPerformanceMetrics } from '../../services/performanceMetrics';

interface PerformanceMetrics {
  frontendLatency: number;
  backendConnections: number;
  messagesPerSecond: number;
  parseTime: number;
  domUpdateTime: number;
  memoryUsage: number;
  cpuUsage: number;
  slaCompliance: number;
  lastUpdate: number;
  fastApiLatency: number;
  websocketLatency: number;
}

interface HistoricalData {
  timestamp: number;
  latency: number;
}

interface WebSocketMetrics {
  websocket: {
    active_connections: number;
    active_symbols: number;
    messages_sent: number;
    batch_interval_ms: number;
  };
  performance: {
    avg_latency_ms: number;
    sla_compliance: number;
  };
  status: string;
}

export const useGlobalPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    frontendLatency: 0,
    backendConnections: 0,
    messagesPerSecond: 0,
    parseTime: 0,
    domUpdateTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    slaCompliance: 100,
    lastUpdate: Date.now(),
    fastApiLatency: 0,
    websocketLatency: 0
  });
  
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [alertThreshold] = useState(5); // 5ms SLA threshold
  const [isBackendOnline, setIsBackendOnline] = useState(false); // Backend Connection Status

  /**
   * Backend-Metriken von neuen /api/ws/metrics Endpoint abrufen
   */
  const fetchBackendMetrics = useCallback(async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/ws/metrics');
      const endTime = performance.now();
      
      // FastAPI Latenz aus Header oder Messung
      let fastApiLatency = endTime - startTime;
      
      // ✅ ENTERPRISE: Nutze Server-gemessene Response Time aus Middleware
      const serverProcessTime = response.headers.get('X-Process-Time');
      if (serverProcessTime) {
        const serverLatency = parseFloat(serverProcessTime) * 1000; // Convert to ms
        fastApiLatency = serverLatency;
      }
      
      if (response.ok) {
        const data: WebSocketMetrics = await response.json();
        
        // ✅ Backend ist online
        setIsBackendOnline(true);
        
        return {
          backendConnections: data.websocket?.active_connections || 0,
          messagesPerSecond: data.websocket?.messages_sent || 0,
          websocketLatency: data.performance?.avg_latency_ms || 0,
          fastApiLatency,
          backendSlaCompliance: data.performance?.sla_compliance || 100,
          isOnline: true
        };
      }
    } catch (error) {
      console.warn('[useGlobalPerformance] Backend metrics unavailable:', error);
    }
    
    // ❌ Backend ist offline
    setIsBackendOnline(false);
    
    return {
      backendConnections: 0,
      messagesPerSecond: 0,
      websocketLatency: 0,
      fastApiLatency: 0,
      backendSlaCompliance: 95,
      isOnline: false
    };
  }, []);

  /**
   * Frontend Performance-Metriken von PerformanceMetricsService sammeln
   */
  const collectFrontendMetrics = useCallback(() => {
    const serviceMetrics = performanceMetrics.getMetrics();
    
    // Memory Usage (wenn verfügbar)
    let memoryUsage = 0;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    
    return {
      frontendLatency: serviceMetrics.totalFrontendLatency,
      parseTime: serviceMetrics.jsonParseLatency,
      domUpdateTime: serviceMetrics.domUpdateLatency,
      memoryUsage,
      serviceMetrics // Pass through the full service metrics
    };
  }, []);

  /**
   * SLA Compliance berechnen
   */
  const calculateSLACompliance = useCallback((latency: number, historical: HistoricalData[]) => {
    const recent = historical.slice(-100); // Letzte 100 Measurements
    if (recent.length === 0) return 100;
    
    const compliantMeasurements = recent.filter(data => data.latency <= alertThreshold).length;
    return (compliantMeasurements / recent.length) * 100;
  }, [alertThreshold]);

  /**
   * Metrics aktualisieren - Integriert mit PerformanceMetricsService
   */
  const updateMetrics = useCallback(async () => {
    const startTime = performance.now();
    
    // Frontend Metriken von Service sammeln
    const frontendMetrics = collectFrontendMetrics();
    
    // Backend Metriken abrufen
    const backendMetrics = await fetchBackendMetrics();
    
    const endTime = performance.now();
    const measurementLatency = endTime - startTime;
    
    // Historical Data aktualisieren
    const newDataPoint: HistoricalData = {
      timestamp: Date.now(),
      latency: frontendMetrics.frontendLatency
    };
    
    setHistoricalData(prev => {
      const updated = [...prev, newDataPoint].slice(-200); // Letzte 200 Punkte behalten
      
      // SLA Compliance von PerformanceMetricsService verwenden (bereits korrekt berechnet)
      const serviceCompliance = frontendMetrics.serviceMetrics?.slaCompliance || 100;
      
      // Metriken aktualisieren - Nutze echte Ultra-Low-Latency Daten
      setMetrics({
        frontendLatency: frontendMetrics.frontendLatency,
        parseTime: frontendMetrics.parseTime,
        domUpdateTime: frontendMetrics.domUpdateTime,
        memoryUsage: frontendMetrics.memoryUsage,
        backendConnections: backendMetrics.backendConnections,
        messagesPerSecond: frontendMetrics.serviceMetrics?.messagesPerSecond || backendMetrics.messagesPerSecond,
        websocketLatency: frontendMetrics.serviceMetrics?.webSocketLatency || backendMetrics.websocketLatency,
        fastApiLatency: frontendMetrics.serviceMetrics?.fastApiLatency || backendMetrics.fastApiLatency,
        slaCompliance: Math.min(serviceCompliance, backendMetrics.backendSlaCompliance),
        cpuUsage: measurementLatency < 1 ? 5 : measurementLatency * 2, // Geschätzte CPU-Last
        lastUpdate: Date.now()
      });
      
      return updated;
    });
  }, [collectFrontendMetrics, fetchBackendMetrics, calculateSLACompliance]);

  /**
   * Performance Recording starten/stoppen - Integriert mit PerformanceMetricsService
   */
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop Recording
      setIsRecording(false);
    } else {
      // Start Recording
      setIsRecording(true);
      
      // Performance-Messung starten
      performance.mark('performance-recording-start');
      
      // Clear performance measures for fresh recording
      if (performance.clearMeasures) {
        performance.clearMeasures();
      }
      if (performance.clearMarks) {
        performance.clearMarks();
      }
    }
  }, [isRecording]);

  /**
   * Performance-Report exportieren - Integriert mit PerformanceMetricsService
   */
  const exportPerformanceReport = useCallback(() => {
    const serviceMetrics = performanceMetrics.getMetrics();
    const serviceHistory = performanceMetrics.getHistory();
    
    const report = {
      timestamp: new Date().toISOString(),
      version: '2.0-UltraLowLatency',
      currentMetrics: metrics,
      serviceMetrics: serviceMetrics,
      historicalData: historicalData,
      serviceHistory: serviceHistory,
      ultraLowLatencyComponents: {
        jsonParser: {
          averageParseTime: serviceMetrics.jsonParseLatency,
          description: 'Ultra-Fast JSON Parser with RegEx optimization'
        },
        domUpdater: {
          averageUpdateTime: serviceMetrics.domUpdateLatency,
          description: 'Direct DOM manipulation bypassing React reconciliation'
        },
        webSocket: {
          latency: serviceMetrics.webSocketLatency,
          description: 'Ultra-Low-Latency WebSocket with binary message parsing'
        },
        webWorker: {
          processingTime: serviceMetrics.workerProcessingLatency,
          description: 'Parallel processing with Web Worker for market data calculations'
        }
      },
      slaThreshold: alertThreshold,
      slaCompliance: serviceMetrics.slaCompliance,
      systemStatus: serviceMetrics.systemStatus
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ultra-low-latency-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [metrics, historicalData, alertThreshold]);

  // Automatische Aktualisierung - Höhere Frequenz für Ultra-Low-Latency
  useEffect(() => {
    // Update every 250ms for ultra-responsive monitoring
    const interval = setInterval(updateMetrics, 250);
    
    // Initial update
    updateMetrics();
    
    return () => clearInterval(interval);
  }, [updateMetrics]);

  // Status-Farben basierend auf SLA
  const getLatencyStatus = useCallback((latency: number) => {
    if (latency <= 2) return { color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', status: 'EXCELLENT' };
    if (latency <= alertThreshold) return { color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', status: 'GOOD' };
    return { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', status: 'CRITICAL' };
  }, [alertThreshold]);

  const getAmpelStatus = useCallback(() => {
    const maxLatency = Math.max(metrics.frontendLatency, metrics.fastApiLatency, metrics.websocketLatency);
    
    // 🚦 KORREKTES AMPEL-SYSTEM: < 5ms = Grün, 5-39ms = Orange, > 39ms = Rot
    if (maxLatency < 5) return { 
      color: '🟢', 
      textColor: 'text-green-500', 
      bgColor: 'bg-green-50 dark:bg-green-900/20', 
      status: 'GRÜN',
      latencyMs: `${maxLatency.toFixed(1)}ms`
    };
    if (maxLatency <= 39) return { 
      color: '🟡', 
      textColor: 'text-yellow-500', 
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', 
      status: 'ORANGE',
      latencyMs: `${maxLatency.toFixed(1)}ms`
    };
    return { 
      color: '🔴', 
      textColor: 'text-red-500', 
      bgColor: 'bg-red-50 dark:bg-red-900/20', 
      status: 'ROT',
      latencyMs: `${maxLatency.toFixed(1)}ms`
    };
  }, [metrics.frontendLatency, metrics.fastApiLatency, metrics.websocketLatency]);

  return {
    metrics,
    historicalData,
    isRecording,
    alertThreshold,
    isBackendOnline,
    getLatencyStatus,
    getAmpelStatus,
    toggleRecording,
    exportPerformanceReport,
    updateMetrics
  };
};
