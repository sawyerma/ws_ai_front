import { API_CONFIG } from '../../config';
import { WebSocketMessage } from '../../types';

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Function[]> = new Map();
  private currentUrl: string = '';

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(symbol: string, market: string, exchange: string): void {
    const wsUrl = `${API_CONFIG.WS_URL}/ws/${exchange}/${symbol}/${market}`;
    
    if (this.ws && this.currentUrl === wsUrl) {
      return; // Bereits verbunden
    }
    
    this.disconnect();
    this.currentUrl = wsUrl;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers = (): void => {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected', null);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.emit(message.type, message.data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
        this.emit('error', error);
      }
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.handleReconnect();
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  };

  private handleReconnect = (): void => {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * this.reconnectAttempts, 10000);
      
      console.log(`Reconnecting in ${delay}ms...`);
      
      setTimeout(() => {
        if (this.currentUrl) {
          this.connectFromUrl(this.currentUrl);
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  };

  private connectFromUrl = (url: string): void => {
    try {
      this.ws = new WebSocket(url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket reconnection error:', error);
      this.handleReconnect();
    }
  };

  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket callback:', error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.currentUrl = '';
    this.reconnectAttempts = 0;
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return 'connected';
    } else if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      return 'connecting';
    } else if (this.ws && this.ws.readyState === WebSocket.CLOSING) {
      return 'disconnected';
    } else {
      return 'disconnected';
    }
  }
}
