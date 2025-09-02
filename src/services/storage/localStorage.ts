// services/storage/localStorage.ts - NUR LocalStorage-Wrapper
export class LocalStorageService {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
  
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  }
  
  static remove(key: string): void {
    localStorage.removeItem(key);
  }
  
  static clear(): void {
    localStorage.clear();
  }
  
  static hasKey(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}