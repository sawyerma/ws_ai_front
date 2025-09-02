# REFACTORING PLAN - Trading Dashboard Modernisierung

## 🎯 ZIEL
**Moderne, wartungsfreundliche Struktur bei 100% gleichem Design und Funktionalität**

### ✅ ERFOLGS-KRITERIEN
- **Gleiche GUI** - Pixel-perfekt identisch
- **Gleiche Funktionalität** - Alle Features funktionieren
- **Isolierte Pages** - Market, TradingBot, AI als eigenständige Komponenten
- **Ein Stylesheet-System** - Einheitlich mit CSS-Variablen
- **Wartungsfreundlich** - Kleine, fokussierte Dateien (<200 Zeilen)
- **Einfaches Auffinden** - Logische Struktur, keine Abhängigkeiten

---

## 📁 NEUE ORDNERSTRUKTUR

```
src/
├── components/
│   ├── chart/                    # Chart-System (komplett isoliert)
│   │   ├── ChartView.tsx         # Haupt-Chart (max 150 Zeilen)
│   │   ├── ChartSettings.tsx     # Settings-Modal (max 120 Zeilen)
│   │   ├── ChartWebSocket.tsx    # WebSocket-Logik (max 80 Zeilen)
│   │   ├── ChartTheme.tsx        # Theme-Handling (max 60 Zeilen)
│   │   ├── ChartIndicators.tsx   # Indikator-Management (max 100 Zeilen)
│   │   └── index.ts              # Exports
│   │
│   ├── trading/                  # Trading-Komponenten (isoliert)
│   │   ├── OrderBook.tsx         # EINE Orderbook-Komponente (max 150 Zeilen)
│   │   ├── MarketTrades.tsx      # Market Trades (max 100 Zeilen)
│   │   ├── TradingTerminal.tsx   # Trading Terminal (max 120 Zeilen)
│   │   ├── PriceDisplay.tsx      # Preis-Anzeige (max 80 Zeilen)
│   │   └── index.ts
│   │
│   ├── navigation/               # Navigation (isoliert)
│   │   ├── TradingNav.tsx        # Haupt-Navigation (max 100 Zeilen)
│   │   ├── CoinSelector.tsx      # Coin-Auswahl (max 120 Zeilen)
│   │   ├── TimeButtons.tsx       # Zeit-Buttons (max 80 Zeilen)
│   │   ├── MarketSelector.tsx    # Market-Dropdown (max 60 Zeilen)
│   │   └── index.ts
│   │
│   ├── ui/                       # Basis UI-Komponenten (shadcn/ui)
│   │   ├── button.tsx            # Bestehende shadcn/ui Komponenten
│   │   ├── input.tsx             # BLEIBEN UNVERÄNDERT
│   │   ├── modal.tsx             # Nur aufräumen wenn nötig
│   │   └── ... (alle bestehenden UI-Komponenten)
│   │
│   ├── layout/                   # Layout-Komponenten
│   │   ├── AppLayout.tsx         # Haupt-Layout
│   │   ├── PageHeader.tsx        # Page-Header
│       └── index.ts
│   │
│   └── shared/                   # Geteilte Komponenten
│       ├── LoadingSpinner.tsx    # Loading-States
│       ├── ErrorBoundary.tsx     # Error-Handling
│       └── index.ts
│
├── pages/                        # Einzelne Views (komplett isoliert)
│   ├── TradingPage.tsx          # Haupt-Trading (max 150 Zeilen)
│   ├── DatabasePage.tsx         # Database-Management (max 120 Zeilen)
│   ├── WhalesPage.tsx           # Whale-Tracker (max 180 Zeilen)
│   ├── NewsPage.tsx             # News-Feed (max 100 Zeilen)
│   ├── TradingBotPage.tsx       # Trading-Bot (max 150 Zeilen)
│   ├── AIPage.tsx               # AI-Tools (max 200 Zeilen)
│   └── APIPage.tsx              # API-Konfiguration (max 120 Zeilen)
│
├── services/                     # Business-Logik (komplett isoliert)
│   ├── api/
│   │   ├── symbols.ts           # Symbol-API (max 150 Zeilen)
│   │   ├── websocket.ts         # WebSocket-Service (max 100 Zeilen)
│   │   ├── whales.ts            # Whale-API (max 80 Zeilen)
│   │   ├── trading.ts           # Trading-API (max 100 Zeilen)
│   │   ├── base.ts              # Basis-API-Client (max 60 Zeilen)
│   │   └── index.ts
│   │
│   ├── storage/
│   │   ├── localStorage.ts      # LocalStorage-Wrapper (max 80 Zeilen)
│   │   ├── favorites.ts         # Favoriten-Management (max 60 Zeilen)
│   │   ├── settings.ts          # Settings-Management (max 100 Zeilen)
│   │   └── index.ts
│   │
│   └── utils/
│       ├── formatters.ts        # Preis/Datum-Formatierung (max 80 Zeilen)
│       ├── calculations.ts      # Chart-Berechnungen (max 100 Zeilen)
│       ├── validators.ts        # Input-Validierung (max 60 Zeilen)
│       └── index.ts
│
├── hooks/                        # Custom Hooks (komplett isoliert)
│   ├── useWebSocket.ts          # WebSocket-Hook (max 80 Zeilen)
│   ├── useSymbols.ts            # Symbol-Management (max 100 Zeilen)
│   ├── useTheme.ts              # Theme-Management (max 60 Zeilen)
│   ├── useLocalStorage.ts       # LocalStorage-Hook (max 40 Zeilen)
│   ├── useChartData.ts          # Chart-Daten-Hook (max 80 Zeilen)
│   └── index.ts
│
├── types/                        # Zentrale Type-Definitionen
│   ├── api.ts                   # API-Response-Types (max 100 Zeilen)
│   ├── trading.ts               # Trading-Types (max 80 Zeilen)
│   ├── chart.ts                 # Chart-Types (max 60 Zeilen)
│   ├── navigation.ts            # Navigation-Types (max 40 Zeilen)
│   └── index.ts
│
├── styles/                       # EIN einheitliches Styling-System
│   ├── globals.css              # Globale Styles + CSS-Variablen
│   ├── components.css           # Trading-spezifische Komponenten-Klassen
│   ├── themes.css               # Dark/Light Theme-Variablen
│   └── utilities.css            # Custom Utility-Klassen
│
└── config/                       # Zentrale Konfiguration
    ├── api.ts                   # API-URLs, Timeouts (max 40 Zeilen)
    ├── constants.ts             # Trading-Konstanten (max 60 Zeilen)
    ├── exchanges.ts             # Exchange-Konfiguration (max 80 Zeilen)
    └── index.ts
```

---

## 🚀 DETAILLIERTE REFACTORING-PHASEN

### **PHASE 1: FUNDAMENT LEGEN (Woche 1)**

#### **1.1 Ordnerstruktur & Basis (Tag 1)**
```bash
# Neue Ordnerstruktur erstellen
mkdir -p src/components/{chart,trading,navigation,layout,shared}
mkdir -p src/pages src/services/{api,storage,utils}
mkdir -p src/hooks src/types src/styles src/config
```

#### **1.2 Zentrale Type-Definitionen (Tag 1)**
```typescript
// types/trading.ts - ALLE Trading-Interfaces zentral
export interface CoinData {
  symbol: string;
  market: string;
  price: string;
  change: string;
  changePercent: number;
  volume?: string;
  high?: string;
  low?: string;
  isFavorite?: boolean;
  liveStatus?: "green" | "red";
  histStatus?: "green" | "red";
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total?: number;
  side: "buy" | "sell";
}

export interface Trade {
  id: string;
  price: number;
  size: number;
  time: string;
  side: "buy" | "sell";
  ts: string;
}

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// types/api.ts - ALLE API-Interfaces zentral
export interface APIResponse<T> {
  symbols?: T;
  data?: T;
  status?: 'success' | 'error';
  message?: string;
}

export interface WebSocketMessage {
  type: "candle" | "trade" | "orderbook";
  data: any;
  timestamp?: string;
}

// types/navigation.ts - Navigation-Types
export interface NavigationItem {
  id: string;
  name: string;
  icon?: string;
  hasDropdown?: boolean;
}

export type ViewMode = "trading" | "database" | "ai" | "whales" | "news" | "bot" | "api";
export type TradingMode = "Spot" | "USDT-M Futures" | "Coin-M Perpetual-Futures" | "Coin-M Delivery-Futures" | "USDC-M Futures";
export type Exchange = "bitget" | "binance";
```

#### **1.3 EIN einheitliches Styling-System (Tag 2)**
```css
/* styles/globals.css - ALLE Farben und Variablen zentral */
:root {
  /* === TRADING COLORS === */
  --color-buy: #22c55e;
  --color-sell: #ef4444;
  --color-neutral: #6b7280;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;
  
  /* === BACKGROUND COLORS === */
  --bg-primary: #1e1f23;        /* Haupt-Hintergrund */
  --bg-secondary: #17181c;      /* Sidebar, Cards */
  --bg-tertiary: #111827;       /* Dropdowns, Modals */
  --bg-chart: #1f2937;          /* Chart-Hintergrund */
  
  /* === TEXT COLORS === */
  --text-primary: #ffffff;      /* Haupt-Text */
  --text-secondary: #9ca3af;    /* Sekundär-Text */
  --text-muted: #6b7280;        /* Muted-Text */
  --text-accent: #3b82f6;       /* Akzent-Text */
  
  /* === BORDERS & SPACING === */
  --border-color: #374151;
  --border-radius: 8px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* === CHART SPECIFIC === */
  --chart-grid-color: #374151;
  --chart-candle-up: var(--color-buy);
  --chart-candle-down: var(--color-sell);
}

/* === TRADING-SPEZIFISCHE KLASSEN === */
.price-display {
  @apply text-2xl font-bold tracking-wide;
}

.price-up {
  color: var(--color-buy);
}

.price-down {
  color: var(--color-sell);
}

.trading-button {
  @apply px-4 py-2 rounded-lg transition-colors;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.trading-button:hover {
  background-color: var(--bg-tertiary);
}

.trading-button.active {
  background-color: var(--color-info);
  color: white;
}

.status-indicator {
  @apply w-2 h-2 rounded-full;
}

.status-indicator.connected {
  background-color: var(--color-buy);
}

.status-indicator.error {
  background-color: var(--color-sell);
}

.status-indicator.pending {
  background-color: var(--color-warning);
}

/* === LAYOUT KLASSEN === */
.page-container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  font-family: 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif';
}

.page-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-md);
}

.card-container {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
}
```

#### **1.4 Zentrale Konfiguration (Tag 2)**
```typescript
// config/api.ts - ALLE API-Konfiguration zentral
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100',
  WS_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8100',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// config/constants.ts - ALLE Konstanten zentral
export const TRADING_CONSTANTS = {
  DEFAULT_SYMBOL: 'BTCUSDT',
  DEFAULT_MARKET: 'spot',
  DEFAULT_INTERVAL: '1m',
  DEFAULT_EXCHANGE: 'bitget',
  
  INTERVALS: ['1s', '5s', '15s', '1m', '5m', '15m', '1h', '4h', '1d'],
  MARKETS: ['spot', 'usdt-m', 'coin-m-perp', 'coin-m-delivery', 'usdc-m'],
  EXCHANGES: ['bitget', 'binance'],
} as const;

// config/exchanges.ts - Exchange-spezifische Konfiguration
export const EXCHANGE_CONFIG = {
  bitget: {
    name: 'Bitget',
    wsUrl: 'wss://ws.bitget.com/spot/v1/stream',
    apiUrl: 'https://api.bitget.com/api/spot/v1',
  },
  binance: {
    name: 'Binance', 
    wsUrl: 'wss://stream.binance.com:9443/ws',
    apiUrl: 'https://api.binance.com/api/v3',
  },
} as const;
```

### **PHASE 2: SERVICES & API MODERNISIEREN (Woche 2)**

#### **2.1 Einheitlicher API-Layer (Tag 3-4)**
```typescript
// services/api/base.ts - Basis für alle API-Calls
import { API_CONFIG } from '../../config';

export class BaseAPI {
  private static baseURL = API_CONFIG.BASE_URL;
  
  static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
}

// services/api/symbols.ts - NUR Symbol-API
import { BaseAPI } from './base';
import { CoinData, APIResponse } from '../../types';

export class SymbolsAPI extends BaseAPI {
  static async getSymbols(exchange: string): Promise<CoinData[]> {
    const response = await this.request<APIResponse<CoinData[]>>(`/api/market/symbols?exchange=${exchange}`);
    return response.symbols || [];
  }
  
  static async getTicker(symbol: string, market: string): Promise<any> {
    return this.request(`/api/market/ticker?symbol=${symbol}&market=${market}`);
  }
}
```

#### **2.2 Sauberer WebSocket-Service (Tag 4)**
```typescript
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
  }
  
  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
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
  }
}
```

#### **2.3 Storage & Settings-Service (Tag 5)**
```typescript
// services/storage/localStorage.ts - NUR LocalStorage-Wrapper
export class LocalStorageService {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  }
  
  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}

// services/storage/favorites.ts - NUR Favoriten-Logik
import { LocalStorageService } from './localStorage';

export class FavoritesService {
  private static readonly STORAGE_KEY = 'coin-favorites';
  
  static getFavorites(): string[] {
    return LocalStorageService.get(this.STORAGE_KEY, []);
  }
  
  static addFavorite(symbol: string): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(symbol)) {
      LocalStorageService.set(this.STORAGE_KEY, [...favorites, symbol]);
    }
  }
  
  static removeFavorite(symbol: string): void {
    const favorites = this.getFavorites();
    LocalStorageService.set(this.STORAGE_KEY, favorites.filter(f => f !== symbol));
  }
  
  static isFavorite(symbol: string): boolean {
    return this.getFavorites().includes(symbol);
  }
}
```

### **PHASE 3: KOMPONENTEN AUFTEILEN (Woche 2)**

#### **3.1 Chart-System komplett neu strukturieren (Tag 6-8)**
**Vorher:** `ChartView.jsx` (400 Zeilen)
**Nachher:**
```typescript
// components/chart/ChartView.tsx (max 120 Zeilen) - NUR Chart-Rendering
import React from 'react';
import { useChartData } from '../../hooks/useChartData';
import { useChartTheme } from '../../hooks/useChartTheme';
import { ChartData } from '../../types';

interface ChartViewProps {
  symbol: string;
  market: string;
  interval: string;
  exchange: string;
}

export const ChartView: React.FC<ChartViewProps> = ({
  symbol, market, interval, exchange
}) => {
  const { data, loading, error } = useChartData(symbol, market, interval, exchange);
  const { theme, updateTheme } = useChartTheme();
  
  // NUR Chart-Rendering-Logik hier
  // Keine WebSocket-Logik
  // Keine Settings-Logik
  // Keine Theme-Logik
  
  return (
    <div className="chart-container">
      {/* Sauberes Chart-Rendering */}
    </div>
  );
};

// components/chart/ChartSettings.tsx (max 100 Zeilen) - NUR Settings
// components/chart/ChartWebSocket.tsx (max 80 Zeilen) - NUR WebSocket
// components/chart/ChartTheme.tsx (max 60 Zeilen) - NUR Theme
// components/chart/index.ts - Saubere Exports
```

#### **3.2 Navigation komplett aufteilen (Tag 9-10)**
**Vorher:** `trading-nav.tsx` (300 Zeilen)
**Nachher:**
```typescript
// components/navigation/TradingNav.tsx (max 80 Zeilen) - NUR Navigation
import React from 'react';
import { MarketSelector } from './MarketSelector';
import { ExchangeSelector } from './ExchangeSelector';
import { ViewSelector } from './ViewSelector';
import { ThemeToggle } from '../ui/theme-toggle';

export const TradingNav: React.FC = () => {
  return (
    <nav className="trading-nav">
      <div className="nav-left">
        <ViewSelector />
        <MarketSelector />
      </div>
      <div className="nav-right">
        <ExchangeSelector />
        <ThemeToggle />
      </div>
    </nav>
  );
};

// components/navigation/MarketSelector.tsx (max 60 Zeilen) - NUR Market-Dropdown
// components/navigation/ExchangeSelector.tsx (max 40 Zeilen) - NUR Exchange-Dropdown  
// components/navigation/ViewSelector.tsx (max 80 Zeilen) - NUR View-Navigation
```

#### **3.3 Trading-Komponenten vereinheitlichen (Tag 11-12)**
```typescript
// components/trading/OrderBook.tsx - EINE einzige Orderbook-Komponente
import React from 'react';
import { OrderBookEntry } from '../../types';
import { useOrderBook } from '../../hooks/useOrderBook';

interface OrderBookProps {
  symbol: string;
  market: string;
  exchange: string;
}

export const OrderBook: React.FC<OrderBookProps> = ({ symbol, market, exchange }) => {
  const { orders, loading, error } = useOrderBook(symbol, market, exchange);
  
  // NUR Orderbook-Rendering
  // Keine API-Calls hier
  // Keine WebSocket-Logik hier
  
  return (
    <div className="orderbook-container">
      {/* Sauberes Orderbook-Rendering */}
    </div>
  );
};

// components/trading/MarketTrades.tsx (max 80 Zeilen) - NUR Trades-Anzeige
// components/trading/PriceDisplay.tsx (max 60 Zeilen) - NUR Preis-Anzeige
// components/trading/TradingTerminal.tsx (max 100 Zeilen) - NUR Terminal
```

### **PHASE 4: PAGES KOMPLETT ISOLIEREN (Woche 3)**

#### **4.1 Jede Page als eigenständige Komponente (Tag 13-15)**
```typescript
// pages/TradingPage.tsx (max 120 Zeilen) - NUR Trading
import React from 'react';
import { ChartView } from '../components/chart';
import { OrderBook, MarketTrades, PriceDisplay } from '../components/trading';
import { CoinSelector, TimeButtons } from '../components/navigation';

export const TradingPage: React.FC = () => {
  // NUR Trading-State und -Logik
  // Keine Database-Logik
  // Keine Whale-Logik
  // Keine AI-Logik
  
  return (
    <div className="page-container">
      <div className="page-header">
        <CoinSelector />
        <PriceDisplay />
      </div>
      <TimeButtons />
      <div className="chart-section">
        <ChartView />
        <OrderBook />
      </div>
    </div>
  );
};

// pages/WhalesPage.tsx (max 150 Zeilen) - NUR Whale-Tracker
export const WhalesPage: React.FC = () => {
  // NUR Whale-spezifische Logik
  // Komplett isoliert von Trading
  
  return (
    <div className="page-container">
      {/* Whale-spezifisches UI */}
    </div>
  );
};

// pages/TradingBotPage.tsx (max 120 Zeilen) - NUR Trading-Bot
// pages/DatabasePage.tsx (max 100 Zeilen) - NUR Database
// pages/NewsPage.tsx (max 80 Zeilen) - NUR News
// pages/AIPage.tsx (max 150 Zeilen) - NUR AI
// pages/APIPage.tsx (max 100 Zeilen) - NUR API-Config
```

#### **4.2 Haupt-App vereinfachen (Tag 16)**
```typescript
// App.tsx - NUR Routing, keine Business-Logik
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TradingPage, WhalesPage, TradingBotPage, DatabasePage, NewsPage, AIPage, APIPage } from './pages';
import { AppLayout } from './components/layout';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<TradingPage />} />
          <Route path="/whales" element={<WhalesPage />} />
          <Route path="/bot" element={<TradingBotPage />} />
          <Route path="/database" element={<DatabasePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/api" element={<APIPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};
```

### **PHASE 5: HOOKS & UTILITIES (Woche 3)**

#### **5.1 Custom Hooks für jede Funktionalität (Tag 17-18)**
```typescript
// hooks/useChartData.ts - NUR Chart-Daten
import { useState, useEffect } from 'react';
import { ChartData } from '../types';
import { SymbolsAPI } from '../services/api/symbols';

export const useChartData = (symbol: string, market: string, interval: string, exchange: string) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // NUR Chart-Daten laden
    // Keine UI-Logik
    // Keine WebSocket-Logik
  }, [symbol, market, interval, exchange]);
  
  return { data, loading, error };
};

// hooks/useWebSocket.ts - NUR WebSocket-Hook
// hooks/useSymbols.ts - NUR Symbol-Management
// hooks/useTheme.ts - NUR Theme-Management
// hooks/useLocalStorage.ts - NUR LocalStorage-Hook
```

#### **5.2 Utility-Funktionen (Tag 19)**
```typescript
// services/utils/formatters.ts - NUR Formatierung
export class PriceFormatter {
  static formatPrice(price: number): string {
    if (price === 0) return '0.00';
    if (price < 0.0001) return price.toFixed(8);
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  static formatChange(changeRate: number): { change: string; changePercent: number } {
    const changePercent = changeRate * 100;
    const sign = changePercent >= 0 ? '+' : '';
    return {
      change: `${sign}${changePercent.toFixed(2)}%`,
      changePercent: changePercent,
    };
  }
}

// services/utils/calculations.ts - NUR Berechnungen
// services/utils/validators.ts - NUR Validierung
```

### **PHASE 6: MIGRATION & CLEANUP (Woche 4)**

#### **6.1 Schrittweise Migration (Tag 20-22)**
```typescript
// Schritt für Schritt alte Komponenten ersetzen:

// 1. Chart-System migrieren
// Alte: src/components/ChartView.jsx
// Neue: src/components/chart/ChartView.tsx

// 2. Navigation migrieren  
// Alte: src/components/ui/trading-nav.tsx
// Neue: src/components/navigation/TradingNav.tsx

// 3. Trading-Komponenten migrieren
// Alte: src/components/OrderBook.jsx + src/components/Orderbook.jsx
// Neue: src/components/trading/OrderBook.tsx (EINE Komponente)

// 4. Pages migrieren
// Alte: src/pages/Index.tsx (alles in einem)
// Neue: src/pages/TradingPage.tsx (isoliert)
```

#### **6.2 Alte Dateien entfernen (Tag 23)**
```bash
# Systematisch alte Dateien löschen:
rm src/components/ChartView.jsx
rm src/components/OrderBook.jsx  
rm src/components/Orderbook.jsx  # Duplikat entfernen
rm src/components/MarketTrades.jsx
# etc...
```

#### **6.3 Imports aktualisieren (Tag 24)**
```typescript
// Alle Imports auf neue Struktur umstellen:

// Vorher:
import ChartView from '../components/ChartView';
import OrderBook from '../components/OrderBook';

// Nachher:
import { ChartView } from '../components/chart';
import { OrderBook } from '../components/trading';
```

---

## 🎨 EINHEITLICHES STYLING-SYSTEM

### **ALLE Styles in einem System:**
```css
/* styles/globals.css - MASTER Stylesheet */

/* === ERSETZE ALLE INLINE-STYLES === */

/* Vorher: style={{ backgroundColor: '#1e1f23', color: '#ffffff' }} */
/* Nachher: className="trading-container" */
.trading-container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Vorher: style={{ padding: '4px 12px', borderRadius: '4px' }} */
/* Nachher: className="trading-button" */
.trading-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

/* Vorher: Verschiedene Preis-Styles überall */
/* Nachher: EINE Klasse für alle Preise */
.price-display {
  font-size: 1.65rem;
  font-weight: bold;
  line-height: 1.2;
  letter-spacing: 0.05em;
}
```

### **Komponenten-Styles standardisieren:**
```css
/* styles/components.css - Trading-spezifische Komponenten */

/* === CHART STYLES === */
.chart-container {
  background-color: var(--bg-chart);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.chart-status-bar {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background-color: rgba(0, 0, 0, 0.7);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: 0.75rem;
}

/* === ORDERBOOK STYLES === */
.orderbook-container {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.orderbook-header {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
}

.orderbook-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: var(--spacing-xs) var(--spacing-md);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}

.orderbook-row:hover {
  background-color: var(--bg-tertiary);
}

/* === NAVIGATION STYLES === */
.trading-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* === DROPDOWN STYLES === */
.dropdown-container {
  position: relative;
}

.dropdown-trigger {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-trigger:hover {
  background-color: var(--bg-tertiary);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 50;
}
```

---

## 🔧 TECHNISCHE MODERNISIERUNG DETAILS

### **1. TypeScript-Konsistenz (Tag 25-26)**
```typescript
// ALLE .jsx Dateien → .tsx konvertieren
// ALLE any-Types → proper Types
// ALLE Props → Interface-Definitionen

// Vorher: ChartView.jsx mit any-Props
// Nachher: ChartView.tsx mit strikten Types

interface ChartViewProps {
  symbol: string;           // Nicht: any
  market: string;           // Nicht: any  
  interval: string;         // Nicht: any
  exchange: string;         // Nicht: any
  onDataUpdate?: (data: ChartData[]) => void;  // Optional mit Type
}
```

### **2. Performance-Optimierung (Tag 27)**
```typescript
// hooks/useOptimizedChart.ts - Performance-optimiert
import { useMemo, useCallback } from 'react';
import { useDebouncedCallback } from './use-debounce';

export const useOptimizedChart = (rawData: any[]) => {
  // Memoized calculations
  const processedData = useMemo(() => {
    return rawData.map(item => ({
      time: Math.floor(new Date(item.ts).getTime() / 1000),
      open: Number(item.open),
      high: Number(item.high), 
      low: Number(item.low),
      close: Number(item.close),
      volume: Number(item.volume || 0),
    }));
  }, [rawData]);
  
  // Debounced updates
  const debouncedUpdate = useDebouncedCallback((data) => {
    // Update chart
  }, 100);
  
  return { processedData, debouncedUpdate };
};
```

### **3. Error Handling vereinheitlichen (Tag 28)**
```typescript
// services/api/base.ts - Einheitliches Error Handling
export class APIError extends Error {
  constructor(
    message: string, 
    public status: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ErrorHandler {
  static handle(error: unknown, context: string): string {
    if (error instanceof APIError) {
      return `API Error in ${context}: ${error.message}`;
    }
    if (error instanceof Error) {
      return `Error in ${context}: ${error.message}`;
    }
    return `Unknown error in ${context}`;
  }
  
  static logError(error: unknown, context: string): void {
    console.error(`[${context}]`, error);
  }
}
```

---

## 📝 DETAILLIERTE MIGRATION-CHECKLISTE

### **WOCHE 1: FUNDAMENT**

#### **Tag 1-2: Basis schaffen**
- [ ] **Ordnerstruktur anlegen** (5 Min)
  ```bash
  mkdir -p src/{components/{chart,trading,navigation,layout,shared},pages,services/{api,storage,utils},hooks,types,styles,config}
  ```
- [ ] **Zentrale Types erstellen** (30 Min)
  - `types/trading.ts` - Alle Trading-Interfaces
  - `types/api.ts` - Alle API-Interfaces  
  - `types/navigation.ts` - Navigation-Types
  - `types/index.ts` - Zentrale Exports
- [ ] **CSS-Variablen-System** (45 Min)
  - `styles/globals.css` - Master-Stylesheet
  - `styles/components.css` - Trading-Komponenten
  - `styles/themes.css` - Dark/Light Themes
- [ ] **Basis-Konfiguration** (20 Min)
  - `config/api.ts` - API-URLs zentral
  - `config/constants.ts` - Trading-Konstanten
  - `config/exchanges.ts` - Exchange-Config

#### **Tag 3-5: Services & API**
- [ ] **API-Layer modernisieren** (2 Stunden)
  - `services/api/base.ts` - Basis-API-Client
  - `services/api/symbols.ts` - Symbol-API (aus bestehender symbols.ts)
  - `services/api/websocket.ts` - WebSocket-Service
  - `services/api/trading.ts` - Trading-API
- [ ] **Storage-Services** (1 Stunde)
  - `services/storage/localStorage.ts` - LocalStorage-Wrapper
  - `services/storage/favorites.ts` - Favoriten-Management
  - `services/storage/settings.ts` - Settings-Management
- [ ] **Utility-Services** (1 Stunde)
  - `services/utils/formatters.ts` - Preis/Datum-Formatierung
  - `services/utils/calculations.ts` - Chart-Berechnungen
  - `services/utils/validators.ts` - Input-Validierung

### **WOCHE 2: KOMPONENTEN AUFTEILEN**

#### **Tag 6-8: Chart-System komplett neu**
- [ ] **ChartView.jsx aufteilen** (3 Stunden)
  - `components/chart/ChartView.tsx` - NUR Rendering (120 Zeilen)
  - `components/chart/ChartWebSocket.tsx` - NUR WebSocket (80 Zeilen)
  - `components/chart/ChartSettings.tsx` - NUR Settings (100 Zeilen)
  - `components/chart/ChartTheme.tsx` - NUR Theme (60 Zeilen)
  - `components/chart/ChartIndicators.tsx` - NUR Indikatoren (100 Zeilen)
  - `components/chart/index.ts` - Saubere Exports
- [ ] **Chart-Hooks erstellen** (1 Stunde)
  - `hooks/useChartData.ts` - Chart-Daten-Management
  - `hooks/useChartTheme.ts` - Theme-Management
  - `hooks/useChartWebSocket.ts` - WebSocket-Management

#### **Tag 9-10: Navigation aufteilen**
- [ ] **TradingNav.tsx modernisieren** (2 Stunden)
  - `components/navigation/TradingNav.tsx` - Haupt-Navigation (80 Zeilen)
  - `components/navigation/MarketSelector.tsx` - Market-Dropdown (60 Zeilen)
  - `components/navigation/ExchangeSelector.tsx` - Exchange-Dropdown (40 Zeilen)
  - `components/navigation/ViewSelector.tsx` - View-Navigation (80 Zeilen)
- [ ] **CoinSelector modernisieren** (2 Stunden)
  - `components/navigation/CoinSelector.tsx` - Coin-Auswahl (120 Zeilen)
  - Aus `advanced-coin-selector.tsx` migrieren
  - API-Calls in Hooks auslagern
- [ ] **TimeButtons vereinfachen** (1 Stunde)
  - `components/navigation/TimeButtons.tsx` - Zeit-Auswahl (80 Zeilen)
  - Modal-Logik auslagern

#### **Tag 11-12: Trading-Komponenten vereinheitlichen**
- [ ] **OrderBook-Duplikate zusammenführen** (2 Stunden)
  - `OrderBook.jsx` + `Orderbook.jsx` → `components/trading/OrderBook.tsx`
  - EINE einzige, saubere Implementierung
  - Einheitliche Props-Interface
- [ ] **MarketTrades modernisieren** (1 Stunde)
  - `components/trading/MarketTrades.tsx` - Saubere Implementation
  - WebSocket-Logik in Hook auslagern
- [ ] **PriceDisplay extrahieren** (1 Stunde)
  - `components/trading/PriceDisplay.tsx` - Preis-Anzeige isoliert
  - Aus verschiedenen Komponenten extrahieren
- [ ] **TradingTerminal aufteilen** (1 Stunde)
  - `components/trading/TradingTerminal.tsx` - Terminal isoliert

### **WOCHE 3: PAGES ISOLIEREN**

#### **Tag 13-15: Pages komplett trennen**
- [ ] **TradingPage isolieren** (2 Stunden)
  - `pages/TradingPage.tsx` - NUR Trading-Logik (120 Zeilen)
  - Alle Trading-Komponenten importieren
  - Keine anderen Page-Dependencies
- [ ] **WhalesPage isolieren** (2 Stunden)
  - `pages/WhalesPage.tsx` - NUR Whale-Logik (150 Zeilen)
  - Komplett unabhängig von Trading
- [ ] **TradingBotPage isolieren** (1 Stunde)
  - `pages/TradingBotPage.tsx` - NUR Bot-Logik (120 Zeilen)
- [ ] **DatabasePage isolieren** (1 Stunde)
  - `pages/DatabasePage.tsx` - NUR Database-Logik (100 Zeilen)
- [ ] **NewsPage isolieren** (1 Stunde)
  - `pages/NewsPage.tsx` - NUR News-Logik (80 Zeilen)
- [ ] **AIPage isolieren** (2 Stunden)
  - `pages/AIPage.tsx` - NUR AI-Logik (150 Zeilen)
- [ ] **APIPage isolieren** (1 Stunde)
  - `pages/APIPage.tsx` - NUR API-Config-Logik (100 Zeilen)

#### **Tag 16-17: Layout & Shared Components**
- [ ] **AppLayout erstellen** (1 Stunde)
  - `components/layout/AppLayout.tsx` - Haupt-Layout
  - `components/layout/PageHeader.tsx` - Page-Header
- [ ] **Shared Components** (1 Stunde)
  - `components/shared/LoadingSpinner.tsx` - Loading-States
  - `components/shared/ErrorBoundary.tsx` - Error-Handling
- [ ] **Custom Hooks finalisieren** (2 Stunden)
  - `hooks/useSymbols.ts` - Symbol-Management
  - `hooks/useWebSocket.ts` - WebSocket-Management
  - `hooks/useLocalStorage.ts` - Storage-Management

### **WOCHE 4: MIGRATION & CLEANUP**

#### **Tag 18-20: Schrittweise Migration**
- [ ] **Chart-System migrieren** (Tag 18)
  - Alte `ChartView.jsx` durch neue `components/chart/ChartView.tsx` ersetzen
  - Alle Chart-Imports aktualisieren
  - Funktionalität testen
- [ ] **Navigation migrieren** (Tag 19)
  - Alte `trading-nav.tsx` durch neue `components/navigation/TradingNav.tsx` ersetzen
  - Alle Navigation-Imports aktualisieren
  - Dropdown-Funktionalität testen
- [ ] **Trading-Komponenten migrieren** (Tag 20)
  - Alte OrderBook-Duplikate durch neue `components/trading/OrderBook.tsx` ersetzen
  - Alle Trading-Imports aktualisieren
  - WebSocket-Verbindungen testen

#### **Tag 21-22: Pages migrieren**
- [ ] **Index.tsx aufteilen** (Tag 21)
  - Routing-Logik in App.tsx
  - Trading-Logik in TradingPage.tsx
  - Alle anderen Views in separate Pages
- [ ] **Page-Navigation implementieren** (Tag 22)
  - Navigation zwischen Pages
  - State-Management zwischen Pages
  - URL-Routing konfigurieren

#### **Tag 23-24: Cleanup & Finalisierung**
- [ ] **Alte Dateien systematisch entfernen** (Tag 23)
  ```bash
  # Duplikate entfernen
  rm src/components/OrderBook.jsx
  rm src/components/Orderbook.jsx
  
  # Große, aufgeteilte Dateien entfernen
  rm src/components/ChartView.jsx
  rm src/components/ui/trading-nav.tsx
  rm src/components/ui/advanced-coin-selector.tsx
  rm src/components/ui/settings-modal.tsx
  
  # Nicht mehr benötigte Pages
  rm src/pages/ML.tsx  # Wie gewünscht löschen
  ```
- [ ] **Alle Imports aktualisieren** (Tag 24)
  - Relative Imports → Absolute Imports mit @/
  - Index-Dateien für saubere Imports
  - Alle Komponenten-Referenzen prüfen
- [ ] **Styling konsolidieren** (Tag 24)
  - Alle Inline-Styles entfernen
  - CSS-in-JS entfernen
  - Nur noch CSS-Variablen + Tailwind

---

## 🎯 ERFOLGS-VALIDIERUNG

### **Nach jeder Phase prüfen:**
- [ ] **GUI identisch?** - Pixel-perfekter Vergleich
- [ ] **Funktionalität identisch?** - Alle Features funktionieren
- [ ] **Performance gleich/besser?** - Keine Verlangsamung
- [ ] **Keine Fehler?** - Console clean, keine Warnings

### **Finale Validierung:**
- [ ] **Jede Page isoliert testbar** - Market, TradingBot, AI, etc. einzeln aufrufbar
- [ ] **Wartungsfreundlich** - Jede Datei <200 Zeilen
- [ ] **Ein Stylesheet-System** - Keine Inline-Styles mehr
- [ ] **Saubere Imports** - Keine ../../ Pfade
- [ ] **TypeScript-Konsistenz** - Alle .tsx, strikte Types

---

## 🚨 KRITISCHE REGELN

### **WÄHREND DES REFACTORINGS:**
1. **NIEMALS Design ändern** - Pixel-perfekt beibehalten
2. **NIEMALS Funktionalität entfernen** - Alles muss weiter funktionieren
3. **IMMER um Erlaubnis fragen** - Vor jeder Änderung
4. **EIN Schritt nach dem anderen** - Nie mehrere Dinge gleichzeitig
5. **SOFORT testen** - Nach jeder Änderung prüfen

### **DATEI-REGELN:**
- **Max 200 Zeilen pro Datei** - Bei Überschreitung aufteilen
- **Eine Verantwortlichkeit pro Datei** - Chart, Trading, Navigation getrennt
- **Saubere Exports** - index.ts Dateien für jeden Ordner
- **Strikte Types** - Keine any-Types, alle Props typisiert

### **STYLING-REGELN:**
- **NUR CSS-Variablen + Tailwind** - Keine Inline-Styles
- **Einheitliche Klassen** - .trading-button, .price-display, etc.
- **Zentrale Farben** - Alle Farben in CSS-Variablen
- **Responsive Design** - Bestehende Breakpoints beibehalten

---

## 🎯 ENDRESULTAT

### **VORHER vs. NACHHER:**

**VORHER:**
```
src/components/ChartView.jsx (400 Zeilen)
src/components/OrderBook.jsx + Orderbook.jsx (Duplikate)
src/components/ui/trading-nav.tsx (300 Zeilen)
src/pages/Index.tsx (200 Zeilen, alles vermischt)
Inline-Styles überall
Mixed .jsx/.tsx
API-Calls überall verstreut
```

**NACHHER:**
```
src/components/chart/
├── ChartView.tsx (120 Zeilen)
├── ChartSettings.tsx (100 Zeilen)  
├── ChartWebSocket.tsx (80 Zeilen)
└── index.ts

src/components/trading/
├── OrderBook.tsx (150 Zeilen) - EINE Komponente
├── MarketTrades.tsx (100 Zeilen)
└── index.ts

src/pages/
├── TradingPage.tsx (120 Zeilen) - NUR Trading
├── WhalesPage.tsx (150 Zeilen) - NUR Whales
├── TradingBotPage.tsx (120 Zeilen) - NUR Bot
└── ... (alle isoliert)

src/styles/globals.css - EIN Stylesheet-System
Alle .tsx mit strikten Types
Zentrale API-Services
```

### **WARTUNGSFREUNDLICHKEIT:**
- ✅ **Market ändern?** → Nur `pages/TradingPage.tsx` anfassen
- ✅ **TradingBot ändern?** → Nur `pages/TradingBotPage.tsx` anfassen  
- ✅ **Chart-Farbe ändern?** → Nur `styles/globals.css` anfassen
- ✅ **API-Endpoint ändern?** → Nur `config/api.ts` anfassen
- ✅ **Neue Komponente?** → Klare Ordnerstruktur, wo sie hingehört

---

## ⚡ SOFORTIGER START

### **HEUTE SOFORT:**
1. **Ordnerstruktur anlegen** (5 Minuten)
2. **Zentrale Types definieren** (15 Minuten)
3. **CSS-Variablen-System erstellen** (30 Minuten)
4. **Erste Komponente aufteilen** (ChartView.jsx → 4 Dateien)

### **DIESE WOCHE:**
- Tag 1-2: Fundament legen
- Tag 3-5: Services modernisieren
- Tag 6-7: Erste Komponenten aufteilen

---

## 🚨 ABSOLUT KRITISCHE REGELN

1. **NIEMALS zwei Dinge gleichzeitig ändern** - Ein Schritt, dann testen
2. **IMMER um Erlaubnis fragen** - Vor jeder Datei-Änderung
3. **DESIGN NIEMALS ändern** - Pixel-perfekt beibehalten
4. **FUNKTIONALITÄT NIEMALS entfernen** - Alles muss weiter funktionieren
5. **SOFORT testen nach jeder Änderung** - Keine kaputten Zwischenstände
6. **Projektstruktur verstehen** - Erst analysieren, dann ändern
7. **Ports NIEMALS ändern** - 8080, 8100 beibehalten
8. **Äußerst akribisch arbeiten** - Höchste Sorgfalt bei jedem Schritt

---

## 🚀 BEREIT ZUM START!

**Dieser Plan macht genau das, was Sie wollen:**
- ✅ **Gleiche GUI** - Pixel-perfekt
- ✅ **Market, TradingBot, AI als isolierte Komponenten** - Einfach zu finden und ändern
- ✅ **Ein Stylesheet-System** - Wartungsfreundlich
- ✅ **Moderne Struktur** - Kleine, fokussierte Dateien
- ✅ **ML wird gelöscht** - Wie gewünscht

**IHRE ERLAUBNIS FÜR TAG 1:**
1. Ordnerstruktur anlegen (5 Min)
2. Zentrale Types erstellen (30 Min)
3. CSS-Variablen-System erstellen (45 Min)

**Soll ich mit Schritt 1 beginnen?**