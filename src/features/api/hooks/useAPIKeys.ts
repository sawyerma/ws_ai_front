import { useState, useEffect } from 'react';
import { 
  GlobalAPIState, 
  APIProvider, 
  APIConfig, 
  RateLimit
} from '../types/api';
import { API_PROVIDERS } from '../types/providers';
import { buildAPIPayload, buildValidationPayload, calculateResetTime } from '../types/api';

// API Base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';

// Initialize rate limits with proper typing
const initializeRateLimits = () => {
  return {
    binance: API_PROVIDERS.binance?.rateLimit || {
      current: 0,
      limit: 1200,
      windowMs: 60000,
      resetTime: null,
      warningThreshold: 960,
      criticalThreshold: 1140
    },
    bitget: API_PROVIDERS.bitget?.rateLimit || {
      current: 0,
      limit: 600,
      windowMs: 60000,
      resetTime: null,
      warningThreshold: 480,
      criticalThreshold: 570
    },
    etherscan: API_PROVIDERS.etherscan?.rateLimit || {
      current: 0,
      limit: 100000,
      windowMs: 86400000,
      resetTime: null,
      warningThreshold: 80000,
      criticalThreshold: 95000
    },
    bscscan: API_PROVIDERS.bscscan?.rateLimit || {
      current: 0,
      limit: 100000,
      windowMs: 86400000,
      resetTime: null,
      warningThreshold: 80000,
      criticalThreshold: 95000
    },
    polygonscan: API_PROVIDERS.polygonscan?.rateLimit || {
      current: 0,
      limit: 100000,
      windowMs: 86400000,
      resetTime: null,
      warningThreshold: 80000,
      criticalThreshold: 95000
    },
    coingecko: API_PROVIDERS.coingecko?.rateLimit || {
      current: 0,
      limit: 10000,
      windowMs: 2628000000,
      resetTime: null,
      warningThreshold: 8000,
      criticalThreshold: 9500
    }
  };
};

export const useAPIKeys = () => {
  const [state, setState] = useState<GlobalAPIState>({
    providers: {},
    totalRequests: 0,
    successRate: 0,
    globalRateLimit: initializeRateLimits(),
    isLoading: false,
    lastSync: null,
    error: null
  });

  // Initialize providers with default configs
  useEffect(() => {
    const initialProviders: Record<string, APIProvider> = {};
    
    Object.entries(API_PROVIDERS).forEach(([key, provider]) => {
      initialProviders[key] = {
        id: provider.id,
        name: provider.name,
        category: provider.category,
        description: provider.description,
        url: provider.url,
        registerUrl: provider.registerUrl,
        documentation: provider.documentation,
        icon: provider.icon,
        rateLimit: { ...provider.rateLimit },
        status: {
          connected: false,
          lastChecked: null,
          responseTime: null,
          errorMessage: null,
          uptime: 0
        },
        config: {
          apiKey: '',
          secret: '',
          passphrase: '',
          timeout: 10000,
          retryAttempts: 3,
          enableRateLimit: true,
          priority: 'medium'
        }
      };
    });

    setState(prev => ({ ...prev, providers: initialProviders }));
    loadAPIKeys();
  }, []);

  const updateProvidersWithSavedKeys = (data: any) => {
    setState(prev => {
      const updated: Record<string, APIProvider> = {};
      
      Object.keys(prev.providers).forEach(providerId => {
        const provider = prev.providers[providerId];
        if (!provider) return;

        updated[providerId] = { ...provider };
        
        const savedKey = data.keys?.[providerId];
        if (savedKey) {
          if (typeof savedKey === 'object') {
            // Exchange API (Binance/Bitget)
            updated[providerId].config = {
              ...provider.config,
              apiKey: savedKey.key || '',
              secret: savedKey.secret || '',
              passphrase: savedKey.passphrase || ''
            };
          } else {
            // Blockchain API (simple string key)
            updated[providerId].config = {
              ...provider.config,
              apiKey: savedKey || ''
            };
          }
          updated[providerId].status = {
            ...provider.status,
            connected: !!savedKey,
            lastChecked: data.lastChecked?.[providerId] ? new Date(data.lastChecked[providerId]) : null
          };
        }
      });

      return { ...prev, providers: updated };
    });
  };

  const loadAPIKeys = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`${API_BASE}/api/settings/api-keys`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        updateProvidersWithSavedKeys(data);
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveAPIKey = async (providerId: string, config: Partial<APIConfig>): Promise<boolean> => {
    const provider = state.providers[providerId];
    if (!provider) return false;

    const updatedConfig = { ...provider.config, ...config };
    const updatedProvider: APIProvider = {
      ...provider,
      config: updatedConfig,
      status: { ...provider.status, connected: false }
    };
    
    setState(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [providerId]: updatedProvider
      }
    }));

    try {
      const payload = buildAPIPayload(providerId, updatedConfig);
      const response = await fetch(`${API_BASE}/api/settings/api-keys`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ keys: { [providerId]: payload } })
      });

      if (response.ok) {
        // Validate the key after saving
        await validateAPIKey(providerId);
        return true;
      }
      return false;
    } catch (error: any) {
      const currentProvider = state.providers[providerId];
      if (currentProvider) {
        setState(prev => ({
          ...prev,
          providers: {
            ...prev.providers,
            [providerId]: {
              ...currentProvider,
              status: { 
                ...currentProvider.status, 
                errorMessage: error.message 
              }
            }
          }
        }));
      }
      return false;
    }
  };

  const validateAPIKey = async (providerId: string): Promise<boolean> => {
    const provider = state.providers[providerId];
    if (!provider || !provider.config.apiKey) return false;

    const startTime = Date.now();
    
    // Update status to show validation in progress
    setState(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [providerId]: {
          ...provider,
          status: { ...provider.status, errorMessage: null }
        }
      }
    }));

    try {
      const payload = buildValidationPayload(providerId, provider.config);
      const response = await fetch(`${API_BASE}/api/settings/validate-api-key`, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      const currentProvider = state.providers[providerId];
      if (currentProvider) {
        setState(prev => ({
          ...prev,
          providers: {
            ...prev.providers,
            [providerId]: {
              ...currentProvider,
              status: {
                connected: data.valid,
                lastChecked: new Date(),
                responseTime,
                errorMessage: data.valid ? null : data.error || 'Validation failed',
                uptime: data.valid ? currentProvider.status.uptime + 1 : 0
              }
            }
          },
          lastSync: new Date()
        }));
      }

      return data.valid;
    } catch (error: any) {
      const currentProvider = state.providers[providerId];
      if (currentProvider) {
        setState(prev => ({
          ...prev,
          providers: {
            ...prev.providers,
            [providerId]: {
              ...currentProvider,
              status: {
                ...currentProvider.status,
                connected: false,
                errorMessage: error.message,
                lastChecked: new Date()
              }
            }
          }
        }));
      }
      return false;
    }
  };

  const updateRateLimit = (providerId: string, usage: number) => {
    const validProviderIds = ['binance', 'bitget', 'etherscan', 'bscscan', 'polygonscan', 'coingecko'] as const;
    type ValidProviderId = typeof validProviderIds[number];
    
    if (!validProviderIds.includes(providerId as ValidProviderId)) return;
    
    const typedProviderId = providerId as ValidProviderId;
    const currentRateLimit = state.globalRateLimit[typedProviderId];
    
    setState(prev => ({
      ...prev,
      globalRateLimit: {
        ...prev.globalRateLimit,
        [typedProviderId]: {
          ...currentRateLimit,
          current: usage,
          resetTime: calculateResetTime(currentRateLimit.windowMs)
        }
      }
    }));
  };

  const getProvidersByCategory = (category: APIProvider['category']) => {
    return Object.values(state.providers).filter(p => p.category === category);
  };

  const getConnectedProviders = () => {
    return Object.values(state.providers).filter(p => p.status.connected);
  };

  const calculateSuccessRate = () => {
    const providers = Object.values(state.providers);
    const connected = providers.filter(p => p.status.connected).length;
    return providers.length > 0 ? (connected / providers.length) * 100 : 0;
  };

  const refreshAllKeys = () => {
    Object.keys(state.providers).forEach(providerId => {
      const provider = state.providers[providerId];
      if (provider?.config.apiKey) {
        validateAPIKey(providerId);
      }
    });
  };

  return {
    ...state,
    successRate: calculateSuccessRate(),
    loadAPIKeys,
    saveAPIKey,
    validateAPIKey,
    updateRateLimit,
    getProvidersByCategory,
    getConnectedProviders,
    refreshAllKeys
  };
};
