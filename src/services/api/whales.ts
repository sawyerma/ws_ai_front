import { BaseAPI } from './base';

export class WhalesAPI extends BaseAPI {
  // ... existing HTTP methods ...
  static async getWhaleEvents(symbol?: string, limit: number = 100, timeframe: string = '24h') {
    try {
      const response = await this.request('/api/whales', {
        params: { symbol, limit, timeframe }
      });
      return response;
    } catch (error) {
      console.error('[WhalesAPI] Failed to fetch whale events:', error);
      return [];
    }
  }

  static async getWhaleAlerts(symbol?: string) {
    try {
      const response = await this.request('/api/whales/alerts', {
        params: { symbol }
      });
      return response;
    } catch (error) {
      console.error('[WhalesAPI] Failed to fetch whale alerts:', error);
      return [];
    }
  }

  static async getWhaleStatistics(timeframe: string = '24h') {
    try {
      const response = await this.request('/api/whales/stats', {
        params: { timeframe }
      });
      return response;
    } catch (error) {
      console.error('[WhalesAPI] Failed to fetch whale statistics:', error);
      return null;
    }
  }

  static async getWhaleTransactions(symbol: string, limit: number = 50) {
    try {
      const response = await this.request('/api/whales/transactions', {
        params: { symbol, limit }
      });
      return response;
    } catch (error) {
      console.error(`[WhalesAPI] Failed to fetch whale transactions for ${symbol}:`, error);
      return [];
    }
  }

  // 🌐 WEBSOCKET METHODS
  static connectWebSocket() {
    whaleWebSocketManager.connect();
  }

  static subscribeToWhaleEvents(symbol: string, callback: (event: any) => void) {
    whaleWebSocketManager.on('whale_event', callback);
    whaleWebSocketManager.subscribeToSymbol(symbol);
  }

  static subscribeToWhaleAlerts(callback: (alert: any) => void) {
    whaleWebSocketManager.on('whale_alert', callback);
    whaleWebSocketManager.subscribeToAlerts();
  }

  static unsubscribeFromSymbol(symbol: string) {
    whaleWebSocketManager.unsubscribeFromSymbol(symbol);
  }

  static disconnectWebSocket() {
    whaleWebSocketManager.disconnect();
  }
}

// 🌐 WEBSOCKET CONNECTION MANAGER
class WhaleWebSocketManager {
  public ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscriptions = new Set<string>();
  private eventListeners = new Map<string, Function[]>();

  connect() {
    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/whales/ws`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🐋 Whale WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Re-subscribe to all active subscriptions
        this.subscriptions.forEach(symbol => {
          this.subscribeToSymbol(symbol);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (err) {
          console.error('Failed to parse whale WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('🐋 Whale WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('🐋 Whale WebSocket error:', error);
      };

    } catch (err) {
      console.error('Failed to connect to whale WebSocket:', err);
    }
  }

  private handleMessage(data: any) {
    const { type, symbol, data: whaleData } = data;
    
    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(callback => {
      try {
        callback({ symbol, data: whaleData });
      } catch (err) {
        console.error('Whale event listener error:', err);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`🐋 Attempting whale WebSocket reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    }
  }

  subscribeToSymbol(symbol: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'subscribe_symbol',
        symbol: symbol.toUpperCase()
      }));
      this.subscriptions.add(symbol);
    }
  }

  unsubscribeFromSymbol(symbol: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe_symbol',
        symbol: symbol.toUpperCase()
      }));
      this.subscriptions.delete(symbol);
    }
  }

  subscribeToAlerts() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'subscribe_alerts'
      }));
    }
  }

  on(eventType: string, callback: Function) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  off(eventType: string, callback: Function) {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.eventListeners.clear();
  }
}

// Singleton instance
export const whaleWebSocketManager = new WhaleWebSocketManager();
