class UrlManager {
  private static urlCache: Map<string, any> = new Map();
  private static lastFetchTime: number = 0;
  private static readonly CACHE_TTL = 30000; // 30 seconds
  private static readonly MAX_RETRIES = 3;
  
  // Dynamische TTL basierend auf Provider-Typ + Environment Variables (Enterprise Optimierung)
  private static PROVIDER_TTL_CONFIG: Record<string, number> = {
    // Environment-based TTL Defaults mit Fallbacks
    'binance': parseInt((import.meta as any)?.env?.VITE_TTL_BINANCE || '10000'),
    'bitget': parseInt((import.meta as any)?.env?.VITE_TTL_BITGET || '10000'),
    'etherscan': parseInt((import.meta as any)?.env?.VITE_TTL_ETHERSCAN || '60000'),
    'bscscan': parseInt((import.meta as any)?.env?.VITE_TTL_BSCSCAN || '60000'),
    'polygonscan': parseInt((import.meta as any)?.env?.VITE_TTL_POLYGONSCAN || '60000'),
    'coingecko': parseInt((import.meta as any)?.env?.VITE_TTL_COINGECKO || '30000'),
    'telegram': parseInt((import.meta as any)?.env?.VITE_TTL_TELEGRAM || '120000')
  };

  // TTL-Config Cache Management
  private static ttlConfigCache: Record<string, number> | null = null;
  private static ttlConfigLastFetch: number = 0;
  private static readonly TTL_CONFIG_CACHE_TTL = 60000; // 1 min cache für TTL-Config selbst
  
  // Cache-Statistiken für Monitoring
  private static cacheStats = {
    hits: 0,
    misses: 0,
    fallbacks: 0,
    errors: 0,
    totalRequests: 0,
    averageResponseTime: 0
  };

  static async getUrl(provider: string, endpointType: string): Promise<string> {
    const startTime = performance.now();
    const cacheKey = `${provider}-${endpointType}`;
    const currentTime = Date.now();
    
    // Statistiken aktualisieren
    this.cacheStats.totalRequests++;
    
    // Dynamische TTL basierend auf Provider
    const providerTtl = this.PROVIDER_TTL_CONFIG[provider] || this.CACHE_TTL;
    
    // 1. Cache prüfen (mit dynamischem TTL)
    if (this.urlCache.has(cacheKey) && 
        (currentTime - this.lastFetchTime) < providerTtl) {
      this.cacheStats.hits++;
      this.updateResponseTimeStats(performance.now() - startTime);
      return this.urlCache.get(cacheKey);
    }
    
    // Cache MISS
    this.cacheStats.misses++;
    
    // 2. Backend versuchen (mit Retry-Logic)
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`/api/settings/urls/${provider}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(2000) // 2s timeout
        });
        
        if (response.ok) {
          const config = await response.json();
          const url = config[endpointType];
          
          // Cache aktualisieren mit provider-spezifischem Timestamp
          this.urlCache.set(cacheKey, url);
          this.urlCache.set(`${cacheKey}_timestamp`, currentTime);
          this.lastFetchTime = currentTime;
          
          console.log(`✅ URL fetched from backend (attempt ${attempt}, TTL: ${providerTtl}ms): ${url}`);
          this.updateResponseTimeStats(performance.now() - startTime);
          return url;
        }
      } catch (error) {
        console.warn(`⚠️ Backend attempt ${attempt} failed:`, error);
        if (attempt === this.MAX_RETRIES) {
          this.cacheStats.errors++;
          break; // Fallback verwenden
        }
        await this.delay(100 * attempt); // Exponential backoff
      }
    }
    
    // 3. Environment Variables Fallback
    const envKey = `VITE_${provider.toUpperCase()}_${endpointType.toUpperCase()}`;
    const envUrl = (import.meta as any)?.env?.[envKey];
    
    if (envUrl) {
      console.log(`🔄 Using environment variable fallback (TTL: ${providerTtl}ms): ${envUrl}`);
      this.urlCache.set(cacheKey, envUrl);
      this.urlCache.set(`${cacheKey}_timestamp`, currentTime);
      this.cacheStats.fallbacks++;
      this.updateResponseTimeStats(performance.now() - startTime);
      return envUrl;
    }
    
    // 4. Ultimate Hardcoded Fallback
    const fallbackUrl = this.getHardcodedFallback(provider, endpointType);
    console.log(`🆘 Using hardcoded fallback (TTL: ${providerTtl}ms): ${fallbackUrl}`);
    this.urlCache.set(cacheKey, fallbackUrl);
    this.urlCache.set(`${cacheKey}_timestamp`, currentTime);
    this.cacheStats.fallbacks++;
    this.updateResponseTimeStats(performance.now() - startTime);
    return fallbackUrl;
  }
  
  static async getMultipleUrls(requests: Array<{provider: string, endpointType: string}>): Promise<Map<string, string>> {
    const results = new Map();
    const toFetch: Array<{provider: string, endpointType: string}> = [];
    
    // Prüfe was gecacht ist
    for (const {provider, endpointType} of requests) {
      const cacheKey = `${provider}-${endpointType}`;
      if (this.isUrlCached(cacheKey)) {
        results.set(cacheKey, this.urlCache.get(cacheKey));
      } else {
        toFetch.push({provider, endpointType});
      }
    }
    
    // Parallel fetch für nicht gecachte URLs
    if (toFetch.length > 0) {
      const fetchPromises = toFetch.map(({provider, endpointType}) => 
        this.getUrl(provider, endpointType)
      );
      
      const fetchedUrls = await Promise.all(fetchPromises);
      toFetch.forEach(({provider, endpointType}, index) => {
        const cacheKey = `${provider}-${endpointType}`;
        results.set(cacheKey, fetchedUrls[index]);
      });
    }
    
    return results;
  }
  
  // Preloading für kritische URLs beim App-Start
  static async preloadCriticalUrls(): Promise<void> {
    const criticalUrls = [
      {provider: 'binance', endpointType: 'websocket'},
      {provider: 'bitget', endpointType: 'websocket'},
      {provider: 'binance', endpointType: 'rest'},
      {provider: 'bitget', endpointType: 'rest'}
    ];
    
    console.time('preloadCriticalUrls');
    await this.getMultipleUrls(criticalUrls);
    console.timeEnd('preloadCriticalUrls');
  }
  
  // ==================== TTL-CONFIG MANAGEMENT ====================
  
  // Backend TTL-Config Loading (3-stufige Hierarchie)
  static async loadTtlConfig(): Promise<void> {
    const currentTime = Date.now();
    
    // TTL-Config selbst cachen (1 min)
    if (this.ttlConfigCache && 
        (currentTime - this.ttlConfigLastFetch) < this.TTL_CONFIG_CACHE_TTL) {
      // Verwende gecachte TTL-Config
      this.PROVIDER_TTL_CONFIG = { ...this.PROVIDER_TTL_CONFIG, ...this.ttlConfigCache };
      return;
    }
    
    try {
      // 1. Versuch: Backend TTL-Config laden (Admin-Panel Priorität)
      const response = await fetch('/api/settings/ttl-config', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5s timeout für TTL-Config
      });
      
      if (response.ok) {
        const config = await response.json();
        const backendTtlConfig = config.providers || {};
        
        // Backend-Config hat höchste Priorität
        this.PROVIDER_TTL_CONFIG = { ...this.PROVIDER_TTL_CONFIG, ...backendTtlConfig };
        this.ttlConfigCache = backendTtlConfig;
        this.ttlConfigLastFetch = currentTime;
        
        console.log('🔧 TTL Config loaded from backend:', backendTtlConfig);
        return;
      }
    } catch (error) {
      console.warn('⚠️ Backend TTL config loading failed, using environment/defaults:', error);
    }
    
    // 2. Fallback: Environment Variables (bereits geladen in Constructor)
    // 3. Ultimate Fallback: Hardcoded Defaults (bereits als Fallback in Environment Variables)
    console.log('🔄 Using environment/default TTL config:', this.PROVIDER_TTL_CONFIG);
  }
  
  // Dynamic TTL Update (Admin-Panel Support)
  static async updateTtlConfig(newConfig: Record<string, number>): Promise<boolean> {
    try {
      const response = await fetch('/api/settings/ttl-config', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          providers: newConfig,
          admin_user: 'frontend-admin',
          reason: 'Frontend TTL configuration update'
        }),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Lokale TTL-Config sofort aktualisieren
        this.PROVIDER_TTL_CONFIG = { ...this.PROVIDER_TTL_CONFIG, ...newConfig };
        this.ttlConfigCache = { ...this.ttlConfigCache, ...newConfig };
        this.ttlConfigLastFetch = Date.now();
        
        console.log('✅ TTL Config updated successfully:', result);
        return true;
      } else {
        console.error('❌ TTL Config update failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ TTL Config update error:', error);
      return false;
    }
  }
  
  // TTL für spezifischen Provider aktualisieren
  static async updateProviderTtl(provider: string, ttl: number): Promise<boolean> {
    try {
      const response = await fetch(`/api/settings/ttl-config/${provider}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ttl: ttl,
          admin_user: 'frontend-admin',
          reason: `TTL update for ${provider} to ${ttl}ms`
        }),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Lokale TTL-Config sofort aktualisieren
        this.PROVIDER_TTL_CONFIG[provider] = ttl;
        if (this.ttlConfigCache) {
          this.ttlConfigCache[provider] = ttl;
        }
        
        console.log(`✅ TTL for ${provider} updated to ${ttl}ms:`, result);
        return true;
      } else {
        console.error(`❌ TTL update for ${provider} failed:`, response.statusText);
        return false;
      }
    } catch (error) {
      console.error(`❌ TTL update for ${provider} error:`, error);
      return false;
    }
  }
  
  // TTL-Config abrufen (für Admin-Panel)
  static getTtlConfig(): Record<string, number> {
    return { ...this.PROVIDER_TTL_CONFIG };
  }
  
  // TTL-Config aus Backend abrufen (ohne Cache)
  static async fetchTtlConfigFromBackend(): Promise<Record<string, number> | null> {
    try {
      const response = await fetch('/api/settings/ttl-config', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const config = await response.json();
        return config.providers || {};
      }
      return null;
    } catch (error) {
      console.error('Error fetching TTL config from backend:', error);
      return null;
    }
  }

  // Cache-Management
  static invalidateCache(): void {
    this.urlCache.clear();
    this.lastFetchTime = 0;
    // TTL-Config Cache auch invalidieren
    this.ttlConfigCache = null;
    this.ttlConfigLastFetch = 0;
    // Cache-Statistiken zurücksetzen
    this.cacheStats = {
      hits: 0,
      misses: 0,
      fallbacks: 0,
      errors: 0,
      totalRequests: 0,
      averageResponseTime: 0
    };
    console.log('🗑️ Frontend URL cache and TTL config invalidated');
  }
  
  // Cache-Statistiken für Monitoring
  static getCacheStats() {
    const hitRatio = this.cacheStats.totalRequests > 0 
      ? (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(2)
      : '0.00';
    
    return {
      ...this.cacheStats,
      hitRatioPercent: parseFloat(hitRatio),
      status: parseFloat(hitRatio) > 80 ? 'excellent' : parseFloat(hitRatio) > 50 ? 'good' : 'poor'
    };
  }
  
  // Response Time Statistiken aktualisieren
  private static updateResponseTimeStats(responseTime: number): void {
    const currentAvg = this.cacheStats.averageResponseTime;
    const totalRequests = this.cacheStats.totalRequests;
    
    // Rolling average berechnen
    this.cacheStats.averageResponseTime = totalRequests > 1
      ? ((currentAvg * (totalRequests - 1)) + responseTime) / totalRequests
      : responseTime;
  }
  
  // Hilfsfunktionen
  private static isUrlCached(cacheKey: string): boolean {
    return this.urlCache.has(cacheKey) && 
           (Date.now() - this.lastFetchTime) < this.CACHE_TTL;
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private static getHardcodedFallback(provider: string, endpointType: string): string {
    const fallbacks: Record<string, Record<string, string>> = {
      binance: {
        rest: 'https://api.binance.com',
        websocket: 'wss://stream.binance.com:9443/ws'
      },
      bitget: {
        rest: 'https://api.bitget.com',
        websocket: 'wss://ws.bitget.com/spot/v1/stream'
      }
    };
    
    return fallbacks[provider]?.[endpointType] || '';
  }
}

export default UrlManager;
