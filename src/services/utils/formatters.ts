// services/utils/formatters.ts - NUR Formatierung
export class PriceFormatter {
  static formatPrice(price: number): string {
    if (price === 0) return '0.00';
    if (price < 0.0001) return price.toFixed(8);
    if (price < 1) return price.toFixed(6);
    if (price < 100) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    if (volume >= 1e9) {
      return (volume / 1e9).toFixed(2) + 'B';
    } else if (volume >= 1e6) {
      return (volume / 1e6).toFixed(2) + 'M';
    } else if (volume >= 1e3) {
      return (volume / 1e3).toFixed(2) + 'K';
    }
    return volume.toFixed(2);
  }
  
  static formatMarketCap(marketCap: number): string {
    return this.formatVolume(marketCap);
  }
}

export class DateFormatter {
  static formatTime(timestamp: number | string): string {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }
  
  static formatDate(timestamp: number | string): string {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return date.toLocaleDateString('de-DE');
  }
  
  static formatDateTime(timestamp: number | string): string {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    return date.toLocaleString('de-DE');
  }
  
  static getRelativeTime(timestamp: number | string): string {
    const now = Date.now();
    const time = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const diff = now - time;
    
    if (diff < 60000) return 'gerade eben';
    if (diff < 3600000) return `vor ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `vor ${Math.floor(diff / 3600000)} h`;
    return `vor ${Math.floor(diff / 86400000)} Tagen`;
  }
}