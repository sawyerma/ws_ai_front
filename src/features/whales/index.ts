// Whales Feature exports
export * from './hooks';
export * from './types';

// Whales Components
export { default as WhalesPage } from './components/WhalesPage';

// Whales Hooks re-export für direkten Zugang
export { 
  useWhaleWebSocket, 
  useWhaleAlerts 
} from './hooks';
