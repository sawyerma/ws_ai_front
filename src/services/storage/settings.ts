import { LocalStorageService } from './localStorage';

export interface AppSettings {
  theme: 'light' | 'dark';
  chartSettings: any; // Placeholder for detailed chart settings
  // Add other settings here
}

export class SettingsService {
  private static readonly STORAGE_KEY = 'app-settings';

  static getSettings(): AppSettings {
    return LocalStorageService.get(this.STORAGE_KEY, {
      theme: 'dark', // Default theme
      chartSettings: {}, // Default empty chart settings
    });
  }

  static setSettings(settings: Partial<AppSettings>): void {
    const currentSettings = SettingsService.getSettings();
    LocalStorageService.set(this.STORAGE_KEY, { ...currentSettings, ...settings });
  }

  static updateChartSettings(chartSettings: any): void {
    const currentSettings = SettingsService.getSettings();
    LocalStorageService.set(this.STORAGE_KEY, { ...currentSettings, chartSettings });
  }
}
