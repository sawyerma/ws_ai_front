// services/api/websocket.ts - NUR WebSocket-Logik
import { API_CONFIG } from '../../config';
import { WebSocketMessage } from '../../types';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Function[]> = new Map();
  
  connect(symbol: string, market: string, exchange: string): void {
    const wsUrl = `${API_CONFIG.WS_URL}/ws/${exchange}/${symbol}/${market}`;
    
    this.ws = new WebSocket(wsUrl);
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    if (!this.ws) return;
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit('connected', null);
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.emit(message.type, message.data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };
    
    this.ws.onclose = () => {
      this.handleReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }
  
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      setTimeout(() => {
        this.emit('reconnecting', this.reconnectAttempts);
        // Note: Reconnection logic would need symbol/market/exchange stored
      }, delay);
    } else {
      this.emit('maxReconnectAttemptsReached', null);
    }
  }
  
  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }
  
  unsubscribe(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }
  
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }
  
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}