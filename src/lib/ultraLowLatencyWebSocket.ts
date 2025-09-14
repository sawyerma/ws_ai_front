/**
 * Ultra-Low-Latency WebSocket Client for Trading
 * Optimized connection with performance monitoring
 * Target: <2ms WebSocket overhead
 */

import { UltraFastParser } from './ultraFastParsing';
import { DirectDOMUpdater } from './directDOMUpdater';

interface PerformanceMetrics {
  messagesReceived: number;
  averageLatency: number;
  lastLatency: number;
  connectionUptime: number;
  reconnectCount: number;
}

interface WebSocketConfig {
  url: string;
  symbol: string;
  binaryType?: BinaryType;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class UltraLowLatencyWebSocket {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectTime: number = 0;
  
  private performanceMetrics: PerformanceMetrics = {
    messagesReceived: 0,
    averageLatency: 0,
    lastLatency: 0,
    connectionUptime: 0,
    reconnectCount: 0
  };

  private messageHandlers = new Map<string, (data: any) => void>();

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 1000,
      maxReconnectAttempts: 5,
      binaryType: 'arraybuffer',
      ...config
    };
  }

  /**
   * Optimierte Verbindung mit Performance-Monitoring
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const startTime = performance.now();
        
        this.ws = new WebSocket(
          this.config.url,
          this.config.protocols
        );

        // Optimized WebSocket settings
        this.ws.binaryType = this.config.binaryType || 'arraybuffer';

        this.ws.onopen = () => {
          const connectionTime = performance.now() - startTime;
          this.connectTime = Date.now();
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          console.log(`✅ Ultra-fast WebSocket connected for ${this.config.symbol} in ${connectionTime.toFixed(2)}ms`);
          
          // Performance monitoring
          performance.mark('ws-connect-end');
          performance.measure('ws-connect-time', {
            start: startTime,
            end: performance.now()
          });
          
          resolve();
        };

        this.ws.onmessage = (event) => this.handleMessage(event);
        
        this.ws.onerror = (error) => {
          console.error(`WebSocket error for ${this.config.symbol}:`, error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          this.isConnected = false;
          console.log(`WebSocket closed for ${this.config.symbol}:`, event.reason);
          
          // Auto-reconnect logic
          if (!event.wasClean && this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)) {
            this.scheduleReconnect();
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Ultra-schnelle Message-Verarbeitung mit verschiedenen Optimierungsstrategien
   */
  private handleMessage(event: MessageEvent): void {
    const messageStartTime = performance.now();
    
    try {
      let data: any;
      
      // Optimized parsing based on message type
      if (typeof event.data === 'string') {
        // Use ultra-fast parser for JSON strings
        data = UltraFastParser.parseTradingMessage(event.data);
      } else if (event.data instanceof ArrayBuffer) {
        // Handle binary data (faster for high-frequency updates)
        data = this.parseBinaryMessage(event.data);
      } else {
        // Fallback to standard parsing
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      }

      if (!data) return;

      // Route message to appropriate handler
      this.routeMessage(data);

      // Performance tracking
      const messageEndTime = performance.now();
      const latency = messageEndTime - messageStartTime;
      
      this.updatePerformanceMetrics(latency);
      
      // Performance measurement
      performance.measure('ws-message-processing', {
        start: messageStartTime,
        end: messageEndTime
      });

    } catch (error) {
      console.error(`Message processing error for ${this.config.symbol}:`, error);
    }
  }

  /**
   * Binary message parsing (fastest for high-frequency data)
   */
  private parseBinaryMessage(buffer: ArrayBuffer): any {
    // Simplified binary protocol for ultra-low latency
    // Structure: [type(1)][symbol_len(1)][symbol][price(8)][change(4)][timestamp(8)]
    const view = new DataView(buffer);
    let offset = 0;
    
    const type = view.getUint8(offset++);
    const symbolLen = view.getUint8(offset++);
    
    // Extract symbol
    const symbolBytes = new Uint8Array(buffer, offset, symbolLen);
    const symbol = new TextDecoder().decode(symbolBytes);
    offset += symbolLen;
    
    // Extract price data
    const price = view.getFloat64(offset, true); // little-endian
    offset += 8;
    
    const change = view.getFloat32(offset, true);
    offset += 4;
    
    const timestamp = view.getBigUint64(offset, true);
    
    return {
      type: type === 1 ? 'trade' : 'orderbook',
      symbol,
      price,
      change,
      timestamp: Number(timestamp)
    };
  }

  /**
   * Route messages to appropriate handlers for maximum performance
   */
  private routeMessage(data: any): void {
    const { type, symbol } = data;

    switch (type) {
      case 'trade':
      case 'price_update':
        // Direct DOM update for price changes (bypasses React)
        DirectDOMUpdater.updatePriceDirectly(
          symbol,
          data.price,
          data.change
        );
        break;

      case 'orderbook':
        // Direct orderbook update
        if (data.orders) {
          DirectDOMUpdater.updateOrderBookDirectly(symbol, data.orders);
        }
        break;

      case 'volume':
        // Volume updates
        DirectDOMUpdater.updateVolumeDirectly(
          symbol,
          data.volume,
          data.volumeChange
        );
        break;

      default:
        // Custom message handlers
        const handler = this.messageHandlers.get(type);
        if (handler) {
          handler(data);
        }
        break;
    }
  }

  /**
   * Register custom message handler
   */
  onMessage(messageType: string, handler: (data: any) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Send message with optimization
   */
  send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn(`WebSocket not connected for ${this.config.symbol}`);
      return;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
    } catch (error) {
      console.error(`Failed to send message for ${this.config.symbol}:`, error);
    }
  }

  /**
   * Auto-reconnect with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(
      (this.config.reconnectInterval || 1000) * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    console.log(`Reconnecting to ${this.config.symbol} in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.performanceMetrics.reconnectCount++;
      this.connect().catch(error => {
        console.error(`Reconnect failed for ${this.config.symbol}:`, error);
        if (this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)) {
          this.scheduleReconnect();
        }
      });
    }, delay);
  }

  /**
   * Update performance metrics with rolling average
   */
  private updatePerformanceMetrics(latency: number): void {
    this.performanceMetrics.messagesReceived++;
    this.performanceMetrics.lastLatency = latency;
    
    // Rolling average with smoothing factor
    const alpha = 0.1;
    this.performanceMetrics.averageLatency = 
      this.performanceMetrics.averageLatency * (1 - alpha) + latency * alpha;
    
    // Update connection uptime
    if (this.connectTime > 0) {
      this.performanceMetrics.connectionUptime = Date.now() - this.connectTime;
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get WebSocket connection statistics
   */
  getConnectionStats() {
    const wsEntries = performance.getEntriesByName('ws-message-processing');
    const connectEntries = performance.getEntriesByName('ws-connect-time');
    
    return {
      ...this.performanceMetrics,
      averageMessageProcessingTime: wsEntries.length > 0
        ? wsEntries.reduce((sum, entry) => sum + entry.duration, 0) / wsEntries.length
        : 0,
      connectionTime: connectEntries.length > 0 
        ? connectEntries[connectEntries.length - 1]?.duration || 0 
        : 0,
      isConnected: this.isConnected,
      readyState: this.ws?.readyState || WebSocket.CLOSED
    };
  }

  /**
   * Close connection and cleanup
   */
  close(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.messageHandlers.clear();
  }

  /**
   * Force reconnect
   */
  reconnect(): Promise<void> {
    this.close();
    return this.connect();
  }
}
