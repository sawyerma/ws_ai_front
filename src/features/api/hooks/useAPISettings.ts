import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';

// Provider types based on gui_api.md specification
const PROVIDERS = ['binance', 'bitget', 'etherscan', 'bscscan', 'polygonscan', 'coingecko', 'telegram'] as const;
type Provider = typeof PROVIDERS[number];

interface ProviderURLs {
  urls: Record<string, string>;
}

interface ProviderWebSockets {
  websockets: Record<string, string>;
}

interface ProviderRateLimits {
  rateLimits: Record<string, number | string>;
}

interface ProviderUsage {
  usage: Record<string, number | string>;
  limits: Record<string, number | string>;
  percentage: number;
}

interface APISettings {
  urls: Record<Provider, ProviderURLs>;
  websockets: Record<Provider, ProviderWebSockets>;
  rateLimits: Record<Provider, ProviderRateLimits>;
  usage: Record<Provider, ProviderUsage>;
  isLoading: boolean;
  error: string | null;
}

export const useAPISettings = () => {
  const [state, setState] = useState<APISettings>({
    urls: {} as Record<Provider, ProviderURLs>,
    websockets: {} as Record<Provider, ProviderWebSockets>,
    rateLimits: {} as Record<Provider, ProviderRateLimits>,
    usage: {} as Record<Provider, ProviderUsage>,
    isLoading: false,
    error: null
  });

  // Load all settings for all providers
  const loadSettings = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const urls: Record<Provider, ProviderURLs> = {} as Record<Provider, ProviderURLs>;
      const websockets: Record<Provider, ProviderWebSockets> = {} as Record<Provider, ProviderWebSockets>;
      const rateLimits: Record<Provider, ProviderRateLimits> = {} as Record<Provider, ProviderRateLimits>;
      const usage: Record<Provider, ProviderUsage> = {} as Record<Provider, ProviderUsage>;

      // Load data for each provider
      await Promise.all(PROVIDERS.map(async (provider) => {
        try {
          // Load URLs
          const urlsResponse = await fetch(`${API_BASE}/api/settings/urls/${provider}`);
          if (urlsResponse.ok) {
            urls[provider] = await urlsResponse.json();
          }

          // Load WebSockets (only for providers that have them)
          if (provider === 'binance' || provider === 'bitget') {
            const websocketsResponse = await fetch(`${API_BASE}/api/settings/websockets/${provider}`);
            if (websocketsResponse.ok) {
              websockets[provider] = await websocketsResponse.json();
            }
          }

          // Load Rate Limits
          const rateLimitsResponse = await fetch(`${API_BASE}/api/settings/rate-limits/${provider}`);
          if (rateLimitsResponse.ok) {
            rateLimits[provider] = await rateLimitsResponse.json();
          }

          // Load Usage
          const usageResponse = await fetch(`${API_BASE}/api/settings/usage/${provider}`);
          if (usageResponse.ok) {
            usage[provider] = await usageResponse.json();
          }
        } catch (error) {
          console.warn(`Failed to load settings for ${provider}:`, error);
        }
      }));

      setState(prev => ({
        ...prev,
        urls,
        websockets,
        rateLimits,
        usage,
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  };

  // Update URLs for a specific provider
  const updateUrls = async (provider: Provider, urls: Record<string, string>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/settings/urls/${provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      
      if (response.ok) {
        // Update local state
        setState(prev => ({
          ...prev,
          urls: {
            ...prev.urls,
            [provider]: { urls }
          }
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to update URLs for ${provider}:`, error);
      return false;
    }
  };

  // Update WebSockets for a specific provider
  const updateWebSockets = async (provider: Provider, websockets: Record<string, string>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/settings/websockets/${provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websockets })
      });
      
      if (response.ok) {
        // Update local state
        setState(prev => ({
          ...prev,
          websockets: {
            ...prev.websockets,
            [provider]: { websockets }
          }
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to update WebSockets for ${provider}:`, error);
      return false;
    }
  };

  // Update Rate Limits for a specific provider
  const updateRateLimits = async (provider: Provider, rateLimits: Record<string, number | string>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/settings/rate-limits/${provider}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rateLimits })
      });
      
      if (response.ok) {
        // Update local state
        setState(prev => ({
          ...prev,
          rateLimits: {
            ...prev.rateLimits,
            [provider]: { rateLimits }
          }
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to update rate limits for ${provider}:`, error);
      return false;
    }
  };

  // Save a single URL for a provider
  const saveUrl = async (provider: Provider, type: string, url: string): Promise<boolean> => {
    const currentUrls = state.urls[provider]?.urls || {};
    return updateUrls(provider, { ...currentUrls, [type]: url });
  };

  // Save a single WebSocket URL for a provider
  const saveWebSocket = async (provider: Provider, type: string, url: string): Promise<boolean> => {
    const currentWebSockets = state.websockets[provider]?.websockets || {};
    return updateWebSockets(provider, { ...currentWebSockets, [type]: url });
  };

  // Save a single rate limit for a provider
  const saveRateLimit = async (provider: Provider, type: string, value: number | string): Promise<boolean> => {
    const currentRateLimits = state.rateLimits[provider]?.rateLimits || {};
    return updateRateLimits(provider, { ...currentRateLimits, [type]: value });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    ...state,
    providers: PROVIDERS,
    loadSettings,
    updateUrls,
    updateWebSockets,
    updateRateLimits,
    saveUrl,
    saveWebSocket,
    saveRateLimit
  };
};
