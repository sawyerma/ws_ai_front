import { useState, useCallback, useEffect } from 'react';
import type { NLModelType, UniverseItem, QuantumTier, TierAnalysis, QuantumKPIs } from '../types/quantum';

export const useQuantumNL = (
  selectedSymbol: string,
  currentTier: QuantumTier,
  universe: UniverseItem[],
  tierAnalysis: TierAnalysis,
  kpis: QuantumKPIs
) => {
  const [nlText, setNlText] = useState('—');
  const [nlPrompt, setNlPrompt] = useState('');
  const [nlModel, setNlModel] = useState<NLModelType>('local');

  const updateNLText = useCallback(() => {
    const coin = universe.find(u => u.symbol === selectedSymbol) || { score: 0 };
    
    if (currentTier === 1) {
      setNlText(`🚀 TIER 1 QUANTUM SCREENER - ${selectedSymbol}
Score: ${coin.score}/100 | Confidence: ${Math.min(coin.score + Math.random() * 10 - 5, 100).toFixed(1)}%
Whale Impact: ${tierAnalysis.tier1.whaleImpact} | Toxicity: ${tierAnalysis.tier1.toxicity}
Flow Direction: ${tierAnalysis.tier1.flowDir} | Volume Ratio: ${tierAnalysis.tier1.volumeRatio}
Recommendation: ${coin.score >= 70 ? 'Promote to Tier 2' : 'Continue monitoring'}`);
    } else if (currentTier === 2) {
      setNlText(`🎯 TIER 2 STRATEGY ENGINE - ${selectedSymbol}
Pattern Confidence: ${tierAnalysis.tier2.patternConf} | Regime: ${tierAnalysis.tier2.regime as string}
Strategy Fit: ${tierAnalysis.tier2.strategyFit} | Market Phase: ${tierAnalysis.tier2.marketPhase as string}
Grid: ${kpis.grid}/100 | Day Trading: ${kpis.day}/100 | Pattern: ${kpis.pattern}/100
Recommendation: ${coin.score >= 85 ? 'Promote to Tier 3' : 'Continue in Tier 2'}`);
    } else {
      setNlText(`🔮 TIER 3 DEEP FORECAST - ${selectedSymbol}
TFT Confidence: ${tierAnalysis.tier3.tftConf} | N-BEATS Accuracy: ${tierAnalysis.tier3.nbeatsAcc}
Risk Score: ${tierAnalysis.tier3.riskScore} | Position Size: ${tierAnalysis.tier3.posSize}
VaR: ${tierAnalysis.tier3.var} | CVaR: ${tierAnalysis.tier3.cvar}
Recommendation: ${Math.random() > 0.3 ? 'EXECUTE TRADE' : 'HOLD'}`);
    }
  }, [universe, selectedSymbol, currentTier, tierAnalysis, kpis]);

  const handleNLSend = useCallback(() => {
    if (!nlPrompt.trim()) return;
    
    const timestamp = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const prev = nlText === '—' ? '' : nlText + '\n';
    setNlText(prev + `> ${timestamp} · User: ${nlPrompt}\n< ${nlModel}: Antwort erzeugt (Demo).`);
    setNlPrompt('');
  }, [nlPrompt, nlText, nlModel]);

  useEffect(() => {
    updateNLText();
  }, [updateNLText]);

  return {
    nlText,
    nlPrompt,
    nlModel,
    setNlPrompt,
    setNlModel,
    handleNLSend,
    updateNLText
  };
};
