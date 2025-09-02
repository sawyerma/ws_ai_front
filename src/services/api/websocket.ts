// WebSocket Service
// Clean WebSocket management for real-time data

import { API_CONFIG } from '../../config';
import { WebSocketMessage, Exchange } from '../../types';

type EventCallback = (data: any) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, EventCallback[]> = new Map();
  private isConnecting = false;
  private currentSymbol = '';
  private currentMarket = '';
  private currentExchange: Exchange = 'bitget';
  
  connect(symbol: string, market: string, exchange: Exchange = 'bitget'): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    this.currentSymbol = symbol;
    this.currentMarket = market;
    this.currentExchange = exchange;
    this.isConnecting = true;
    
    this.disconnect(); // Clean up any existing connection
    
    const wsUrl = `${API_CONFIG.WS_URL}/ws/${exchange}/${symbol}/${market}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }
  
  private setupEventHandlers(): void {
    if (!this.ws) return;
    
    this.ws.onopen = () => {
      console.log(`WebSocket connected: ${this.currentSymbol}/${this.currentMarket}`);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.emit('connected', { 
        symbol: this.currentSymbol, 
        market: this.currentMarket,
        exchange: this.currentExchange 
      });
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.emit(message.type, message.data);
        this.emit('message', message);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.isConnecting = false;
      this.emit('disconnected', { code: event.code, reason: event.reason });
      
      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleReconnect();
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
      this.emit('error', error);
    };
  }
  
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.emit('maxReconnectAttemptsReached', null);
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.currentSymbol && this.currentMarket) {
        this.connect(this.currentSymbol, this.currentMarket, this.currentExchange);
      }
    }, delay);
  }
  
  subscribe(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }
  
  unsubscribe(event: string, callback?: EventCallback): void {
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
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebSocket callback for event ${event}:`, error);
      }
    });
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.isConnecting = false;
    this.listeners.clear();
  }
  
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  
  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}