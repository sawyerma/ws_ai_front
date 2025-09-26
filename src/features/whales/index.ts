// Whales Feature exports
// export * from './hooks';
// export * from './types';

// Whales Components
export { default as WhalesPage } from './components/WhalesPage';

// Whales Hooks re-export für direkten Zugang (korrekte Pfade)
export { 
  useWhaleWebSocket, 
  useWhaleAlerts 
} from '../trading/hooks/useWhaleWebSocket';
