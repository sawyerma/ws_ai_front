// AI Feature exports
// export * from './hooks';
// export * from './types';

// AI Components  
export { default as AIPage } from './components/AIPage';

// AI Hooks re-export für direkten Zugang (korrekte Pfade)
export { 
  useAIStrategyRecommendation, 
  useChartAnalysis, 
  useAIPerformance 
} from '../trading/hooks/useAIEngine';
