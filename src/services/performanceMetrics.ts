/**
 * Performance Metrics Service
 * Aggregiert alle Ultra-Low-Latency Metriken für das Dashboard
 */

import { UltraFastParser } from '../lib/ultraFastParsing';
import { DirectDOMUpdater } from '../lib/directDOMUpdater';
import { UltraLowLatencyWebSocket } from '../lib/ultraLowLatencyWebSocket';

export interface PerformanceMetrics {
  // SLA Compliance
  slaCompliance: number; // percentage
  slaStatus: 'ACHIEVED' | 'WARNING' | 'CRITICAL';
  
  // Core Latencies (in ms)
  jsonParseLatency: number;
  domUpdateLatency: number;
  webSocketLatency: number;
  workerProcessingLatency: number;
  
  // Aggregate metrics
  totalFrontendLatency: number;
  fastApiLatency: number;
  
  // Performance counters
  totalMessages: number;
  messagesPerSecond: number;
  
  // System health
  systemStatus: 'OPTIMAL' | 'STABLE' | 'DEGRADED';
  lastUpdated: number;
}

export class PerformanceMetricsService {
  private static instance: PerformanceMetricsService;
  private metrics: PerformanceMetrics;
  private subscribers: ((metrics: PerformanceMetrics) => void)[] = [];
  private updateInterval: NodeJS.Timeout | null = null;
  private webSocketClient: UltraLowLatencyWebSocket | null = null;
  
  // Performance history for trends
  private metricsHistory: PerformanceMetrics[] = [];
  private readonly MAX_HISTORY = 60; // 60 seconds of history

  constructor() {
    this.metrics = this.getInitialMetrics();
    this.startPerformanceCollection();
  }

  static getInstance(): PerformanceMetricsService {
    if (!PerformanceMetricsService.instance) {
      PerformanceMetricsService.instance = new PerformanceMetricsService();
    }
    return PerformanceMetricsService.instance;
  }

  /**
   * Startet kontinuierliche Metriken-Sammlung
   */
  private startPerformanceCollection(): void {
    // Update metrics every 100ms for ultra-low-latency monitoring
    this.updateInterval = setInterval(() => {
      this.collectMetrics();
      this.notifySubscribers();
    }, 100);
  }

  /**
   * Sammelt Metriken von allen Ultra-Low-Latency Komponenten
   */
  private collectMetrics(): void {
    // Get metrics from all components
    const parsingMetrics = UltraFastParser.getParsingMetrics();
    const domMetrics = DirectDOMUpdater.getDOMUpdateMetrics();
    const wsMetrics = this.webSocketClient?.getPerformanceMetrics() || {
      averageLatency: 0,
      connectionLatency: 0,
      messagesSent: 0,
      messagesReceived: 0,
      reconnectCount: 0
    };

    // Calculate core latencies
    const jsonParseLatency = parsingMetrics.lastParseTime || parsingMetrics.averageParseTime || 0;
    const domUpdateLatency = domMetrics.lastUpdateTime || domMetrics.averagePriceUpdateTime || 0;
    const webSocketLatency = wsMetrics.averageLatency || 0;
    const workerProcessingLatency = this.getWorkerLatency();

    // Calculate total frontend latency
    const totalFrontendLatency = jsonParseLatency + domUpdateLatency + webSocketLatency + workerProcessingLatency;

    // Mock FastAPI latency (would be real in production)
    const fastApiLatency = Math.random() * 2; // 0-2ms for ultra-fast API

    // Calculate SLA compliance
    const slaCompliance = this.calculateSLACompliance(totalFrontendLatency, fastApiLatency);
    
    // Determine system status
    const systemStatus = totalFrontendLatency < 3 ? 'OPTIMAL' : 
                        totalFrontendLatency < 5 ? 'STABLE' : 'DEGRADED';

    // Update metrics
    this.metrics = {
      slaCompliance,
      slaStatus: slaCompliance >= 95 ? 'ACHIEVED' : slaCompliance >= 85 ? 'WARNING' : 'CRITICAL',
      
      jsonParseLatency: Number(jsonParseLatency.toFixed(3)),
      domUpdateLatency: Number(domUpdateLatency.toFixed(3)),
      webSocketLatency: Number(webSocketLatency.toFixed(3)),
      workerProcessingLatency: Number(workerProcessingLatency.toFixed(3)),
      
      totalFrontendLatency: Number(totalFrontendLatency.toFixed(3)),
      fastApiLatency: Number(fastApiLatency.toFixed(3)),
      
      totalMessages: parsingMetrics.totalMessages + wsMetrics.messagesReceived,
      messagesPerSecond: this.calculateMessagesPerSecond(),
      
      systemStatus: systemStatus as 'OPTIMAL' | 'STABLE' | 'DEGRADED',
      lastUpdated: Date.now()
    };

    // Add to history
    this.addToHistory(this.metrics);
  }

  /**
   * Berechnet SLA Compliance (<5ms Ziel)
   */
  private calculateSLACompliance(frontendLatency: number, apiLatency: number): number {
    const totalLatency = frontendLatency + apiLatency;
    const targetSLA = 5.0; // 5ms target
    
    if (totalLatency <= targetSLA) {
      return 100;
    } else if (totalLatency <= targetSLA * 1.5) { // 7.5ms
      return Math.max(85, 100 - ((totalLatency - targetSLA) / targetSLA) * 15);
    } else {
      return Math.max(0, 85 - ((totalLatency - targetSLA * 1.5) / targetSLA) * 20);
    }
  }

  /**
   * Mock Worker Latency (würde echte Worker Performance messen)
   */
  private getWorkerLatency(): number {
    // In production: measure actual web worker processing time
    return Math.random() * 0.5; // 0-0.5ms
  }

  /**
   * Berechnet Nachrichten pro Sekunde
   */
  private calculateMessagesPerSecond(): number {
    if (this.metricsHistory.length < 2) return 0;
    
    const recent = this.metricsHistory.slice(-10); // Last 1 second
    const oldestMessages = recent[0]?.totalMessages || 0;
    const newestMessages = recent[recent.length - 1]?.totalMessages || 0;
    const timeDiff = (recent[recent.length - 1]?.lastUpdated || 0) - (recent[0]?.lastUpdated || 0);
    
    return timeDiff > 0 ? ((newestMessages - oldestMessages) / timeDiff) * 1000 : 0;
  }

  /**
   * Fügt Metriken zur Historie hinzu
   */
  private addToHistory(metrics: PerformanceMetrics): void {
    this.metricsHistory.push({ ...metrics });
    
    if (this.metricsHistory.length > this.MAX_HISTORY) {
      this.metricsHistory.shift();
    }
  }

  /**
   * Registriert WebSocket Client für Performance-Messung
   */
  setWebSocketClient(client: UltraLowLatencyWebSocket): void {
    this.webSocketClient = client;
  }

  /**
   * Aktuelle Metriken abrufen
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Performance-Historie abrufen
   */
  getHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Subscriber für Metriken-Updates
   */
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Benachrichtigt alle Subscriber über Updates
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error('Error notifying performance metrics subscriber:', error);
      }
    });
  }

  /**
   * Initial-Metriken
   */
  private getInitialMetrics(): PerformanceMetrics {
    return {
      slaCompliance: 100,
      slaStatus: 'ACHIEVED',
      
      jsonParseLatency: 0,
      domUpdateLatency: 0,
      webSocketLatency: 0,
      workerProcessingLatency: 0,
      
      totalFrontendLatency: 0,
      fastApiLatency: 0,
      
      totalMessages: 0,
      messagesPerSecond: 0,
      
      systemStatus: 'OPTIMAL',
      lastUpdated: Date.now()
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.subscribers = [];
    this.metricsHistory = [];
  }
}

// Export singleton instance
export const performanceMetrics = PerformanceMetricsService.getInstance();
