// services/storage/settings.ts - Settings-Management
import { LocalStorageService } from './localStorage';

interface TradingSettings {
  defaultExchange: string;
  defaultMarket: string;
  defaultInterval: string;
  theme: 'light' | 'dark' | 'system';
  autoRefresh: boolean;
  refreshInterval: number;
  showVolume: boolean;
  notifications: boolean;
}

export class SettingsService {
  private static readonly STORAGE_KEY = 'trading-settings';
  
  private static readonly DEFAULT_SETTINGS: TradingSettings = {
    defaultExchange: 'bitget',
    defaultMarket: 'spot',
    defaultInterval: '1m',
    theme: 'system',
    autoRefresh: true,
    refreshInterval: 5000,
    showVolume: true,
    notifications: false,
  };
  
  static getSettings(): TradingSettings {
    return LocalStorageService.get(this.STORAGE_KEY, this.DEFAULT_SETTINGS);
  }
  
  static updateSettings(updates: Partial<TradingSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...updates };
    LocalStorageService.set(this.STORAGE_KEY, updated);
  }
  
  static getSetting<K extends keyof TradingSettings>(key: K): TradingSettings[K] {
    const settings = this.getSettings();
    return settings[key];
  }
  
  static setSetting<K extends keyof TradingSettings>(key: K, value: TradingSettings[K]): void {
    this.updateSettings({ [key]: value } as Partial<TradingSettings>);
  }
  
  static resetSettings(): void {
    LocalStorageService.set(this.STORAGE_KEY, this.DEFAULT_SETTINGS);
  }
}