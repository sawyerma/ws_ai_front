import { useState, useCallback, useEffect } from 'react';
import type { UniverseItem, QuantumKPIs, TierAnalysis, QuantumTier } from '../types/quantum';

export const useQuantumData = (currentTier: QuantumTier) => {
  const [universe, setUniverse] = useState<UniverseItem[]>(() => {
    const baseSymbols = [
      'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT','ADAUSDT','AVAXUSDT','DOGEUSDT','TONUSDT','TRXUSDT',
      'DOTUSDT','MATICUSDT','LINKUSDT','LTCUSDT','ATOMUSDT','XLMUSDT','NEARUSDT','APTUSDT','ARBUSDT','OPUSDT',
      'FILUSDT','SUIUSDT','INJUSDT','AAVEUSDT','RUNEUSDT','EGLDUSDT','ALGOUSDT','ICPUSDT','FTMUSDT','IMXUSDT'
    ];
    
    return baseSymbols.map((sym, i) => ({
      symbol: sym,
      score: Math.floor(Math.random() * 43 + 55),
      tier: i < 10 ? 3 : i < 20 ? 2 : 1,
      price: Math.random() * 70000 + 0.01
    })).sort((a, b) => b.score - a.score);
  });

  const [kpis, setKpis] = useState<QuantumKPIs>({
    signals: '—', winRate: '—', avgPnL: '—', latency: '—',
    grid: '—', day: '—', pattern: '—', regime: '—',
    f1: '—', f2: '—', var: '—', sharpe: '—'
  });

  const [tierAnalysis, setTierAnalysis] = useState<TierAnalysis>({
    tier1: { whaleImpact: '—', toxicity: '—', flowDir: '—', volumeRatio: '—' },
    tier2: { patternConf: '—', regime: '—', strategyFit: '—', marketPhase: '—' },
    tier3: { tftConf: '—', nbeatsAcc: '—', riskScore: '—', posSize: '—', var: '—', cvar: '—' }
  });

  const updateKPIs = useCallback(() => {
    const tier = currentTier;
    const rnd = (a: number, b: number) => Math.random() * (b - a) + a;

    setKpis({
      signals: (tier === 1 ? rnd(300, 800) : tier === 2 ? rnd(80, 200) : rnd(10, 40)).toFixed(0),
      winRate: (tier === 1 ? rnd(48, 58) : tier === 2 ? rnd(52, 64) : rnd(55, 68)).toFixed(1) + '%',
      avgPnL: (tier === 1 ? rnd(0.2, 0.9) : tier === 2 ? rnd(0.5, 1.6) : rnd(0.8, 2.2)).toFixed(2) + '%',
      latency: (tier === 1 ? rnd(1, 5) : tier === 2 ? rnd(5, 30) : rnd(30, 120)).toFixed(0) + ' ms',
      grid: Math.floor(rnd(60, 95)).toString(),
      day: Math.floor(rnd(55, 90)).toString(),
      pattern: Math.floor(rnd(65, 88)).toString(),
      regime: ['Choppy', 'Trend', 'Range', 'Breakout'][Math.floor(rnd(0, 4))] as string,
      f1: `${(rnd(-3.5, 3.5) > 0 ? '+' : '')}${rnd(-3.5, 3.5).toFixed(1)}% / ${(rnd(-8, 8) > 0 ? '+' : '')}${rnd(-8, 8).toFixed(1)}%`,
      f2: `${(rnd(-10, 10) > 0 ? '+' : '')}${rnd(-10, 10).toFixed(1)}% / ${(rnd(-25, 25) > 0 ? '+' : '')}${rnd(-25, 25).toFixed(1)}%`,
      var: `${rnd(1.0, 4.0).toFixed(2)}% / ${rnd(1.5, 6.0).toFixed(2)}%`,
      sharpe: rnd(0.4, 2.2).toFixed(2)
    });
  }, [currentTier]);

  const updateTierSpecificData = useCallback(() => {
    const rnd = (a: number, b: number) => Math.random() * (b - a) + a;

    setTierAnalysis({
      tier1: {
        whaleImpact: rnd(65, 95).toFixed(1) + '%',
        toxicity: rnd(5, 35).toFixed(1) + '%',
        flowDir: rnd(0, 100) > 50 ? 'BULLISH' : 'BEARISH',
        volumeRatio: rnd(0.8, 3.2).toFixed(2)
      },
      tier2: {
        patternConf: rnd(75, 95).toFixed(1) + '%',
        regime: ['RANGE', 'TREND', 'BREAKOUT'][Math.floor(rnd(0, 3))] as string,
        strategyFit: rnd(80, 98).toFixed(1) + '%',
        marketPhase: ['ACCUMULATION', 'DISTRIBUTION', 'MARKUP', 'MARKDOWN'][Math.floor(rnd(0, 4))] as string
      },
      tier3: {
        tftConf: rnd(88, 97).toFixed(1) + '%',
        nbeatsAcc: rnd(85, 95).toFixed(1) + '%',
        riskScore: rnd(0.1, 0.4).toFixed(2),
        posSize: rnd(2, 15).toFixed(1) + '%',
        var: rnd(1.0, 4.0).toFixed(2) + '%',
        cvar: rnd(1.5, 6.0).toFixed(2) + '%'
      }
    });
  }, []);

  const updateAllData = useCallback(() => {
    setUniverse(prev => prev.map(coin => ({
      ...coin,
      score: Math.max(55, Math.min(98, coin.score + Math.floor(Math.random() * 7 - 3)))
    })));
    updateKPIs();
    updateTierSpecificData();
  }, [updateKPIs, updateTierSpecificData]);

  useEffect(() => {
    updateTierSpecificData();
    updateKPIs();
  }, [currentTier, updateTierSpecificData, updateKPIs]);

  return {
    universe,
    kpis,
    tierAnalysis,
    updateAllData,
    updateKPIs,
    updateTierSpecificData
  };
};
