/// <reference lib="webworker" />

/**
 * SHARED WORKER für Cross-Tab WebSocket-Support
 * Ermöglicht WebSocket-Sharing zwischen mehreren Browser-Tabs
 */

interface SharedWorkerMessage {
  type: 'INIT' | 'SYMBOLS_REQUEST' | 'SYMBOLS_RESPONSE' | 'TICKER_UPDATE' | 'STATUS_REQUEST' | 'STATUS_RESPONSE';
  exchange?: string;
  data?: any;
  tabId?: string;
}

class WebSocketSharedWorker {
  private connections: Map<string, WebSocket> = new Map();
  private cache: Map<string, any> = new Map();
  private tabs: Set<MessagePort> = new Set();
  private tabIds: Map<MessagePort, string> = new Map();

  constructor() {
    console.log('🚀 WebSocket SharedWorker initialized');
  }

  // ✅ Tab-Registrierung
  registerTab(port: MessagePort, tabId: string) {
    this.tabs.add(port);
    this.tabIds.set(port, tabId);
    console.log(`📱 Tab registered: ${tabId} (Total: ${this.tabs.size})`);

    port.onmessage = (event) => {
      this.handleTabMessage(port, event.data);
    };

    port.onmessageerror = (error) => {
      console.error('SharedWorker message error:', error);
    };

    // Cleanup bei Tab-Schließung
    port.addEventListener('close', () => {
      this.unregisterTab(port);
    });
  }

  // ✅ Tab-Deregistrierung
  unregisterTab(port: MessagePort) {
    const tabId = this.tabIds.get(port);
    this.tabs.delete(port);
    this.tabIds.delete(port);
    console.log(`📱 Tab unregistered: ${tabId} (Remaining: ${this.tabs.size})`);
  }

  // ✅ Message-Handling
  handleTabMessage(sender: MessagePort, message: SharedWorkerMessage) {
    switch (message.type) {
      case 'INIT':
        this.handleInit(sender, message);
        break;
      case 'SYMBOLS_REQUEST':
        this.handleSymbolsRequest(sender, message);
        break;
      case 'STATUS_REQUEST':
        this.handleStatusRequest(sender);
        break;
    }
  }

  // ✅ Tab-Initialisierung
  handleInit(sender: MessagePort, message: SharedWorkerMessage) {
    // Bestehende Cache-Daten an neuen Tab senden
    this.cache.forEach((data, exchange) => {
      sender.postMessage({
        type: 'SYMBOLS_RESPONSE',
        exchange: exchange,
        data: data
      });
    });
  }

  // ✅ Symbol-Anfrage verarbeiten
  async handleSymbolsRequest(sender: MessagePort, message: SharedWorkerMessage) {
    const exchange = message.exchange!;
    
    // Cache-Hit
    if (this.cache.has(exchange)) {
      sender.postMessage({
        type: 'SYMBOLS_RESPONSE',
        exchange: exchange,
        data: this.cache.get(exchange)
      });
      return;
    }

    // WebSocket-Verbindung für Exchange sicherstellen
    await this.ensureWebSocketConnection(exchange);
  }

  // ✅ WebSocket-Verbindung verwalten
  async ensureWebSocketConnection(exchange: string) {
    if (this.connections.has(exchange)) {
      const ws = this.connections.get(exchange)!;
      if (ws.readyState === WebSocket.OPEN) {
        return;
      }
    }

    // Neue WebSocket-Verbindung
    const wsUrl = `ws://localhost:8100/ws/symbols/${exchange}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`✅ SharedWorker WebSocket connected: ${exchange}`);
      this.connections.set(exchange, ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleWebSocketMessage(exchange, data);
    };

    ws.onclose = () => {
      console.log(`🔌 SharedWorker WebSocket closed: ${exchange}`);
      this.connections.delete(exchange);
    };

    ws.onerror = (error) => {
      console.error(`❌ SharedWorker WebSocket error: ${exchange}`, error);
    };
  }

  // ✅ WebSocket-Message verarbeiten
  handleWebSocketMessage(exchange: string, data: any) {
    if (data.type === 'symbols_initial') {
      // Cache aktualisieren
      this.cache.set(exchange, data);
      
      // An alle Tabs broadcaaten
      this.broadcastToAllTabs({
        type: 'SYMBOLS_RESPONSE',
        exchange: exchange,
        data: data
      });
    } else if (data.type === 'ticker_update') {
      // Live-Updates an alle Tabs
      this.broadcastToAllTabs({
        type: 'TICKER_UPDATE',
        exchange: exchange,
        data: data
      });
    }
  }

  // ✅ Status-Anfrage
  handleStatusRequest(sender: MessagePort) {
    const status = {
      connections: Array.from(this.connections.keys()),
      cacheSize: this.cache.size,
      activeTabs: this.tabs.size
    };

    sender.postMessage({
      type: 'STATUS_RESPONSE',
      data: status
    });
  }

  // ✅ Broadcast an alle Tabs
  broadcastToAllTabs(message: any) {
    this.tabs.forEach(port => {
      try {
        port.postMessage(message);
      } catch (error) {
        console.error('Failed to send message to tab:', error);
      }
    });
  }
}

// ✅ SharedWorker-Instance
const sharedWorker = new WebSocketSharedWorker();

// ✅ Verbindungs-Handler
self.addEventListener('connect', (event) => {
  const port = (event as any).ports[0];
  const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  sharedWorker.registerTab(port, tabId);
  port.start();
});
