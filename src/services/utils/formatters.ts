// Formatting Utilities
// Price, time, and data formatting functions

export class PriceFormatter {
  static formatPrice(price: number): string {
    if (price === 0) return '0.00';
    if (price < 0.0001) return price.toFixed(8);
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  }
  
  static formatChange(changeRate: number): { change: string; changePercent: number } {
    const changePercent = changeRate * 100;
    const sign = changePercent >= 0 ? '+' : '';
    return {
      change: `${sign}${changePercent.toFixed(2)}%`,
      changePercent: changePercent,
    };
  }
  
  static formatVolume(volume: number): string {
    if (volume >= 1_000_000_000) {
      return `${(volume / 1_000_000_000).toFixed(2)}B`;
    }
    if (volume >= 1_000_000) {
      return `${(volume / 1_000_000).toFixed(2)}M`;
    }
    if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(2)}K`;
    }
    return volume.toFixed(2);
  }
  
  static formatNumber(num: number, decimals: number = 2): string {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
}

export class TimeFormatter {
  static formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  
  static formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  
  static formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
  
  static getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
      return 'just now';
    }
    if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    if (diff < 86400000) { // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }
}

export class SymbolFormatter {
  static formatSymbol(symbol: string): string {
    if (symbol.includes('_')) return symbol.replace('_', '/').toUpperCase();
    if (symbol.endsWith('USDT')) return `${symbol.slice(0, -4)}/USDT`;
    if (symbol.endsWith('USDC')) return `${symbol.slice(0, -4)}/USDC`;
    if (symbol.endsWith('BTC')) return `${symbol.slice(0, -3)}/BTC`;
    return symbol;
  }
  
  static parseSymbol(symbol: string): { base: string; quote: string } {
    if (symbol.includes('/')) {
      const [base, quote] = symbol.split('/');
      return { base, quote };
    }
    
    // Try common quote assets
    const quoteAssets = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'];
    for (const quote of quoteAssets) {
      if (symbol.endsWith(quote)) {
        return {
          base: symbol.slice(0, -quote.length),
          quote,
        };
      }
    }
    
    return { base: symbol, quote: '' };
  }
}