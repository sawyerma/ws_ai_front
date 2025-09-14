import { APIProvider } from './api';

export const API_PROVIDERS: Record<string, Omit<APIProvider, 'status' | 'config'>> = {
  // Blockchain APIs
  etherscan: {
    id: 'etherscan',
    name: 'Etherscan',
    category: 'blockchain',
    description: 'Ethereum blockchain explorer and analytics platform',
    url: 'https://api.etherscan.io/api',
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
    url: 'https://api.bscscan.com/api',
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
    url: 'https://api.polygonscan.com/api',
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
    url: 'https://api.coingecko.com/api/v3',
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
    url: 'https://api.binance.com/api/v3',
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
    url: 'https://api.bitget.com/api/v2',
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
};
