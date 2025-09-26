// Pages mit neuen Feature-Imports
export { default as TradingPage } from './TradingPage';
export { default as QuantumPage } from './QuantumPage';
export { default as SettingsPage } from './SettingsPage';

// Feature-basierte Page-Exports (korrekte relative Pfade)
export { AIPage } from '../features/ai';
export { WhalesPage } from '../features/whales';
export { DatabasePage } from '../features/database';
export { NewsPage } from '../features/news';
export { APIPage } from '../features/api';
export { TradingBotPage } from '../features/trading-bot';

// Legacy-Alias für Kompatibilität
export { AIPage as MLPage } from '../features/ai';
export { TradingBotPage as BotPage } from '../features/trading-bot';
