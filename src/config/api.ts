// config/api.ts - ALLE API-Konfiguration zentral
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100',
  WS_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8100',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;