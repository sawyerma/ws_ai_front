// Multi-API Provider Configuration with Dynamic Loading from Backend API
// =====================================================================
// Loads all provider URLs dynamically from backend settings API
// Replaces hardcoded URLs with GUI-configurable endpoints
// Extended pattern from k_api.md/l_api.md for multi-API architecture

import { APIProvider } from './api';

export interface ProviderConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  registerUrl: string;
  documentation: string;
  icon: string;
  rateLimit: {
    current: number;
    limit: number;
    windowMs: number;
    resetTime: null;
    warningThreshold: number;
    criticalThreshold: number;
  };
}

export interface ProviderConfigs {
  etherscan: ProviderConfig;
  bscscan: ProviderConfig;
  polygonscan: ProviderConfig;
  coingecko: ProviderConfig;
  binance: ProviderConfig;
  bitget: ProviderConfig;
}

// Cache für geladene Provider-Konfiguration
let cachedProviders: ProviderConfigs | null = null;
let providersPromise: Promise<ProviderConfigs> | null = null;

// Fallback-Provider-Konfiguration mit Environment Variables
const FALLBACK_PROVIDERS: ProviderConfigs = {
  // Blockchain APIs
  etherscan: {
    id: 'etherscan',
    name: 'Etherscan',
    category: 'blockchain',
    description: 'Ethereum blockchain explorer and analytics platform',
    url: '/api/fallback/etherscan',
    registerUrl: 'https://etherscan.io/apis',
    documentation: 'https://docs.etherscan.io/',
    icon: '⟨E⟩',
    rateLimit: {
      current: 0,
      limit: 100000,      // 100k requests/day free tier
      windowMs: 86400000, // 24 hours
      resetTime: null,
      warningThreshold: 80000,   // 80k requests
      criticalThreshold: 95000   // 95k requests
    }
  },
  
  bscscan: {
    id: 'bscscan',
    name: 'BSCScan',
    category: 'blockchain',
    description: 'Binance Smart Chain explorer for BSC data',
    url: '/api/fallback/bscscan',
    registerUrl: 'https://bscscan.com/apis',
    documentation: 'https://docs.bscscan.com/',
    icon: '⟨B⟩',
    rateLimit: {
      current: 0,
      limit: 100000,      // 100k requests/day
      windowMs: 86400000,
      resetTime: null,
      warningThreshold: 80000,
      criticalThreshold: 95000
    }
  },
  
  polygonscan: {
    id: 'polygonscan',
    name: 'PolygonScan',
    category: 'blockchain',
    description: 'Polygon blockchain explorer for MATIC network',
    url: '/api/fallback/polygonscan',
    registerUrl: 'https://polygonscan.com/apis',
    documentation: 'https://docs.polygonscan.com/',
    icon: '⟨P⟩',
    rateLimit: {
      current: 0,
      limit: 100000,
      windowMs: 86400000,
      resetTime: null,
      warningThreshold: 80000,
      criticalThreshold: 95000
    }
  },
  
  coingecko: {
    id: 'coingecko',
    name: 'CoinGecko',
    category: 'data',
    description: 'Cryptocurrency data and market information',
    url: '/api/fallback/coingecko',
    registerUrl: 'https://www.coingecko.com/en/api',
    documentation: 'https://www.coingecko.com/en/api/documentation',
    icon: '🦎',
    rateLimit: {
      current: 0,
      limit: 10000,       // 10k requests/month free
      windowMs: 2628000000, // 1 month
      resetTime: null,
      warningThreshold: 8000,
      criticalThreshold: 9500
    }
  },
  
  // Exchange APIs
  binance: {
    id: 'binance',
    name: 'Binance',
    category: 'exchange',
    description: 'World\'s largest cryptocurrency exchange platform',
    url: '/api/fallback/binance',
    registerUrl: 'https://www.binance.com/en/binance-api',
    documentation: 'https://binance-docs.github.io/apidocs/',
    icon: '₿',
    rateLimit: {
      current: 0,
      limit: 1200,        // 1200 requests/minute
      windowMs: 60000,    // 1 minute
      resetTime: null,
      warningThreshold: 960,    // 80% = 960 req/min
      criticalThreshold: 1140   // 95% = 1140 req/min
    }
  },
  
  bitget: {
    id: 'bitget',
    name: 'Bitget',
    category: 'exchange',
    description: 'Leading cryptocurrency derivatives exchange',
    url: '/api/fallback/bitget',
    registerUrl: 'https://www.bitget.com/api-doc/',
    documentation: 'https://bitgetlimited.github.io/apidoc/',
    icon: '🚀',
    rateLimit: {
      current: 0,
      limit: 600,         // 600 requests/minute
      windowMs: 60000,
      resetTime: null,
      warningThreshold: 480,    // 80% = 480 req/min
      criticalThreshold: 570    // 95% = 570 req/min
    }
  }
} as const;

/**
 * Lädt alle Provider-Konfigurationen dynamisch vom Backend
 * Nutzt Caching um wiederholte API-Calls zu vermeiden
 */
async function loadProviderConfigs(): Promise<ProviderConfigs> {
  // Return cached config if available
  if (cachedProviders) {
    return cachedProviders;
  }

  // Return existing promise if already loading
  if (providersPromise) {
    return providersPromise;
  }

  // Start loading configuration
  providersPromise = (async () => {
    try {
      // Parallel loading aller Provider-APIs + Registration URLs
      const [etherscanUrls, bscscanUrls, polygonscanUrls, coingeckoUrls, binanceUrls, bitgetUrls, registrationUrls] = await Promise.all([
        fetch('/api/settings/urls/etherscan', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
        fetch('/api/settings/urls/bscscan', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
        fetch('/api/settings/urls/polygonscan', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
        fetch('/api/settings/urls/coingecko', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
        fetch('/api/settings/urls/binance', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
        fetch('/api/settings/urls/bitget', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
        fetch('/api/settings/providers/registration-urls', { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }),
      ]);

      // Prüfe alle Responses
      const responses = [etherscanUrls, bscscanUrls, polygonscanUrls, coingeckoUrls, binanceUrls, bitgetUrls];
      const failedResponse = responses.find(r => !r.ok);
      if (failedResponse) {
        throw new Error(`HTTP Error: ${failedResponse.status}`);
      }

      // Parse JSON responses
      const [etherscanData, bscscanData, polygonscanData, coingeckoData, binanceData, bitgetData, registrationData] = await Promise.all([
        etherscanUrls.json(),
        bscscanUrls.json(),
        polygonscanUrls.json(),
        coingeckoUrls.json(),
        binanceUrls.json(),
        bitgetUrls.json(),
        registrationUrls.json(),
      ]);

      // Erstelle Provider-Konfiguration aus Backend-Daten
      const config: ProviderConfigs = {
        etherscan: {
          ...FALLBACK_PROVIDERS.etherscan,
          url: `${etherscanData.api || 'https://api.etherscan.io'}/api`,
          registerUrl: registrationData.etherscan || 'https://etherscan.io/apis',
        },
        bscscan: {
          ...FALLBACK_PROVIDERS.bscscan,
          url: `${bscscanData.api || 'https://api.bscscan.com'}/api`,
          registerUrl: registrationData.bscscan || 'https://bscscan.com/apis',
        },
        polygonscan: {
          ...FALLBACK_PROVIDERS.polygonscan,
          url: `${polygonscanData.api || 'https://api.polygonscan.com'}/api`,
          registerUrl: registrationData.polygonscan || 'https://polygonscan.com/apis',
        },
        coingecko: {
          ...FALLBACK_PROVIDERS.coingecko,
          url: coingeckoData.api || (import.meta as any)?.env?.VITE_COINGECKO_API_URL || (import.meta as any)?.env?.VITE_API_FALLBACK_URL || '/api/fallback/coingecko',
        },
        binance: {
          ...FALLBACK_PROVIDERS.binance,
          url: `${binanceData.rest || 'https://api.binance.com'}/api/v3`,
        },
        bitget: {
          ...FALLBACK_PROVIDERS.bitget,
          url: `${bitgetData.rest || 'https://api.bitget.com'}/api/v2`,
        },
      };

      // Cache die Konfiguration
      cachedProviders = config;
      
      console.log('✅ API Providers configuration loaded from backend:', config);
      return config;

    } catch (error) {
      console.warn('⚠️ Failed to load providers config from backend, using fallback:', error);
      
      // Bei Fehlern: Fallback-Konfiguration verwenden
      cachedProviders = FALLBACK_PROVIDERS;
      return FALLBACK_PROVIDERS;
    } finally {
      // Reset promise so future calls can try again
      providersPromise = null;
    }
  })();

  return providersPromise;
}

/**
 * Exportierte Funktion für den Zugriff auf Provider-Konfiguration
 * Usage: const providers = await getProviderConfigs();
 */
export async function getProviderConfigs(): Promise<ProviderConfigs> {
  return loadProviderConfigs();
}

/**
 * Synchrone Funktion für den Zugriff auf gecachte Provider-Konfiguration
 * Gibt Fallback zurück wenn noch nicht geladen
 */
export function getProviderConfigsSync(): ProviderConfigs {
  return cachedProviders || FALLBACK_PROVIDERS;
}

/**
 * Cache leeren - nützlich für Testing oder wenn Konfiguration aktualisiert wurde
 */
export function clearProviderConfigsCache(): void {
  cachedProviders = null;
  providersPromise = null;
  console.log('🔄 API Providers configuration cache cleared');
}

/**
 * Preload der Provider-Konfiguration beim Import
 * Startet das Laden im Hintergrund ohne zu warten
 */
export function preloadProviderConfigs(): void {
  if (!cachedProviders && !providersPromise) {
    loadProviderConfigs().catch(() => {
      // Ignoriere Fehler beim Preload
    });
  }
}

/**
 * Hilfsfunktion: Einzelnen Provider by ID abrufen
 */
export async function getProviderById(id: string): Promise<ProviderConfig | null> {
  const providers = await getProviderConfigs();
  return providers[id as keyof ProviderConfigs] || null;
}

/**
 * Hilfsfunktion: Provider nach Kategorie filtern
 */
export async function getProvidersByCategory(category: string): Promise<ProviderConfig[]> {
  const providers = await getProviderConfigs();
  return Object.values(providers).filter(provider => provider.category === category);
}

// Legacy Export für Rückwärtskompatibilität
// Nutzt Fallback-Konfiguration, sollte durch getProviderConfigs() ersetzt werden
export const API_PROVIDERS: Record<string, Omit<APIProvider, 'status' | 'config'>> = Object.fromEntries(
  Object.entries(FALLBACK_PROVIDERS).map(([key, provider]) => [
    key, 
    {
      id: provider.id,
      name: provider.name,
      category: provider.category,
      description: provider.description,
      url: provider.url,
      registerUrl: provider.registerUrl,
      documentation: provider.documentation,
      icon: provider.icon,
      rateLimit: provider.rateLimit
    }
  ])
);

// Auto-Preload beim Import
preloadProviderConfigs();
