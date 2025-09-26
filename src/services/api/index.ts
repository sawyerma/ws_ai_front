export * from './base';
export * from './symbols';
export * from './websocket';
export * from './chart';
export * from './trading';
export * from './market'; // ✅ NEU: Health, Metrics, Settings
export * from './exchanges'; // ✅ NEU: Binance, Bitget APIs
export * from './whales'; // ✅ NEU: Dedizierte WhalesAPI (konsistent mit anderen APIs)

// ===== VOLLSTÄNDIGE BACKEND-INTEGRATION =====

// TEIL B: AI + Whale Features
export * from './ai';          // AI-Strategy-Engine

// TEIL C: Enterprise Features
export * from './enterprise';  // Enterprise-Router-Features

// Extended APIs (bereits teilweise vorhanden, in Teilen A-C erweitert)
export * from './trading';     // Vollständiger Trading-Router (TEIL A)
export * from './market';      // Erweiterte Market-APIs
export * from './whales';      // Whale-WebSocket-System (TEIL B)
export * from './exchanges';   // Exchange-spezifische APIs
