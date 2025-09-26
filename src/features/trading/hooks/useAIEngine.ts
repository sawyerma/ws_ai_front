import { useState, useEffect, useCallback } from 'react';
import { AIEngineAPI } from '../../../services/api/ai';

// 🤖 AI STRATEGY RECOMMENDATION HOOK
export const useAIStrategyRecommendation = (symbol: string, exchange = 'binance') => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendation = useCallback(async () => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await AIEngineAPI.getRecommendedStrategy(symbol, exchange);
      setRecommendation(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to get AI recommendation');
    } finally {
      setLoading(false);
    }
  }, [symbol, exchange]);

  useEffect(() => {
    getRecommendation();
  }, [getRecommendation]);

  return {
    recommendation,
    loading,
    error,
    refresh: getRecommendation
  };
};

// 📊 CHART ANALYSIS HOOK
export const useChartAnalysis = (symbol: string, exchange = 'binance', interval = '1h') => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    if (!symbol) return;

    try {
      setLoading(true);
      const [analysisRes, patternsRes, indicatorsRes] = await Promise.all([
        AIEngineAPI.analyzeChart(symbol, exchange, interval),
        AIEngineAPI.getPatternRecognition(symbol, exchange),
        AIEngineAPI.getTechnicalIndicators(symbol, exchange)
      ]);

      setAnalysis(analysisRes);
      setPatterns((patternsRes as any)?.patterns || []);
      setIndicators((indicatorsRes as any)?.indicators || {});
    } catch (err) {
      console.error('Chart analysis failed:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, exchange, interval]);

  useEffect(() => {
    fetchAnalysis();
    const interval_id = setInterval(fetchAnalysis, 60000); // 1 minute
    return () => clearInterval(interval_id);
  }, [fetchAnalysis]);

  return {
    analysis,
    patterns,
    indicators,
    loading,
    refresh: fetchAnalysis
  };
};

// 📈 AI PERFORMANCE TRACKING HOOK
export const useAIPerformance = (timeframe = '7d') => {
  const [performance, setPerformance] = useState<any>(null);
  const [accuracy, setAccuracy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const [perfRes, accRes] = await Promise.all([
          AIEngineAPI.getAIPerformance(timeframe),
          AIEngineAPI.getModelAccuracy()
        ]);
        
        setPerformance(perfRes);
        setAccuracy(accRes);
      } catch (err) {
        console.error('AI performance fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
    const interval = setInterval(fetchPerformance, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [timeframe]);

  return {
    performance,
    accuracy,
    loading
  };
};
