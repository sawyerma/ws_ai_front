import React, { useState, useEffect, useRef } from "react";
import ThemeProvider from "../components/ui/theme-provider";

interface AIProps {
  onBackToTrading?: () => void;
}

interface CoinData {
  symbol: string;
  score: number;
  tier: number;
  price: number;
}

interface StateData {
  tier: number;
  symbol: string;
  tf: string;
  smaOn: boolean;
  smaLen: number;
  maOn: boolean;
  maLen: number;
}

const AI = ({ onBackToTrading }: AIProps = {}) => {
  // State Management
  const [state, setState] = useState<StateData>({
    tier: 1,
    symbol: 'BTCUSDT',
    tf: '1m',
    smaOn: true,
    smaLen: 20,
    maOn: false,
    maLen: 50
  });

  const [universe, setUniverse] = useState<CoinData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nlPrompt, setNlPrompt] = useState('');
  const [nlModel, setNlModel] = useState('local');
  const [nlOutput, setNlOutput] = useState('—');
  
  // KPI States
  const [kpis, setKpis] = useState({
    signals: '—',
    winRate: '—',
    pnl: '—',
    latency: '—',
    grid: '—',
    day: '—',
    pattern: '—',
    regime: '—',
    f1: '—',
    f2: '—',
    var: '—',
    sharpe: '—'
  });

  // Tier-specific data
  const [tierData, setTierData] = useState({
    t1WhaleImpact: '—',
    t1Toxicity: '—',
    t1FlowDir: '—',
    t1VolumeRatio: '—',
    t2PatternConf: '—',
    t2Regime: '—',
    t2StrategyFit: '—',
    t2MarketPhase: '—',
    t3TFTConf: '—',
    t3NBEATSAcc: '—',
    t3RiskScore: '—',
    t3PosSize: '—',
    t3VaR: '—',
    t3CVaR: '—'
  });

  const [featureImportance, setFeatureImportance] = useState<Array<{name: string, value: number}>>([]);
  const [strategyOverview, setStrategyOverview] = useState<Array<{name: string, score: number}>>([]);
  const [forecastViz, setForecastViz] = useState<Array<{label: string, value: string}>>([]);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const candleSeries = useRef<any>(null);
  const smaSeries = useRef<any>(null);
  const maSeries = useRef<any>(null);
  const seriesData = useRef<any[]>([]);

  // Utility functions
  const rnd = (a: number, b: number) => Math.random() * (b - a) + a;
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const fmtPct = (v: number) => (v > 0 ? '+' : '') + v.toFixed(1) + '%';
  const fmtUSD = (v: number) => '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });

  // Initialize universe
  useEffect(() => {
    const baseSymbols = [
      'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT','ADAUSDT','AVAXUSDT','DOGEUSDT','TONUSDT','TRXUSDT',
      'DOTUSDT','MATICUSDT','LINKUSDT','LTCUSDT','ATOMUSDT','XLMUSDT','NEARUSDT','APTUSDT','ARBUSDT','OPUSDT',
      'FILUSDT','SUIUSDT','INJUSDT','AAVEUSDT','RUNEUSDT','EGLDUSDT','ALGOUSDT','ICPUSDT','FTMUSDT','IMXUSDT',
      'HBARUSDT','TIAUSDT','SEIUSDT','OMNIUSDT','JUPUSDT','WIFUSDT','PEPEUSDT','PYTHUSDT','ORDIUSDT','ENAUSDT',
      'STRKUSDT','SAGAUSDT','BGBUSDT','TIAUSDC','SEIUSDC','RNDRUSDT','TAOUSDT','POLUSDT','WUSDT','MKRUSDT'
    ];

    const coins = baseSymbols.map(sym => ({
      symbol: sym,
      score: Math.floor(rnd(55, 98)),
      tier: 1,
      price: rnd(0.01, 70000)
    }))
    .sort((a, b) => b.score - a.score)
    .map((coin, i) => {
      if (i < 30) coin.tier = 2;
      if (i < 10) coin.tier = 3;
      return coin;
    });

    setUniverse(coins);
  }, []);

  // Initialize chart
  useEffect(() => {
    if (chartRef.current && window.LightweightCharts && !chartInstance.current) {
      const chart = window.LightweightCharts.createChart(chartRef.current, {
        layout: { background: { type: 'solid', color: '#161b22' }, textColor: '#e6edf3' },
        grid: { vertLines: { color: '#2b3138' }, horzLines: { color: '#2b3138' } },
        rightPriceScale: { borderColor: '#2b3138' },
        timeScale: { borderColor: '#2b3138', rightOffset: 6, barSpacing: 6 },
        crosshair: { mode: 0 },
        width: chartRef.current.clientWidth,
        height: 320
      });

      chartInstance.current = chart;
      candleSeries.current = chart.addCandlestickSeries();
      smaSeries.current = chart.addLineSeries({ color: '#3fb950', lineWidth: 2, visible: false });
      maSeries.current = chart.addLineSeries({ color: '#a371f7', lineWidth: 2, visible: false });

      // Generate initial data
      const data = genOHLC(42000, 300);
      seriesData.current = data;
      candleSeries.current.setData(data);
      applyIndicators();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.remove();
        chartInstance.current = null;
      }
    };
  }, []);

  // Clock and refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          // Refresh data
          updateUniverseScores();
          updateAllData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update data when tier or symbol changes
  useEffect(() => {
    updateAllData();
  }, [state.tier, state.symbol]);

  const genOHLC = (seed: number = 42000, n: number = 200) => {
    let t = Math.floor(Date.now() / 1000) - n * 60;
    let p = seed;
    const arr = [];
    for (let i = 0; i < n; i++) {
      const o = p;
      const v = (Math.random() - 0.5) * 0.024;
      p = o * (1 + v);
      const h = Math.max(o, p) * (1 + Math.random() * 0.004);
      const l = Math.min(o, p) * (1 - Math.random() * 0.004);
      arr.push({ time: t, open: o, high: h, low: l, close: p });
      t += 60;
    }
    return arr;
  };

  const SMA = (values: any[], period: number = 20) => {
    const out = [];
    let sum = 0;
    const q: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const c = values[i].close;
      q.push(c);
      sum += c;
      if (q.length > period) sum -= q.shift()!;
      if (q.length === period) out.push({ time: values[i].time, value: sum / period });
    }
    return out;
  };

  const applyIndicators = () => {
    if (smaSeries.current && maSeries.current && seriesData.current) {
      smaSeries.current.setData(SMA(seriesData.current, state.smaLen));
      smaSeries.current.applyOptions({ visible: state.smaOn });
      maSeries.current.setData(SMA(seriesData.current, state.maLen));
      maSeries.current.applyOptions({ visible: state.maOn });
    }
  };

  const updateUniverseScores = () => {
    setUniverse(prev => prev.map(coin => ({
      ...coin,
      score: clamp(Math.round(coin.score + rnd(-3, 3)), 55, 98)
    })));
  };

  const updateAllData = () => {
    updateKPIs();
    updateTierSpecificData();
    updateFeatureImportance();
    updateStrategyOverview();
    updateForecastViz();
    updateNL();
    updateLegend();
  };

  const updateKPIs = () => {
    const tier = state.tier;
    setKpis({
      signals: (tier === 1 ? rnd(300, 800) : tier === 2 ? rnd(80, 200) : rnd(10, 40)).toFixed(0),
      winRate: (tier === 1 ? rnd(48, 58) : tier === 2 ? rnd(52, 64) : rnd(55, 68)).toFixed(1) + '%',
      pnl: (tier === 1 ? rnd(0.2, 0.9) : tier === 2 ? rnd(0.5, 1.6) : rnd(0.8, 2.2)).toFixed(2) + '%',
      latency: (tier === 1 ? rnd(1, 5) : tier === 2 ? rnd(5, 30) : rnd(30, 120)).toFixed(0) + ' ms',
      grid: Math.round(rnd(70, 95)).toString(),
      day: Math.round(rnd(65, 90)).toString(),
      pattern: Math.round(rnd(75, 95)).toString(),
      regime: ['Trend', 'Range', 'Breakout'][Math.floor(rnd(0, 3))],
      f1: fmtPct(rnd(-3.5, 3.5)) + ' / ' + fmtPct(rnd(-8, 8)),
      f2: fmtPct(rnd(-10, 10)) + ' / ' + fmtPct(rnd(-25, 25)),
      var: (rnd(1.0, 4.0)).toFixed(2) + '% / ' + (rnd(1.5, 6.0)).toFixed(2) + '%',
      sharpe: (rnd(0.4, 2.2)).toFixed(2)
    });
  };

  const updateTierSpecificData = () => {
    setTierData({
      t1WhaleImpact: (rnd(65, 95)).toFixed(1) + '%',
      t1Toxicity: (rnd(5, 35)).toFixed(1) + '%',
      t1FlowDir: rnd(0, 100) > 50 ? 'BULLISH' : 'BEARISH',
      t1VolumeRatio: (rnd(0.8, 3.2)).toFixed(2),
      t2PatternConf: (rnd(75, 95)).toFixed(1) + '%',
      t2Regime: ['RANGE', 'TREND', 'BREAKOUT'][Math.floor(rnd(0, 3))],
      t2StrategyFit: (rnd(80, 98)).toFixed(1) + '%',
      t2MarketPhase: ['ACCUMULATION', 'DISTRIBUTION', 'MARKUP', 'MARKDOWN'][Math.floor(rnd(0, 4))],
      t3TFTConf: (rnd(88, 97)).toFixed(1) + '%',
      t3NBEATSAcc: (rnd(85, 95)).toFixed(1) + '%',
      t3RiskScore: (rnd(0.1, 0.4)).toFixed(2),
      t3PosSize: (rnd(2, 15)).toFixed(1) + '%',
      t3VaR: (rnd(1.0, 4.0)).toFixed(2) + '%',
      t3CVaR: (rnd(1.5, 6.0)).toFixed(2) + '%'
    });
  };

  const updateFeatureImportance = () => {
    const features = [
      { name: 'Whale Impact', value: rnd(70, 95) },
      { name: 'Liquidity', value: rnd(65, 90) },
      { name: 'Volatility', value: rnd(40, 75) },
      { name: 'Microstructure', value: rnd(60, 85) },
      { name: 'ALMA Slope', value: rnd(50, 80) },
      { name: 'Regime', value: rnd(45, 75) }
    ];
    setFeatureImportance(features);
  };

  const updateStrategyOverview = () => {
    const strategies = [
      { name: 'Grid Trading', score: rnd(75, 95) },
      { name: 'Momentum', score: rnd(65, 90) },
      { name: 'Mean Reversion', score: rnd(60, 85) },
      { name: 'Breakout', score: rnd(70, 92) }
    ];
    setStrategyOverview(strategies);
  };

  const updateForecastViz = () => {
    const forecasts = [
      { label: '1h', value: fmtPct(rnd(-3.5, 3.5)) },
      { label: '4h', value: fmtPct(rnd(-6, 6)) },
      { label: '1d', value: fmtPct(rnd(-10, 10)) },
      { label: '7d', value: fmtPct(rnd(-25, 25)) }
    ];
    setForecastViz(forecasts);
  };

  const updateNL = () => {
    const u = universe.find(x => x.symbol === state.symbol) || { score: 0 };
    let text = '';
    
    if (state.tier === 1) {
      text = [
        `🚀 TIER 1 QUANTUM SCREENER - ${state.symbol}`,
        `Score: ${u.score}/100 | Confidence: ${Math.min(u.score + rnd(-5, 5), 100).toFixed(1)}%`,
        `Whale Impact: ${tierData.t1WhaleImpact} | Toxicity: ${tierData.t1Toxicity}`,
        `Flow Direction: ${tierData.t1FlowDir} | Volume Ratio: ${tierData.t1VolumeRatio}`,
        `Recommendation: ${u.score >= 70 ? 'Promote to Tier 2' : 'Continue monitoring'}`
      ].join('\n');
    } else if (state.tier === 2) {
      text = [
        `🎯 TIER 2 STRATEGY ENGINE - ${state.symbol}`,
        `Pattern Confidence: ${tierData.t2PatternConf} | Regime: ${tierData.t2Regime}`,
        `Strategy Fit: ${tierData.t2StrategyFit} | Market Phase: ${tierData.t2MarketPhase}`,
        `Grid: ${kpis.grid}/100 | Day Trading: ${kpis.day}/100 | Pattern: ${kpis.pattern}/100`,
        `Recommendation: ${u.score >= 85 ? 'Promote to Tier 3' : 'Continue in Tier 2'}`
      ].join('\n');
    } else {
      text = [
        `🔮 TIER 3 DEEP FORECAST - ${state.symbol}`,
        `TFT Confidence: ${tierData.t3TFTConf} | N-BEATS Accuracy: ${tierData.t3NBEATSAcc}`,
        `Risk Score: ${tierData.t3RiskScore} | Position Size: ${tierData.t3PosSize}`,
        `VaR: ${tierData.t3VaR} | CVaR: ${tierData.t3CVaR}`,
        `Recommendation: ${rnd(0, 100) > 30 ? 'EXECUTE TRADE' : 'HOLD'}`
      ].join('\n');
    }
    
    setNlOutput(text);
  };

  const updateLegend = () => {
    if (seriesData.current.length > 0) {
      const last = seriesData.current[seriesData.current.length - 1];
      const prev = seriesData.current[seriesData.current.length - 2] || last;
      const ch = ((last.close - prev.close) / prev.close) * 100;
      return `${state.symbol}  ${fmtUSD(last.close)}  ${fmtPct(ch)}`;
    }
    return `${state.symbol}  —  —`;
  };

  const handleTierChange = (tier: number) => {
    setState(prev => ({ ...prev, tier }));
  };

  const handleSymbolSelect = (symbol: string) => {
    setState(prev => ({ ...prev, symbol }));
    
    // Generate new chart data
    const seed = 100 + Math.random() * 60000;
    const data = genOHLC(seed, 260);
    seriesData.current = data;
    
    if (candleSeries.current) {
      candleSeries.current.setData(data);
      applyIndicators();
    }
  };

  const handleTimeframeChange = (tf: string) => {
    setState(prev => ({ ...prev, tf }));
    
    const seed = 20000 + Math.random() * 40000;
    const N = tf === '1m' ? 300 : tf === '5m' ? 240 : tf === '15m' ? 220 : tf === '1h' ? 200 : tf === '4h' ? 180 : 160;
    const data = genOHLC(seed, N);
    seriesData.current = data;
    
    if (candleSeries.current) {
      candleSeries.current.setData(data);
      applyIndicators();
    }
  };

  const handleNLSend = () => {
    if (!nlPrompt.trim()) return;
    
    const stamp = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const prev = nlOutput === '—' ? '' : (nlOutput + '\n');
    setNlOutput(prev + `> ${stamp} · User: ${nlPrompt}\n< ${nlModel}: Antwort erzeugt (Demo).`);
    setNlPrompt('');
  };

  const handleCopyNL = () => {
    navigator.clipboard.writeText(nlOutput);
  };

  const handlePromote = () => {
    if (state.tier < 3) {
      handleTierChange(state.tier + 1);
    }
  };

  const filteredUniverse = universe.filter(coin => {
    const matchesSearch = !searchTerm || coin.symbol.toUpperCase().includes(searchTerm.toUpperCase());
    const matchesTier = tierFilter === 'all' || String(coin.tier) === tierFilter;
    return matchesSearch && matchesTier;
  });

  const currentCoin = universe.find(coin => coin.symbol === state.symbol) || { score: 0, price: 0 };

  // Generate ticker data
  const generateTickerData = () => {
    const items = [];
    for (let i = 0; i < 20; i++) {
      const u = universe[Math.floor(rnd(0, universe.length))];
      if (u) {
        const sign = Math.random() > 0.5 ? '+' : '-';
        const pct = rnd(0.1, 3.5).toFixed(1);
        items.push(`${u.symbol} · ${u.score} · ${sign}${pct}% · T${u.tier}`);
      }
    }
    return items;
  };

  return (
    <ThemeProvider>
      <div style={{
        background: '#0d1117',
        color: '#e6edf3',
        font: '14px/1.45 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto',
        display: 'grid',
        gridTemplateRows: '56px 1fr 52px',
        minHeight: '100vh',
        margin: 0,
        boxSizing: 'border-box'
      }}>
        {/* Topbar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: '#161b22',
          borderBottom: '1px solid #2b3138'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 600 }}>
            {onBackToTrading && (
              <button
                onClick={onBackToTrading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8b949e',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                ← Back
              </button>
            )}
            <span style={{ fontSize: '18px' }}>⚡</span>
            <span>Quantum Screener</span>
            <span style={{ fontSize: '12px', color: '#8b949e' }}>Tier 1/2/3 Architecture</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', color: '#8b949e', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3fb950' }}></div>
              Tier 1 aktiv
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d29922' }}></div>
              Coins: <b>{universe.length}</b>
            </span>
            <span>{currentTime.toLocaleTimeString('de-DE')}</span>
            <span>Auto-Refresh: <b>{refreshCountdown}</b>s</span>
          </div>
        </header>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr 360px',
          gap: '1px',
          background: '#2b3138',
          minHeight: 0
        }}>
          {/* Left Panel: Coins */}
          <aside style={{
            background: '#161b22',
            padding: '12px',
            overflow: 'auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ fontWeight: 600, margin: '8px 0 10px', fontSize: '14px' }}>Coins</div>
            
            {/* Search */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Symbol suchen… (z. B. BTCUSDT)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  color: '#e6edf3',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTierFilter('all');
                }}
                style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  color: '#e6edf3',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Reset
              </button>
            </div>

            {/* Tier Badges */}
            <div style={{ display: 'flex', gap: '6px', margin: '6px 0 10px' }}>
              {['all', '1', '2', '3'].map(tier => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  style={{
                    fontSize: '11px',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    background: tierFilter === tier ? '#2f81f7' : '#1f242d',
                    border: `1px solid ${tierFilter === tier ? '#2f81f7' : '#2b3138'}`,
                    color: tierFilter === tier ? '#e6edf3' : '#8b949e',
                    cursor: 'pointer'
                  }}
                >
                  {tier === 'all' ? 'Alle' : `Tier ${tier}`}
                </button>
              ))}
            </div>

            {/* Coin List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflow: 'auto' }}>
              {filteredUniverse.map((coin, index) => (
                <div
                  key={coin.symbol}
                  onClick={() => handleSymbolSelect(coin.symbol)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: coin.symbol === state.symbol ? '#1f242d' : 'transparent',
                    outline: coin.symbol === state.symbol ? '1px solid #2f81f7' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (coin.symbol !== state.symbol) {
                      e.currentTarget.style.background = '#1f242d';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (coin.symbol !== state.symbol) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontFamily: 'ui-monospace, SFMono', fontSize: '13px' }}>
                    {coin.symbol}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: coin.score >= 85 ? 'rgba(63,185,80,.18)' : coin.score >= 70 ? 'rgba(210,153,34,.18)' : 'rgba(139,148,158,.18)',
                    color: coin.score >= 85 ? '#3fb950' : coin.score >= 70 ? '#d29922' : '#8b949e'
                  }}>
                    {coin.score}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* Center Panel: Tabs + Chart + NL */}
          <section style={{
            background: '#161b22',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #2b3138' }}>
              {[1, 2, 3].map(tier => (
                <button
                  key={tier}
                  onClick={() => handleTierChange(tier)}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: state.tier === tier ? '#e6edf3' : '#8b949e',
                    borderBottom: state.tier === tier ? '2px solid #2f81f7' : 'none',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '14px'
                  }}
                >
                  TIER {tier} · {tier === 1 ? 'Quantum Screener' : tier === 2 ? 'Strategy Engine' : 'Deep Forecast'}
                </button>
              ))}
              <div style={{ flex: 1 }}></div>
              <button
                onClick={handlePromote}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#8b949e',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '14px'
                }}
              >
                Promote →
              </button>
            </div>

            {/* Controls */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              padding: '10px 12px',
              borderBottom: '1px solid #2b3138'
            }}>
              <div style={{
                border: state.symbol ? '1px solid #2f81f7' : '1px solid #2b3138',
                background: '#1f242d',
                color: '#e6edf3',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                {state.symbol}
              </div>
              <div style={{
                border: '1px solid #2b3138',
                background: '#1f242d',
                color: '#e6edf3',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                {fmtUSD(currentCoin.price)}
              </div>
              <div style={{
                border: '1px solid #2b3138',
                background: '#1f242d',
                color: '#e6edf3',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                Score: {currentCoin.score}
              </div>
              <div style={{ flex: 1 }}></div>
              
              {/* Timeframe buttons */}
              {["1m", "5m", "15m", "1h", "4h", "1d"].map(tf => (
                <button
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  style={{
                    padding: '6px 8px',
                    fontSize: '12px',
                    borderRadius: '4px',
                    background: state.tf === tf ? '#1a48d8' : '#1f242d',
                    color: state.tf === tf ? 'white' : '#e6edf3',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {tf}
                </button>
              ))}
              
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  border: '1px solid #2b3138',
                  background: '#1f242d',
                  color: '#e6edf3',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Indikatoren
              </button>
              <button
                style={{
                  border: '1px solid #2b3138',
                  background: '#1f242d',
                  color: '#e6edf3',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Chart-Screenshot
              </button>
            </div>

            {/* Chart Area */}
            <div style={{
              position: 'relative',
              flex: 1,
              minHeight: '320px',
              background: '#161b22'
            }}>
              <div
                ref={chartRef}
                style={{ position: 'absolute', inset: 0 }}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                background: 'rgba(13,17,23,.8)',
                border: '1px solid #2b3138',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                {updateLegend()}
              </div>
            </div>

            {/* Natural Language Engine */}
            <div style={{ borderTop: '1px solid #2b3138', padding: '12px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Natural Language Engine</div>
              <div style={{
                whiteSpace: 'pre-wrap',
                background: '#1f242d',
                border: '1px solid #2b3138',
                borderRadius: '8px',
                padding: '10px',
                minHeight: '88px',
                fontSize: '14px',
                marginBottom: '8px'
              }}>
                {nlOutput}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <textarea
                  placeholder="Nachricht oder Analyse schreiben…"
                  value={nlPrompt}
                  onChange={(e) => setNlPrompt(e.target.value)}
                  style={{
                    flex: 1,
                    minHeight: '70px',
                    resize: 'vertical',
                    background: '#1f242d',
                    border: '1px solid #2b3138',
                    color: '#e6edf3',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '14px'
                  }}
                />
                <select
                  value={nlModel}
                  onChange={(e) => setNlModel(e.target.value)}
                  style={{
                    background: '#1f242d',
                    border: '1px solid #2b3138',
                    color: '#e6edf3',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="local">local:default</option>
                  <option value="anthropic:claude-sonnet-4">anthropic:claude-sonnet-4</option>
                  <option value="openai:gpt-5-thinking">openai:gpt-5-thinking</option>
                </select>
                <button
                  onClick={handleNLSend}
                  style={{
                    border: '1px solid #2f81f7',
                    background: '#1f242d',
                    color: '#e6edf3',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Senden
                </button>
                <button
                  onClick={handleCopyNL}
                  style={{
                    border: '1px solid #2b3138',
                    background: '#1f242d',
                    color: '#e6edf3',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Text kopieren
                </button>
                <button
                  style={{
                    border: '1px solid #2b3138',
                    background: '#1f242d',
                    color: '#e6edf3',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  An Telegram senden
                </button>
              </div>
            </div>
          </section>

          {/* Right Panel: KPIs + Analysis */}
          <aside style={{
            background: '#161b22',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            minHeight: 0
          }}>
            {/* Tier KPIs */}
            <div style={{ borderBottom: '1px solid #2b3138', padding: '12px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Tier-KPIs</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px'
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Signals (24h)</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.signals}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px'
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Win-Rate</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.winRate}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px'
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Avg PnL</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.pnl}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px'
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Latency</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.latency}</div>
                </div>
              </div>
            </div>

            {/* Strategy Scores */}
            <div style={{ borderBottom: '1px solid #2b3138', padding: '12px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Strategy-Scores</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px'
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Grid</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.grid}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px'
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Daytrading</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.day}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px'
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Pattern</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.pattern}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px'
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Regime</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.regime}</div>
                </div>
              </div>
            </div>

            {/* Tier 3 Forecast & Risk (nur bei Tier 3) */}
            {state.tier === 3 && (
              <div style={{ borderBottom: '1px solid #2b3138', padding: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Forecast & Risk</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{
                    background: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>1h / 1d Forecast</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.f1}</div>
                  </div>
                  <div style={{
                    background: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>4h / 7d Forecast</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.f2}</div>
                  </div>
                  <div style={{
                    background: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>VaR / CVaR</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.var}</div>
                  </div>
                  <div style={{
                    background: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>Sharpe</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.sharpe}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tier-specific Analysis */}
            <div style={{ padding: '12px' }}>
              {/* Tier 1 Analysis */}
              {state.tier === 1 && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Tier 1 - Quantum Screener Analysis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Whale Impact</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t1WhaleImpact}</div>
                    </div>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Toxicity Score</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t1Toxicity}</div>
                    </div>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Flow Direction</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t1FlowDir}</div>
                    </div>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Volume Ratio</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t1VolumeRatio}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>LightGBM Feature Importance</div>
                    {featureImportance.map(feature => (
                      <div key={feature.name} style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '6px'
                      }}>
                        <span style={{ width: '120px', fontSize: '11px', color: '#8b949e' }}>
                          {feature.name}
                        </span>
                        <div style={{ flex: 1, margin: '0 8px' }}>
                          <div style={{
                            height: '8px',
                            background: '#1f242d',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              background: '#2f81f7',
                              width: `${feature.value}%`,
                              borderRadius: '4px'
                            }}></div>
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', color: '#8b949e', width: '30px' }}>
                          {feature.value.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 2 Analysis */}
              {state.tier === 2 && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Tier 2 - Strategy Engine Analysis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Pattern Confidence</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t2PatternConf}</div>
                    </div>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Regime Detection</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t2Regime}</div>
                    </div>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Strategy Fit</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t2StrategyFit}</div>
                    </div>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Market Phase</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t2MarketPhase}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Strategy Overview</div>
                    {strategyOverview.map(strategy => (
                      <div key={strategy.name} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: '1px solid #2b3138',
                        fontSize: '12px'
                      }}>
                        <span>{strategy.name}</span>
                        <span>{strategy.score.toFixed(0)}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 3 Analysis */}
              {state.tier === 3 && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Tier 3 - Deep Forecast Analysis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>TFT Confidence</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t3TFTConf}</div>
                    </div>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>N-BEATS Accuracy</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t3NBEATSAcc}</div>
                    </div>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Risk Score</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t3RiskScore}</div>
                    </div>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '10px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Position Size</div>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierData.t3PosSize}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Forecast Visualization</div>
                    {forecastViz.map(forecast => (
                      <div key={forecast.label} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontSize: '11px', color: '#8b949e' }}>{forecast.label}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600 }}>
                          {forecast.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>VaR</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{tierData.t3VaR}</div>
                    </div>
                    <div style={{
                      background: '#1f242d',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>CVaR</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{tierData.t3CVaR}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Bottom Ticker */}
        <footer style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          padding: '8px 12px',
          background: '#161b22',
          borderTop: '1px solid #2b3138',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            whiteSpace: 'nowrap',
            animation: 'scroll 30s linear infinite'
          }}>
            {generateTickerData().map((item, index) => (
              <span
                key={index}
                style={{
                  fontSize: '11px',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  color: item.includes('T1') ? '#3fb950' : item.includes('T2') ? '#a371f7' : '#ff7b72'
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </footer>

        {/* Indicator Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,.5)',
            zIndex: 50
          }}>
            <div style={{
              background: '#161b22',
              border: '1px solid #2b3138',
              borderRadius: '10px',
              minWidth: '320px',
              maxWidth: '90vw',
              padding: '14px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Indikatoren</div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    border: '1px solid #2b3138',
                    background: '#1f242d',
                    color: '#e6edf3',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Schließen
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                <input
                  type="checkbox"
                  checked={state.smaOn}
                  onChange={(e) => setState(prev => ({ ...prev, smaOn: e.target.checked }))}
                />
                <label>SMA</label>
                <input
                  type="number"
                  value={state.smaLen}
                  onChange={(e) => setState(prev => ({ ...prev, smaLen: parseInt(e.target.value) || 20 }))}
                  min="2"
                  step="1"
                  style={{
                    width: '80px',
                    background: '#1f242d',
                    border: '1px solid #2b3138',
                    color: '#e6edf3',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                <input
                  type="checkbox"
                  checked={state.maOn}
                  onChange={(e) => setState(prev => ({ ...prev, maOn: e.target.checked }))}
                />
                <label>MA</label>
                <input
                  type="number"
                  value={state.maLen}
                  onChange={(e) => setState(prev => ({ ...prev, maLen: parseInt(e.target.value) || 50 }))}
                  min="2"
                  step="1"
                  style={{
                    width: '80px',
                    background: '#1f242d',
                    border: '1px solid #2b3138',
                    color: '#e6edf3',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    applyIndicators();
                  }}
                  style={{
                    border: '1px solid #2f81f7',
                    background: '#1f242d',
                    color: '#e6edf3',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Übernehmen
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </ThemeProvider>
  );

  function generateTickerData(): string[] {
    const items = [];
    for (let i = 0; i < 20; i++) {
      const u = universe[Math.floor(rnd(0, universe.length))];
      if (u) {
        const sign = Math.random() > 0.5 ? '+' : '-';
        const pct = rnd(0.1, 3.5).toFixed(1);
        items.push(`${u.symbol} · ${u.score} · ${sign}${pct}% · T${u.tier}`);
      }
    }
    return items;
  }
};

export default AI;