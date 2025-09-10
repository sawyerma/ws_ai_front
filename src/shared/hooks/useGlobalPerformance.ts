/**
 * Global Performance Hook
 * Extrahiert die Performance-Logik aus PerformanceDashboard für globale Verwendung
 * Enterprise-grade Monitoring mit <5ms SLA-Compliance
 */

import { useState, useEffect, useCallback } from 'react';
import { UltraFastParser } from '../../lib/ultraFastParsing';
import { DirectDOMUpdater } from '../../lib/directDOMUpdater';

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
   * Frontend Performance-Metriken sammeln
   */
  const collectFrontendMetrics = useCallback(() => {
    // Parser Performance
    const parseStats = UltraFastParser.getPerformanceStats();
    
    // DOM Update Performance
    const domStats = DirectDOMUpdater.getPerformanceStats();
    
    // Browser Performance API
    const performanceEntries = performance.getEntriesByType('measure');
    
    // Frontend Latenz (durchschnittlich aus letzten 10 Measurements)
    const recentMeasures = performanceEntries
      .filter(entry => entry.name.includes('frontend') || entry.name.includes('update'))
      .slice(-10);
    
    const frontendLatency = recentMeasures.length > 0
      ? recentMeasures.reduce((sum, entry) => sum + entry.duration, 0) / recentMeasures.length
      : 0;
    
    // Memory Usage (wenn verfügbar)
    let memoryUsage = 0;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    
    return {
      frontendLatency,
      parseTime: parseStats.averageParseTime,
      domUpdateTime: domStats.averageUpdateTime,
      memoryUsage
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
   * Metrics aktualisieren
   */
  const updateMetrics = useCallback(async () => {
    const startTime = performance.now();
    
    // Frontend Metriken sammeln
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
      
      // SLA Compliance berechnen
      const compliance = calculateSLACompliance(frontendMetrics.frontendLatency, updated);
      
      // Metriken aktualisieren
      setMetrics({
        ...frontendMetrics,
        backendConnections: backendMetrics.backendConnections,
        messagesPerSecond: backendMetrics.messagesPerSecond,
        websocketLatency: backendMetrics.websocketLatency,
        fastApiLatency: backendMetrics.fastApiLatency,
        slaCompliance: Math.min(compliance, backendMetrics.backendSlaCompliance),
        cpuUsage: measurementLatency < 1 ? 5 : measurementLatency * 2, // Geschätzte CPU-Last
        lastUpdate: Date.now()
      });
      
      return updated;
    });
  }, [collectFrontendMetrics, fetchBackendMetrics, calculateSLACompliance]);

  /**
   * Performance Recording starten/stoppen
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
      
      // Parser und DOM Stats zurücksetzen
      UltraFastParser.resetPerformanceStats();
      DirectDOMUpdater.resetPerformanceStats();
    }
  }, [isRecording]);

  /**
   * Performance-Report exportieren
   */
  const exportPerformanceReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      currentMetrics: metrics,
      historicalData: historicalData,
      parserStats: UltraFastParser.getPerformanceStats(),
      domStats: DirectDOMUpdater.getPerformanceStats(),
      slaThreshold: alertThreshold,
      slaCompliance: metrics.slaCompliance
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [metrics, historicalData, alertThreshold]);

  // Automatische Aktualisierung
  useEffect(() => {
    const interval = setInterval(updateMetrics, 1000); // Jede Sekunde
    
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
