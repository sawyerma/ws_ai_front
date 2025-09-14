import { LocalStorageService } from './localStorage';

export class FavoritesService {
  private static readonly STORAGE_KEY = 'coin-favorites';
  
  static getFavorites(): string[] {
    return LocalStorageService.get(this.STORAGE_KEY, []);
  }
  
  static addFavorite(symbol: string): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(symbol)) {
      LocalStorageService.set(this.STORAGE_KEY, [...favorites, symbol]);
    }
  }
  
  static removeFavorite(symbol: string): void {
    const favorites = this.getFavorites();
    LocalStorageService.set(this.STORAGE_KEY, favorites.filter(f => f !== symbol));
  }
  
  static isFavorite(symbol: string): boolean {
    return this.getFavorites().includes(symbol);
  }
}
