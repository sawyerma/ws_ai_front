import React, { useState, useEffect, useRef } from 'react';
import ThemeProvider from "../components/ui/theme-provider";
import ThemeToggle from "../components/ui/theme-toggle";

interface AIProps {
  onBackToTrading?: () => void;
}

const AI = ({ onBackToTrading }: AIProps = {}) => {
  const [currentTier, setCurrentTier] = useState(1);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [clock, setClock] = useState('--:--:--');
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [nlText, setNlText] = useState('—');
  const [nlPrompt, setNlPrompt] = useState('');
  const [nlModel, setNlModel] = useState('local');
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);
  const [smaOn, setSmaOn] = useState(true);
  const [smaLen, setSmaLen] = useState(20);
  const [maOn, setMaOn] = useState(false);
  const [maLen, setMaLen] = useState(50);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  // Demo universe data
  const [universe, setUniverse] = useState(() => {
    const baseSymbols = [
      'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT','ADAUSDT','AVAXUSDT','DOGEUSDT','TONUSDT','TRXUSDT',
      'DOTUSDT','MATICUSDT','LINKUSDT','LTCUSDT','ATOMUSDT','XLMUSDT','NEARUSDT','APTUSDT','ARBUSDT','OPUSDT',
      'FILUSDT','SUIUSDT','INJUSDT','AAVEUSDT','RUNEUSDT','EGLDUSDT','ALGOUSDT','ICPUSDT','FTMUSDT','IMXUSDT',
      'HBARUSDT','TIAUSDT','SEIUSDT','OMNIUSDT','JUPUSDT','WIFUSDT','PEPEUSDT','PYTHUSDT','ORDIUSDT','ENAUSDT',
      'STRKUSDT','SAGAUSDT','BGBUSDT','TIAUSDC','SEIUSDC','RNDRUSDT','TAOUSDT','POLUSDT','WUSDT','MKRUSDT'
    ];
    
    return baseSymbols.map((sym, i) => ({
      symbol: sym,
      score: Math.floor(Math.random() * 43 + 55), // 55-98
      tier: i < 10 ? 3 : i < 30 ? 2 : 1,
      price: Math.random() * 70000 + 0.01
    })).sort((a, b) => b.score - a.score);
  });

  // KPI States
  const [kpis, setKpis] = useState({
    signals: '—',
    winRate: '—',
    avgPnL: '—',
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

  // Tier-specific analysis data
  const [tierAnalysis, setTierAnalysis] = useState({
    tier1: {
      whaleImpact: '—',
      toxicity: '—',
      flowDir: '—',
      volumeRatio: '—'
    },
    tier2: {
      patternConf: '—',
      regime: '—',
      strategyFit: '—',
      marketPhase: '—'
    },
    tier3: {
      tftConf: '—',
      nbeatsAcc: '—',
      riskScore: '—',
      posSize: '—',
      var: '—',
      cvar: '—'
    }
  });

  // Initialize chart
  useEffect(() => {
    if (chartRef.current && window.LightweightCharts) {
      const chart = window.LightweightCharts.createChart(chartRef.current, {
        layout: {
          background: { type: 'solid', color: '#161b22' },
          textColor: '#e6edf3'
        },
        grid: {
          vertLines: { color: '#2b3138' },
          horzLines: { color: '#2b3138' }
        },
        rightPriceScale: { borderColor: '#2b3138' },
        timeScale: { borderColor: '#2b3138', rightOffset: 6, barSpacing: 6 },
        crosshair: { mode: 0 },
        width: chartRef.current.clientWidth,
        height: 320
      });

      const candleSeries = chart.addCandlestickSeries();
      const smaSeries = chart.addLineSeries({ color: '#3fb950', lineWidth: 2, visible: false });
      const maSeries = chart.addLineSeries({ color: '#a371f7', lineWidth: 2, visible: false });

      chartInstance.current = { chart, candleSeries, smaSeries, maSeries };

      // Generate initial data
      updateChartData();
    }

    return () => {
      if (chartInstance.current?.chart) {
        chartInstance.current.chart.remove();
      }
    };
  }, []);

  // Clock and refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClock(now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          // Refresh data
          updateAllData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update chart data when symbol or timeframe changes
  useEffect(() => {
    updateChartData();
  }, [selectedSymbol, selectedTimeframe]);

  // Update tier-specific data when tier changes
  useEffect(() => {
    updateTierSpecificData();
    updateKPIs();
    updateNLText();
  }, [currentTier, selectedSymbol]);

  const updateChartData = () => {
    if (!chartInstance.current) return;

    const { candleSeries, smaSeries, maSeries } = chartInstance.current;
    
    // Generate OHLC data
    const seed = selectedSymbol === 'BTCUSDT' ? 42000 : Math.random() * 60000 + 100;
    const periods = selectedTimeframe === '1m' ? 300 : selectedTimeframe === '5m' ? 240 : 200;
    
    let time = Math.floor(Date.now() / 1000) - periods * 60;
    let price = seed;
    const data = [];
    
    for (let i = 0; i < periods; i++) {
      const open = price;
      const volatility = (Math.random() - 0.5) * 0.024;
      price = open * (1 + volatility);
      const high = Math.max(open, price) * (1 + Math.random() * 0.004);
      const low = Math.min(open, price) * (1 - Math.random() * 0.004);
      
      data.push({ time, open, high, low, close: price });
      time += 60;
    }

    candleSeries.setData(data);

    // Update indicators
    if (smaOn) {
      const smaData = calculateSMA(data, smaLen);
      smaSeries.setData(smaData);
      smaSeries.applyOptions({ visible: true });
    } else {
      smaSeries.applyOptions({ visible: false });
    }

    if (maOn) {
      const maData = calculateSMA(data, maLen);
      maSeries.setData(maData);
      maSeries.applyOptions({ visible: true });
    } else {
      maSeries.applyOptions({ visible: false });
    }
  };

  const calculateSMA = (data: any[], period: number) => {
    const result = [];
    let sum = 0;
    const queue = [];

    for (let i = 0; i < data.length; i++) {
      const close = data[i].close;
      queue.push(close);
      sum += close;

      if (queue.length > period) {
        sum -= queue.shift();
      }

      if (queue.length === period) {
        result.push({ time: data[i].time, value: sum / period });
      }
    }

    return result;
  };

  const updateAllData = () => {
    // Update universe scores
    setUniverse(prev => prev.map(coin => ({
      ...coin,
      score: Math.max(55, Math.min(98, coin.score + Math.floor(Math.random() * 7 - 3)))
    })));

    updateKPIs();
    updateTierSpecificData();
    updateNLText();
  };

  const updateKPIs = () => {
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
      regime: ['Choppy', 'Trend', 'Range', 'Breakout'][Math.floor(rnd(0, 4))],
      f1: `${(rnd(-3.5, 3.5) > 0 ? '+' : '')${rnd(-3.5, 3.5).toFixed(1)}% / ${(rnd(-8, 8) > 0 ? '+' : '')${rnd(-8, 8).toFixed(1)}%`,
      f2: `${(rnd(-10, 10) > 0 ? '+' : '')${rnd(-10, 10).toFixed(1)}% / ${(rnd(-25, 25) > 0 ? '+' : '')${rnd(-25, 25).toFixed(1)}%`,
      var: `${rnd(1.0, 4.0).toFixed(2)}% / ${rnd(1.5, 6.0).toFixed(2)}%`,
      sharpe: rnd(0.4, 2.2).toFixed(2)
    });
  };

  const updateTierSpecificData = () => {
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
        regime: ['RANGE', 'TREND', 'BREAKOUT'][Math.floor(rnd(0, 3))],
        strategyFit: rnd(80, 98).toFixed(1) + '%',
        marketPhase: ['ACCUMULATION', 'DISTRIBUTION', 'MARKUP', 'MARKDOWN'][Math.floor(rnd(0, 4))]
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
  };

  const updateNLText = () => {
    const coin = universe.find(u => u.symbol === selectedSymbol) || { score: 0 };
    
    if (currentTier === 1) {
      setNlText(`🚀 TIER 1 QUANTUM SCREENER - ${selectedSymbol}
Score: ${coin.score}/100 | Confidence: ${Math.min(coin.score + Math.random() * 10 - 5, 100).toFixed(1)}%
Whale Impact: ${tierAnalysis.tier1.whaleImpact} | Toxicity: ${tierAnalysis.tier1.toxicity}
Flow Direction: ${tierAnalysis.tier1.flowDir} | Volume Ratio: ${tierAnalysis.tier1.volumeRatio}
Recommendation: ${coin.score >= 70 ? 'Promote to Tier 2' : 'Continue monitoring'}`);
    } else if (currentTier === 2) {
      setNlText(`🎯 TIER 2 STRATEGY ENGINE - ${selectedSymbol}
Pattern Confidence: ${tierAnalysis.tier2.patternConf} | Regime: ${tierAnalysis.tier2.regime}
Strategy Fit: ${tierAnalysis.tier2.strategyFit} | Market Phase: ${tierAnalysis.tier2.marketPhase}
Grid: ${kpis.grid}/100 | Day Trading: ${kpis.day}/100 | Pattern: ${kpis.pattern}/100
Recommendation: ${coin.score >= 85 ? 'Promote to Tier 3' : 'Continue in Tier 2'}`);
    } else {
      setNlText(`🔮 TIER 3 DEEP FORECAST - ${selectedSymbol}
TFT Confidence: ${tierAnalysis.tier3.tftConf} | N-BEATS Accuracy: ${tierAnalysis.tier3.nbeatsAcc}
Risk Score: ${tierAnalysis.tier3.riskScore} | Position Size: ${tierAnalysis.tier3.posSize}
VaR: ${tierAnalysis.tier3.var} | CVaR: ${tierAnalysis.tier3.cvar}
Recommendation: ${Math.random() > 0.3 ? 'EXECUTE TRADE' : 'HOLD'}`);
    }
  };

  const handleTierChange = (tier: number) => {
    setCurrentTier(tier);
  };

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleTimeframeChange = (tf: string) => {
    setSelectedTimeframe(tf);
  };

  const handleNLSend = () => {
    if (!nlPrompt.trim()) return;
    
    const timestamp = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const prev = nlText === '—' ? '' : nlText + '\n';
    setNlText(prev + `> ${timestamp} · User: ${nlPrompt}\n< ${nlModel}: Antwort erzeugt (Demo).`);
    setNlPrompt('');
  };

  const handleCopyNL = () => {
    navigator.clipboard.writeText(nlText);
  };

  const filteredUniverse = universe.filter(coin => {
    const matchesSearch = !searchTerm || coin.symbol.toUpperCase().includes(searchTerm.toUpperCase());
    const matchesTier = tierFilter === 'all' || coin.tier.toString() === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getScoreClass = (score: number) => {
    if (score >= 85) return 'text-green-400 bg-green-900/20';
    if (score >= 70) return 'text-yellow-400 bg-yellow-900/20';
    return 'text-gray-400 bg-gray-700/20';
  };

  const formatPrice = (price: number) => {
    return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const selectedCoin = universe.find(u => u.symbol === selectedSymbol);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-['ui-sans-serif','system-ui','-apple-system','Segoe_UI','Roboto'] text-sm leading-[1.45]">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#2b3138] h-14">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-lg">⚡</span>
            <span>Quantum Screener</span>
            <span className="text-xs text-[#8b949e]">Tier 1/2/3 Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#8b949e]">
            {onBackToTrading && (
              <button
                onClick={onBackToTrading}
                className="px-3 py-2 bg-[#1f242d] text-[#e6edf3] rounded-lg hover:bg-[#2b3138] transition-colors flex items-center gap-2"
              >
                ← Back to Trading
              </button>
            )}
            <span>
              <span className="inline-block w-2 h-2 bg-[#3fb950] rounded-full mr-1"></span>
              Tier 1 aktiv
            </span>
            <span>
              <span className="inline-block w-2 h-2 bg-[#d29922] rounded-full mr-1"></span>
              Coins: <b>{universe.length}</b>
            </span>
            <span>{clock}</span>
            <span>Auto-Refresh: <b>{refreshCountdown}</b>s</span>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-[280px_1fr_360px] gap-px bg-[#2b3138] min-h-[calc(100vh-56px-52px)]">
          {/* Left Panel - Coins */}
          <aside className="bg-[#161b22] flex flex-col p-3 overflow-auto">
            <div className="font-semibold my-2">Coins</div>
            
            {/* Search */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Symbol suchen… (z. B. BTCUSDT)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded-md px-2 py-2 text-sm"
              />
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTierFilter('all');
                }}
                className="border border-[#2b3138] bg-[#1f242d] text-[#e6edf3] px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-[#2b3138]"
              >
                Reset
              </button>
            </div>

            {/* Tier Badges */}
            <div className="flex gap-1.5 my-2">
              {['all', '1', '2', '3'].map(tier => (
                <span
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`text-xs rounded-full px-2 py-1 bg-[#1f242d] border cursor-pointer ${
                    tierFilter === tier 
                      ? 'text-[#e6edf3] border-[#2f81f7]' 
                      : 'text-[#8b949e] border-[#2b3138] hover:text-[#e6edf3]'
                  }`}
                >
                  {tier === 'all' ? 'Alle' : `Tier ${tier}`}
                </span>
              ))}
            </div>

            {/* Coin List */}
            <div className="flex flex-col gap-1.5 mt-2">
              {filteredUniverse.map(coin => (
                <div
                  key={coin.symbol}
                  onClick={() => handleSymbolSelect(coin.symbol)}
                  className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                    selectedSymbol === coin.symbol 
                      ? 'bg-[#1f242d] outline outline-1 outline-[#2f81f7]' 
                      : 'hover:bg-[#1f242d]'
                  }`}
                >
                  <span className="font-mono text-xs">{coin.symbol}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getScoreClass(coin.score)}`}>
                    {coin.score}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* Center Panel - Chart & Controls */}
          <section className="bg-[#161b22] flex flex-col">
            {/* Tier Tabs */}
            <div className="flex border-b border-[#2b3138]">
              {[1, 2, 3].map(tier => (
                <div
                  key={tier}
                  onClick={() => handleTierChange(tier)}
                  className={`px-3.5 py-2.5 cursor-pointer font-semibold text-sm ${
                    currentTier === tier 
                      ? 'text-[#e6edf3] border-b-2 border-[#2f81f7]' 
                      : 'text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                >
                  TIER {tier} · {tier === 1 ? 'Quantum Screener' : tier === 2 ? 'Strategy Engine' : 'Deep Forecast'}
                </div>
              ))}
              <div className="flex-1"></div>
              <div
                onClick={() => {
                  if (currentTier < 3) {
                    handleTierChange(currentTier + 1);
                  }
                }}
                className={`px-3.5 py-2.5 cursor-pointer font-semibold text-sm ${
                  currentTier < 3 ? 'text-[#8b949e] hover:text-[#e6edf3]' : 'text-[#4a4a4a] cursor-not-allowed'
                }`}
              >
                Promote →
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 items-center px-3 py-2.5 border-b border-[#2b3138]">
              <div className="border border-[#2f81f7] bg-[#1f242d] text-[#e6edf3] px-2.5 py-1.5 rounded-md text-sm">
                {selectedSymbol}
              </div>
              <div className="border border-[#2b3138] bg-[#1f242d] text-[#e6edf3] px-2.5 py-1.5 rounded-md text-sm">
                {selectedCoin ? formatPrice(selectedCoin.price) : '—'}
              </div>
              <div className="border border-[#2b3138] bg-[#1f242d] text-[#e6edf3] px-2.5 py-1.5 rounded-md text-sm">
                Score: {selectedCoin?.score || '—'}
              </div>
              <div className="flex-1"></div>
              
              {/* Timeframe buttons */}
              {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                <div
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  className={`border bg-[#1f242d] text-[#e6edf3] px-2.5 py-1.5 rounded-md cursor-pointer text-sm ${
                    selectedTimeframe === tf ? 'border-[#2f81f7]' : 'border-[#2b3138] hover:border-[#2f81f7]'
                  }`}
                >
                  {tf}
                </div>
              ))}
              
              <button
                onClick={() => setShowIndicatorModal(true)}
                className="border border-[#2b3138] bg-[#1f242d] text-[#e6edf3] px-2.5 py-1.5 rounded-md cursor-pointer text-sm hover:border-[#2f81f7]"
              >
                Indikatoren
              </button>
              
              <button className="border border-[#2b3138] bg-[#1f242d] text-[#e6edf3] px-2.5 py-1.5 rounded-md cursor-pointer text-sm hover:border-[#2f81f7]">
                Chart-Screenshot
              </button>
            </div>

            {/* Chart */}
            <div className="relative flex-1 min-h-[320px]">
              <div ref={chartRef} className="absolute inset-0"></div>
              <div className="absolute left-3 top-3 bg-[rgba(13,17,23,0.8)] border border-[#2b3138] px-2.5 py-2 rounded-md text-xs">
                {selectedSymbol} {selectedCoin ? formatPrice(selectedCoin.price) : '—'}
              </div>
            </div>

            {/* Natural Language Block */}
            <div className="border-t border-[#2b3138] p-3">
              <div className="font-semibold mb-2">Natural Language Engine</div>
              <div className="whitespace-pre-wrap bg-[#1f242d] border border-[#2b3138] rounded-lg p-2.5 min-h-[88px] text-sm">
                {nlText}
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <textarea
                  value={nlPrompt}
                  onChange={(e) => setNlPrompt(e.target.value)}
                  placeholder="Nachricht oder Analyse schreiben…"
                  className="flex-1 min-h-[70px] resize-y bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded-md p-2 text-sm"
                />
                <select
                  value={nlModel}
                  onChange={(e) => setNlModel(e.target.value)}
                  className="bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded-md p-2 text-sm"
                >
                  <option value="local">local:default</option>
                  <option value="anthropic:claude-sonnet-4-20250514">anthropic:claude-sonnet-4-20250514</option>
                  <option value="anthropic:sonnet-4.1-1m">anthropic:sonnet-4.1-1m</option>
                  <option value="openai:gpt-5-thinking">openai:gpt-5-thinking</option>
                </select>
                <button
                  onClick={handleNLSend}
                  className="border border-[#2f81f7] bg-[#1f242d] text-[#e6edf3] px-2.5 py-2 rounded-md cursor-pointer text-sm hover:bg-[#2b3138]"
                >
                  Senden
                </button>
                <button
                  onClick={handleCopyNL}
                  className="border border-[#2b3138] bg-[#1f242d] text-[#e6edf3] px-2.5 py-2 rounded-md cursor-pointer text-sm hover:bg-[#2b3138]"
                >
                  Text kopieren
                </button>
                <button className="border border-[#2b3138] bg-[#1f242d] text-[#e6edf3] px-2.5 py-2 rounded-md cursor-pointer text-sm hover:bg-[#2b3138]">
                  An Telegram senden
                </button>
              </div>
            </div>
          </section>

          {/* Right Panel - KPIs & Analysis */}
          <aside className="bg-[#161b22] flex flex-col overflow-auto">
            {/* Tier KPIs */}
            <div className="border-b border-[#2b3138] p-3">
              <div className="font-semibold my-2 text-sm">Tier-KPIs</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                  <div className="text-xs text-[#8b949e]">Signals (24h)</div>
                  <div className="text-base font-bold mt-0.5">{kpis.signals}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                  <div className="text-xs text-[#8b949e]">Win-Rate</div>
                  <div className="text-base font-bold mt-0.5">{kpis.winRate}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                  <div className="text-xs text-[#8b949e]">Avg PnL</div>
                  <div className="text-base font-bold mt-0.5">{kpis.avgPnL}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                  <div className="text-xs text-[#8b949e]">Latency</div>
                  <div className="text-base font-bold mt-0.5">{kpis.latency}</div>
                </div>
              </div>
            </div>

            {/* Strategy Scores */}
            <div className="border-b border-[#2b3138] p-3">
              <div className="font-semibold my-2 text-sm">Strategy-Scores</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                  <div className="text-xs text-[#8b949e]">Grid</div>
                  <div className="text-base font-bold mt-0.5">{kpis.grid}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                  <div className="text-xs text-[#8b949e]">Daytrading</div>
                  <div className="text-base font-bold mt-0.5">{kpis.day}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                  <div className="text-xs text-[#8b949e]">Pattern</div>
                  <div className="text-base font-bold mt-0.5">{kpis.pattern}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                  <div className="text-xs text-[#8b949e]">Regime</div>
                  <div className="text-base font-bold mt-0.5">{kpis.regime}</div>
                </div>
              </div>
            </div>

            {/* Tier 3 Forecast & Risk (only visible for Tier 3) */}
            {currentTier === 3 && (
              <div className="border-b border-[#2b3138] p-3">
                <div className="font-semibold my-2 text-sm">Forecast & Risk</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                    <div className="text-xs text-[#8b949e]">1h / 1d Forecast</div>
                    <div className="text-base font-bold mt-0.5">{kpis.f1}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                    <div className="text-xs text-[#8b949e]">4h / 7d Forecast</div>
                    <div className="text-base font-bold mt-0.5">{kpis.f2}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                    <div className="text-xs text-[#8b949e]">VaR / CVaR</div>
                    <div className="text-base font-bold mt-0.5">{kpis.var}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5">
                    <div className="text-xs text-[#8b949e]">Sharpe</div>
                    <div className="text-base font-bold mt-0.5">{kpis.sharpe}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tier-specific Analysis */}
            {currentTier === 1 && (
              <div className="border-b border-[#2b3138] p-3">
                <div className="font-semibold my-2 text-sm">Tier 1 - Quantum Screener Analysis</div>
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">Whale Impact</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier1.whaleImpact}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">Toxicity Score</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier1.toxicity}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">Flow Direction</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier1.flowDir}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">Volume Ratio</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier1.volumeRatio}</div>
                  </div>
                </div>

                {/* Feature Importance */}
                <div className="mt-3">
                  <div className="font-semibold mt-3 mb-2 text-sm">LightGBM Feature Importance</div>
                  {[
                    { name: 'Whale Impact', value: 85 },
                    { name: 'Liquidity', value: 78 },
                    { name: 'Volatility', value: 65 },
                    { name: 'Microstructure', value: 72 },
                    { name: 'ALMA Slope', value: 68 },
                    { name: 'Regime', value: 58 }
                  ].map(feature => (
                    <div key={feature.name} className="flex items-center mb-1.5">
                      <span className="w-[120px] text-xs text-[#8b949e]">{feature.name}</span>
                      <div className="relative flex-1 h-2 bg-[#1f242d] rounded-sm">
                        <div 
                          className="h-2 bg-[#2f81f7] rounded-sm"
                          style={{ width: `${feature.value}%` }}
                        ></div>
                        <span className="absolute -right-8 text-[10px] text-[#8b949e] -top-0.5">
                          {feature.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentTier === 2 && (
              <div className="border-b border-[#2b3138] p-3">
                <div className="font-semibold my-2 text-sm">Tier 2 - Strategy Engine Analysis</div>
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">Pattern Confidence</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier2.patternConf}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">Regime Detection</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier2.regime}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">Strategy Fit</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier2.strategyFit}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">Market Phase</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier2.marketPhase}</div>
                  </div>
                </div>

                {/* Strategy Overview */}
                <div className="mt-3">
                  <div className="font-semibold mt-3 mb-2 text-sm">Strategy Overview</div>
                  {[
                    { name: 'Grid Trading', score: 82 },
                    { name: 'Momentum', score: 76 },
                    { name: 'Mean Reversion', score: 71 },
                    { name: 'Breakout', score: 85 }
                  ].map(strategy => (
                    <div key={strategy.name} className="flex justify-between py-1.5 border-b border-[#2b3138] text-xs last:border-b-0">
                      <span>{strategy.name}</span>
                      <span>{strategy.score}/100</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentTier === 3 && (
              <div className="border-b border-[#2b3138] p-3">
                <div className="font-semibold my-2 text-sm">Tier 3 - Deep Forecast Analysis</div>
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">TFT Confidence</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier3.tftConf}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">N-BEATS Accuracy</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier3.nbeatsAcc}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">Risk Score</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier3.riskScore}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2.5 text-xs">
                    <div className="text-[#8b949e] mb-1">Position Size</div>
                    <div className="font-semibold font-mono">{tierAnalysis.tier3.posSize}</div>
                  </div>
                </div>

                {/* Forecast Visualization */}
                <div className="mt-3">
                  <div className="font-semibold mt-3 mb-2 text-sm">Forecast Visualization</div>
                  {[
                    { label: '1h', value: '+2.3%' },
                    { label: '4h', value: '+5.1%' },
                    { label: '1d', value: '+8.7%' },
                    { label: '7d', value: '+15.2%' }
                  ].map(forecast => (
                    <div key={forecast.label} className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#8b949e]">{forecast.label}</span>
                      <span className="font-mono text-xs font-semibold">
                        {forecast.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Risk Meters */}
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2 text-center">
                    <div className="text-xs text-[#8b949e] mb-1">VaR</div>
                    <div className="font-mono font-semibold">{tierAnalysis.tier3.var}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded-md p-2 text-center">
                    <div className="text-xs text-[#8b949e] mb-1">CVaR</div>
                    <div className="font-mono font-semibold">{tierAnalysis.tier3.cvar}</div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Bottom Ticker */}
        <footer className="flex gap-3 items-center px-3 py-2 bg-[#161b22] border-t border-[#2b3138] overflow-hidden h-[52px]">
          <div className="flex gap-4 whitespace-nowrap animate-[scroll_30s_linear_infinite]">
            {universe.slice(0, 20).map((coin, i) => {
              const change = (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 3.5).toFixed(1) + '%';
              const tierColor = coin.tier === 1 ? 'text-[#3fb950]' : coin.tier === 2 ? 'text-[#a371f7]' : 'text-[#ff7b72]';
              
              return (
                <span
                  key={`${coin.symbol}-${i}`}
                  className={`text-xs border border-[#2b3138] rounded-md px-1.5 py-0.5 ${tierColor}`}
                >
                  {coin.symbol} · {coin.score} · {change} · T{coin.tier}
                </span>
              );
            })}
          </div>
        </footer>

        {/* Indicator Modal */}
        {showIndicatorModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-[#161b22] border border-[#2b3138] rounded-lg min-w-[320px] max-w-[90vw] p-3.5">
              <div className="flex justify-between items-center mb-2.5">
                <div className="font-semibold text-sm">Indikatoren</div>
                <button
                  onClick={() => setShowIndicatorModal(false)}
                  className="border border-[#2b3138] bg-[#1f242d] text-[#e6edf3] px-2.5 py-2 rounded-md cursor-pointer text-sm"
                >
                  Schließen
                </button>
              </div>
              
              <div className="flex items-center gap-2 my-2">
                <input
                  type="checkbox"
                  checked={smaOn}
                  onChange={(e) => setSmaOn(e.target.checked)}
                />
                <label>SMA</label>
                <input
                  type="number"
                  value={smaLen}
                  onChange={(e) => setSmaLen(Number(e.target.value))}
                  min="2"
                  step="1"
                  className="w-20 bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded-md px-1.5 py-1.5 text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2 my-2">
                <input
                  type="checkbox"
                  checked={maOn}
                  onChange={(e) => setMaOn(e.target.checked)}
                />
                <label>MA</label>
                <input
                  type="number"
                  value={maLen}
                  onChange={(e) => setMaLen(Number(e.target.value))}
                  min="2"
                  step="1"
                  className="w-20 bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded-md px-1.5 py-1.5 text-sm"
                />
              </div>
              
              <div className="flex items-center gap-2 my-2">
                <button
                  onClick={() => {
                    setShowIndicatorModal(false);
                    updateChartData();
                  }}
                  className="border border-[#2f81f7] bg-[#1f242d] text-[#e6edf3] px-2.5 py-2 rounded-md cursor-pointer text-sm"
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
};

export default AI;