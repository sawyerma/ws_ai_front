// Settings Service
// Manages application settings and preferences

import { LocalStorageService } from './localStorage';
import { Exchange, ViewMode, MarketType } from '../../types';

interface AppSettings {
  selectedExchange: Exchange;
  selectedCoin: string;
  selectedMarket: string;
  selectedInterval: string;
  selectedIndicators: string[];
  tradingMode: string;
  selectedMarketType: MarketType;
  theme: 'dark' | 'light' | 'system';
  chartSettings: {
    barSpacing: number;
    showVolume: boolean;
    showGrid: boolean;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  selectedExchange: 'bitget',
  selectedCoin: 'BTCUSDT',
  selectedMarket: 'spot',
  selectedInterval: '1m',
  selectedIndicators: [],
  tradingMode: 'Market',
  selectedMarketType: 'Market',
  theme: 'system',
  chartSettings: {
    barSpacing: 4,
    showVolume: true,
    showGrid: true,
  },
};

export class SettingsService {
  private static readonly STORAGE_KEY = 'app-settings';
  
  static getSettings(): AppSettings {
    return LocalStorageService.get(this.STORAGE_KEY, DEFAULT_SETTINGS);
  }
  
  static updateSettings(updates: Partial<AppSettings>): void {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    LocalStorageService.set(this.STORAGE_KEY, newSettings);
  }
  
  static getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    const settings = this.getSettings();
    return settings[key];
  }
  
  static setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.updateSettings({ [key]: value } as Partial<AppSettings>);
  }
  
  static resetSettings(): void {
    LocalStorageService.set(this.STORAGE_KEY, DEFAULT_SETTINGS);
  }
  
  static exportSettings(): string {
    return JSON.stringify(this.getSettings(), null, 2);
  }
  
  static importSettings(settingsJson: string): boolean {
    try {
      const settings = JSON.parse(settingsJson);
      // Validate settings structure
      if (typeof settings === 'object' && settings !== null) {
        this.updateSettings(settings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}