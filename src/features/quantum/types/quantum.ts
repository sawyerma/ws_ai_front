export interface UniverseItem {
  symbol: string;
  score: number;
  tier: number;
  price: number;
}

export interface QuantumKPIs {
  signals: string;
  winRate: string;
  avgPnL: string;
  latency: string;
  grid: string;
  day: string;
  pattern: string;
  regime: string;
  f1: string;
  f2: string;
  var: string;
  sharpe: string;
}

export interface TierAnalysis {
  tier1: {
    whaleImpact: string;
    toxicity: string;
    flowDir: string;
    volumeRatio: string;
  };
  tier2: {
    patternConf: string;
    regime: string;
    strategyFit: string;
    marketPhase: string;
  };
  tier3: {
    tftConf: string;
    nbeatsAcc: string;
    riskScore: string;
    posSize: string;
    var: string;
    cvar: string;
  };
}

export type QuantumTier = 1 | 2 | 3;
export type TimeframeType = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
export type TierFilterType = 'all' | '1' | '2' | '3';
export type NLModelType = 'local' | 'anthropic:claude-sonnet-4-20250514' | 'anthropic:sonnet-4.1-1m' | 'openai:gpt-5-thinking';
