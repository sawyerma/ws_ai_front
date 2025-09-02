// services/utils/validators.ts - NUR Validierung
export class TradingValidators {
  static isValidSymbol(symbol: string): boolean {
    // Basic symbol validation (e.g., BTCUSDT)
    return /^[A-Z0-9]{3,20}$/.test(symbol.toUpperCase());
  }
  
  static isValidPrice(price: string | number): boolean {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return !isNaN(numPrice) && numPrice > 0 && isFinite(numPrice);
  }
  
  static isValidAmount(amount: string | number): boolean {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(numAmount) && numAmount > 0 && isFinite(numAmount);
  }
  
  static isValidInterval(interval: string): boolean {
    const validIntervals = ['1s', '5s', '15s', '1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M'];
    return validIntervals.includes(interval);
  }
  
  static isValidExchange(exchange: string): boolean {
    const validExchanges = ['bitget', 'binance'];
    return validExchanges.includes(exchange.toLowerCase());
  }
  
  static isValidMarket(market: string): boolean {
    const validMarkets = ['spot', 'usdt-m', 'coin-m-perp', 'coin-m-delivery', 'usdc-m'];
    return validMarkets.includes(market.toLowerCase());
  }
  
  static sanitizeSymbol(symbol: string): string {
    return symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
  
  static validateApiResponse(response: any): boolean {
    return response && typeof response === 'object' && !Array.isArray(response);
  }
  
  static isValidWebSocketUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
    } catch {
      return false;
    }
  }
  
  static isValidTimestamp(timestamp: string | number): boolean {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    return !isNaN(ts) && ts > 0 && ts <= Date.now() + 86400000; // Not more than 1 day in future
  }
}