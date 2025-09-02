// LocalStorage Service
// Safe wrapper for localStorage operations

export class LocalStorageService {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to get localStorage item "${key}":`, error);
      return defaultValue;
    }
  }
  
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set localStorage item "${key}":`, error);
    }
  }
  
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage item "${key}":`, error);
    }
  }
  
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
  
  static exists(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.warn(`Failed to check localStorage key "${key}":`, error);
      return false;
    }
  }
  
  static getKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Failed to get localStorage keys:', error);
      return [];
    }
  }
}