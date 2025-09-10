export interface APIProvider {
  id: string;
  name: string;
  category: 'blockchain' | 'exchange' | 'data';
  description: string;
  url: string;
  registerUrl: string;
  documentation: string;
  icon: string;
  status: APIStatus;
  rateLimit: RateLimit;
  config: APIConfig;
}

export interface APIStatus {
  connected: boolean;
  lastChecked: Date | null;
  responseTime: number | null;
  errorMessage: string | null;
  uptime: number;
}

export interface RateLimit {
  current: number;
  limit: number;
  windowMs: number;
  resetTime: Date | null;
  warningThreshold: number;    // 80%
  criticalThreshold: number;   // 95%
}

export interface APIConfig {
  apiKey: string;
  secret?: string;              // For exchanges
  passphrase?: string;          // For Bitget
  timeout: number;              // Request timeout
  retryAttempts: number;        // Retry logic
  enableRateLimit: boolean;     // Rate limiting toggle
  priority: 'high' | 'medium' | 'low';  // Provider priority
}

export interface GlobalAPIState {
  providers: Record<string, APIProvider>;
  totalRequests: number;
  successRate: number;
  globalRateLimit: {
    binance: RateLimit;
    bitget: RateLimit;
    etherscan: RateLimit;
    bscscan: RateLimit;
    polygonscan: RateLimit;
    coingecko: RateLimit;
  };
  isLoading: boolean;
  lastSync: Date | null;
  error: string | null;
}

// Helper function to initialize rate limits
export const initializeRateLimits = (): GlobalAPIState['globalRateLimit'] => {
  const createRateLimit = (limit: number, windowMs: number): RateLimit => ({
    current: 0,
    limit,
    windowMs,
    resetTime: null,
    warningThreshold: Math.floor(limit * 0.8),
    criticalThreshold: Math.floor(limit * 0.95)
  });

  return {
    binance: createRateLimit(1200, 60000), // 1200 requests/minute
    bitget: createRateLimit(600, 60000),   // 600 requests/minute
    etherscan: createRateLimit(100000, 86400000), // 100k requests/day
    bscscan: createRateLimit(100000, 86400000),   // 100k requests/day
    polygonscan: createRateLimit(100000, 86400000), // 100k requests/day
    coingecko: createRateLimit(10000, 2628000000)   // 10k requests/month
  };
};

// Utility functions
export const buildAPIPayload = (providerId: string, config: APIConfig) => {
  switch (providerId) {
    case 'binance':
      return {
        key: config.apiKey,
        secret: config.secret || ''
      };
    case 'bitget':
      return {
        key: config.apiKey,
        secret: config.secret || '',
        passphrase: config.passphrase || ''
      };
    default:
      return config.apiKey;
  }
};

export const buildValidationPayload = (providerId: string, config: APIConfig) => {
  const payload = buildAPIPayload(providerId, config);
  
  if (typeof payload === 'string') {
    return {
      provider: providerId,
      apiKey: payload
    };
  }
  
  return {
    provider: providerId,
    ...payload
  };
};

export const calculateResetTime = (windowMs: number): Date => {
  return new Date(Date.now() + windowMs);
};
