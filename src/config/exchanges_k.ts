// Exchange Configuration K with Dynamic Loading from Backend API
// ==============================================================
// Loads exchange URLs dynamically from backend settings API
// Replaces hardcoded URLs with GUI-configurable endpoints
// Pattern-Reuse from exchanges.ts (k_api.md implementation)

export interface ExchangeConfig {
  name: string;
  wsUrl: string;
  apiUrl: string;
}

export interface ExchangeConfigs {
  bitget: ExchangeConfig;
  binance: ExchangeConfig;
}

// Cache für geladene Konfiguration
let cachedConfig: ExchangeConfigs | null = null;
let configPromise: Promise<ExchangeConfigs> | null = null;

// Fallback-Konfiguration für den Fall, dass das Backend nicht erreichbar ist
const FALLBACK_CONFIG: ExchangeConfigs = {
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

/**
 * Lädt Exchange-Konfiguration dynamisch vom Backend
 * Nutzt Caching um wiederholte API-Calls zu vermeiden
 */
async function loadExchangeConfig(): Promise<ExchangeConfigs> {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig;
  }

  // Return existing promise if already loading
  if (configPromise) {
    return configPromise;
  }

  // Start loading configuration
  configPromise = (async () => {
    try {
      // Parallel loading aller benötigten Endpoints
      const [bitgetUrls, binanceUrls, bitgetWs, binanceWs] = await Promise.all([
        fetch('/api/settings/urls/bitget', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          // 5 second timeout
          signal: AbortSignal.timeout(5000)
        }),
        fetch('/api/settings/urls/binance', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
        fetch('/api/settings/websockets/bitget', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
        fetch('/api/settings/websockets/binance', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
      ]);

      // Prüfe alle Responses
      if (!bitgetUrls.ok || !binanceUrls.ok || !bitgetWs.ok || !binanceWs.ok) {
        throw new Error(`HTTP Error: ${[bitgetUrls, binanceUrls, bitgetWs, binanceWs].find(r => !r.ok)?.status}`);
      }

      // Parse JSON responses
      const [bitgetUrlsData, binanceUrlsData, bitgetWsData, binanceWsData] = await Promise.all([
        bitgetUrls.json(),
        binanceUrls.json(),
        bitgetWs.json(),
        binanceWs.json(),
      ]);

      // Erstelle Konfiguration aus Backend-Daten
      const config: ExchangeConfigs = {
        bitget: {
          name: 'Bitget',
          wsUrl: bitgetWsData.spot || FALLBACK_CONFIG.bitget.wsUrl,
          apiUrl: `${bitgetUrlsData.rest || 'https://api.bitget.com'}/api/spot/v1`,
        },
        binance: {
          name: 'Binance',
          wsUrl: binanceWsData.spot || FALLBACK_CONFIG.binance.wsUrl,
          apiUrl: `${binanceUrlsData.rest || 'https://api.binance.com'}/api/v3`,
        },
      };

      // Cache die Konfiguration
      cachedConfig = config;
      
      console.log('✅ Exchange K configuration loaded from backend:', config);
      return config;

    } catch (error) {
      console.warn('⚠️ Failed to load exchange K config from backend, using fallback:', error);
      
      // Bei Fehlern: Fallback-Konfiguration verwenden
      cachedConfig = FALLBACK_CONFIG;
      return FALLBACK_CONFIG;
    } finally {
      // Reset promise so future calls can try again
      configPromise = null;
    }
  })();

  return configPromise;
}

/**
 * Exportierte Funktion für den Zugriff auf Exchange-Konfiguration
 * Usage: const config = await getExchangeConfig();
 */
export async function getExchangeConfig(): Promise<ExchangeConfigs> {
  return loadExchangeConfig();
}

/**
 * Synchrone Funktion für den Zugriff auf gecachte Konfiguration
 * Gibt Fallback zurück wenn noch nicht geladen
 */
export function getExchangeConfigSync(): ExchangeConfigs {
  return cachedConfig || FALLBACK_CONFIG;
}

/**
 * Cache leeren - nützlich für Testing oder wenn Konfiguration aktualisiert wurde
 */
export function clearExchangeConfigCache(): void {
  cachedConfig = null;
  configPromise = null;
  console.log('🔄 Exchange K configuration cache cleared');
}

/**
 * Preload der Konfiguration beim Import
 * Startet das Laden im Hintergrund ohne zu warten
 */
export function preloadExchangeConfig(): void {
  if (!cachedConfig && !configPromise) {
    loadExchangeConfig().catch(() => {
      // Ignoriere Fehler beim Preload
    });
  }
}

// Legacy Export für Rückwärtskompatibilität
// Nutzt Fallback-Konfiguration, sollte durch getExchangeConfig() ersetzt werden
export const EXCHANGE_CONFIG = FALLBACK_CONFIG;

// Auto-Preload beim Import
preloadExchangeConfig();
