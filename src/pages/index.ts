// Pages mit neuen Feature-Imports
export { default as TradingPage } from './TradingPage';
export { default as QuantumPage } from './QuantumPage';
export { default as SettingsPage } from './SettingsPage';

// Feature-basierte Page-Exports
export { AIPage } from '@ai';
export { WhalesPage } from '@whales';
export { DatabasePage } from '@database';
export { NewsPage } from '@news';
export { APIPage } from '@api';
export { TradingBotPage } from '@trading-bot';

// Legacy-Alias für Kompatibilität
export { AIPage as MLPage } from '@ai';
export { TradingBotPage as BotPage } from '@trading-bot';
