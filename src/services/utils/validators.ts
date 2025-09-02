// Input Validators
// Validation functions for user inputs and data

export class Validators {
  static isValidSymbol(symbol: string): boolean {
    if (!symbol || typeof symbol !== 'string') return false;
    
    // Basic symbol validation: letters and numbers only, 3-20 characters
    const symbolRegex = /^[A-Z0-9]{3,20}$/;
    return symbolRegex.test(symbol.toUpperCase());
  }
  
  static isValidPrice(price: string | number): boolean {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return !isNaN(numPrice) && numPrice > 0 && isFinite(numPrice);
  }
  
  static isValidVolume(volume: string | number): boolean {
    const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
    return !isNaN(numVolume) && numVolume >= 0 && isFinite(numVolume);
  }
  
  static isValidTimeframe(timeframe: string): boolean {
    const validTimeframes = [
      '1s', '5s', '15s', '30s',
      '1m', '3m', '5m', '15m', '30m',
      '1h', '2h', '4h', '6h', '8h', '12h',
      '1d', '3d', '1w', '1M'
    ];
    return validTimeframes.includes(timeframe);
  }
  
  static isValidExchange(exchange: string): boolean {
    const validExchanges = ['bitget', 'binance'];
    return validExchanges.includes(exchange.toLowerCase());
  }
  
  static isValidMarketType(marketType: string): boolean {
    const validMarkets = [
      'spot', 'usdt-m', 'coin-m-perp', 'coin-m-delivery', 'usdc-m',
      'Market', 'Spot', 'USDT-M Futures', 'Coin-M Perpetual-Futures', 
      'Coin-M Delivery-Futures', 'USDC-M Futures'
    ];
    return validMarkets.includes(marketType);
  }
  
  static sanitizeSymbol(symbol: string): string {
    if (!symbol || typeof symbol !== 'string') return '';
    
    // Remove special characters and convert to uppercase
    return symbol.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  }
  
  static sanitizePrice(price: string): string {
    if (!price || typeof price !== 'string') return '0';
    
    // Keep only numbers, dots, and minus sign
    const sanitized = price.replace(/[^0-9.-]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return sanitized;
  }
  
  static validateNumber(value: any, min?: number, max?: number): { 
    isValid: boolean; 
    value: number; 
    error?: string 
  } {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num) || !isFinite(num)) {
      return { isValid: false, value: 0, error: 'Invalid number' };
    }
    
    if (min !== undefined && num < min) {
      return { isValid: false, value: num, error: `Value must be >= ${min}` };
    }
    
    if (max !== undefined && num > max) {
      return { isValid: false, value: num, error: `Value must be <= ${max}` };
    }
    
    return { isValid: true, value: num };
  }
  
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  static validateJson(jsonString: string): { isValid: boolean; data?: any; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      return { isValid: true, data };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON' 
      };
    }
  }
}