import React, { useState, useEffect, useRef } from 'react';
import ThemeProvider from "../components/ui/theme-provider";

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
    }
    )
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
  }
}
Score: ${coin.score}/100 | Confidence: ${Math.min(coin.score + Math.random() * 10 - 5, 100).toFixed(1)}%
Whale Impact: ${tierAnalysis.tier1.whaleImpact} | Toxicity: ${tierAnalysis.tier1.toxicity}
Flow Direction: ${tierAnalysis.tier1.flowDir} | Volume Ratio: ${tierAnalysis.tier1.volumeRatio}
Recommendation: ${coin.score >= 70 ? 'Promote to Tier 2' : 'Continue monitoring'}`);
    } else if (currentTier === 2) {
      setNlText(\`🎯 TIER 2 STRATEGY ENGINE - ${selectedSymbol}
Pattern Confidence: ${tierAnalysis.tier2.patternConf} | Regime: ${tierAnalysis.tier2.regime}
Strategy Fit: ${tierAnalysis.tier2.strategyFit} | Market Phase: ${tierAnalysis.tier2.marketPhase}
Grid: ${kpis.grid}/100 | Day Trading: ${kpis.day}/100 | Pattern: ${kpis.pattern}/100
Recommendation: ${coin.score >= 85 ? 'Promote to Tier 3' : 'Continue in Tier 2'}`);
    } else {
      setNlText(\`🔮 TIER 3 DEEP FORECAST - ${selectedSymbol}
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
    if (score >= 85) return 's-high';
    if (score >= 70) return 's-mid';
    return 's-low';
  };

  const formatPrice = (price: number) => {
    return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const selectedCoin = universe.find(u => u.symbol === selectedSymbol);

  return (
    <div style={{
      margin: 0,
      background: '#0d1117',
      color: '#e6edf3',
      font: '14px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto',
      minHeight: '100vh',
      display: 'grid',
      gridTemplateRows: '56px 1fr 52px'
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
          <span style={{ fontSize: '18px' }}>⚡</span>
          <span>Quantum Screener</span>
          <span style={{ fontSize: '12px', color: '#8b949e' }}>Tier 1/2/3 Architecture</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: '#8b949e', fontSize: '12px' }}>
          <span>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#3fb950',
              display: 'inline-block',
              marginRight: '4px'
            }}></span>
            Tier 1 aktiv
          </span>
          <span>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#d29922',
              display: 'inline-block',
              marginRight: '4px'
            }}></span>
            Coins: <b>{universe.length}</b>
          </span>
          <span>{clock}</span>
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
        {/* Left Panel - Coins */}
        <aside style={{
          background: '#161b22',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
          overflow: 'auto'
        }}>
          <div style={{ fontWeight: 600, margin: '8px 0 10px' }}>Coins</div>
          
          {/* Search */}
          <div style={{ display: 'flex', gap: '8px' }}>
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
                border: '1px solid #2b3138',
                background: '#1f242d',
                color: '#e6edf3',
                padding: '6px 10px',
                borderRadius: '6px',
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
              <span
                key={tier}
                onClick={() => setTierFilter(tier)}
                style={{
                  fontSize: '11px',
                  borderRadius: '999px',
                  padding: '2px 8px',
                  background: '#1f242d',
                  border: tierFilter === tier ? '1px solid #2f81f7' : '1px solid #2b3138',
                  color: tierFilter === tier ? '#e6edf3' : '#8b949e',
                  cursor: 'pointer'
                }}
              >
                {tier === 'all' ? 'Alle' : `Tier ${tier}`}
              </span>
            ))}
          </div>

          {/* Coin List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
            {filteredUniverse.map(coin => (
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
                  background: selectedSymbol === coin.symbol ? '#1f242d' : 'transparent',
                  outline: selectedSymbol === coin.symbol ? '1px solid #2f81f7' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedSymbol !== coin.symbol) {
                    e.currentTarget.style.background = '#1f242d';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedSymbol !== coin.symbol) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular', fontSize: '13px' }}>
                  {coin.symbol}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: coin.score >= 85 ? 'rgba(63,185,80,.18)' : 
                               coin.score >= 70 ? 'rgba(210,153,34,.18)' : 'rgba(139,148,158,.18)',
                    color: coin.score >= 85 ? '#3fb950' : 
                           coin.score >= 70 ? '#d29922' : '#8b949e'
                  }}
                >
                  {coin.score}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Panel - Chart & Controls */}
        <section style={{
          background: '#161b22',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Tier Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #2b3138' }}>
            {[1, 2, 3].map(tier => (
              <div
                key={tier}
                onClick={() => handleTierChange(tier)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: currentTier === tier ? '#e6edf3' : '#8b949e',
                  borderBottom: currentTier === tier ? '2px solid #2f81f7' : 'none',
                  fontSize: '14px'
                }}
              >
                TIER {tier} · {tier === 1 ? 'Quantum Screener' : tier === 2 ? 'Strategy Engine' : 'Deep Forecast'}
              </div>
            ))}
            <div style={{ flex: 1 }}></div>
            <div
              onClick={() => {
                if (currentTier < 3) {
                  handleTierChange(currentTier + 1);
                }
              }}
              style={{
                padding: '10px 14px',
                cursor: currentTier < 3 ? 'pointer' : 'not-allowed',
                fontWeight: 600,
                color: currentTier < 3 ? '#8b949e' : '#4a4a4a',
                fontSize: '14px'
              }}
            >
              Promote →
            </div>
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
              border: '1px solid #2f81f7',
              background: '#1f242d',
              color: '#e6edf3',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {selectedSymbol}
            </div>
            <div style={{
              border: '1px solid #2b3138',
              background: '#1f242d',
              color: '#e6edf3',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {selectedCoin ? formatPrice(selectedCoin.price) : '—'}
            </div>
            <div style={{
              border: '1px solid #2b3138',
              background: '#1f242d',
              color: '#e6edf3',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              Score: {selectedCoin?.score || '—'}
            </div>
            <div style={{ flex: 1 }}></div>
            
            {/* Timeframe buttons */}
            {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
              <div
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                style={{
                  border: selectedTimeframe === tf ? '1px solid #2f81f7' : '1px solid #2b3138',
                  background: '#1f242d',
                  color: '#e6edf3',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {tf}
              </div>
            ))}
            
            <button
              onClick={() => setShowIndicatorModal(true)}
              style={{
                border: '1px solid #2b3138',
                background: '#1f242d',
                color: '#e6edf3',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
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
                fontSize: '14px'
              }}
            >
              Chart-Screenshot
            </button>
          </div>

          {/* Chart */}
          <div style={{ position: 'relative', flex: 1, minHeight: '320px' }}>
            <div ref={chartRef} style={{ position: 'absolute', inset: 0 }}></div>
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
              {selectedSymbol} {selectedCoin ? formatPrice(selectedCoin.price) : '—'}
            </div>
          </div>

          {/* Natural Language Block */}
          <div style={{ borderTop: '1px solid #2b3138', padding: '12px' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Natural Language Engine</div>
            <div style={{
              whiteSpace: 'pre-wrap',
              background: '#1f242d',
              border: '1px solid #2b3138',
              borderRadius: '8px',
              padding: '10px',
              minHeight: '88px',
              fontSize: '14px'
            }}>
              {nlText}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <textarea
                value={nlPrompt}
                onChange={(e) => setNlPrompt(e.target.value)}
                placeholder="Nachricht oder Analyse schreiben…"
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
                <option value="anthropic:claude-sonnet-4-20250514">anthropic:claude-sonnet-4-20250514</option>
                <option value="anthropic:sonnet-4.1-1m">anthropic:sonnet-4.1-1m</option>
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

        {/* Right Panel - KPIs & Analysis */}
        <aside style={{
          background: '#161b22',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}>
          {/* Tier KPIs */}
          <div style={{ borderBottom: '1px solid #2b3138', padding: '12px' }}>
            <div style={{ fontWeight: 600, margin: '8px 0 10px', fontSize: '14px' }}>Tier-KPIs</div>
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
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>{kpis.avgPnL}</div>
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
            <div style={{ fontWeight: 600, margin: '8px 0 10px', fontSize: '14px' }}>Strategy-Scores</div>
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

          {/* Tier 3 Forecast & Risk (only visible for Tier 3) */}
          {currentTier === 3 && (
            <div style={{ borderBottom: '1px solid #2b3138', padding: '12px' }}>
              <div style={{ fontWeight: 600, margin: '8px 0 10px', fontSize: '14px' }}>Forecast & Risk</div>
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
          {currentTier === 1 && (
            <div style={{ borderBottom: '1px solid #2b3138', padding: '12px' }}>
              <div style={{ fontWeight: 600, margin: '8px 0 10px', fontSize: '14px' }}>Tier 1 - Quantum Screener Analysis</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>Whale Impact</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier1.whaleImpact}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>Toxicity Score</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier1.toxicity}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>Flow Direction</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier1.flowDir}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>Volume Ratio</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier1.volumeRatio}</div>
                </div>
              </div>

              {/* Feature Importance */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontWeight: 600, marginTop: '12px', marginBottom: '8px', fontSize: '14px' }}>LightGBM Feature Importance</div>
                {[
                  { name: 'Whale Impact', value: 85 },
                  { name: 'Liquidity', value: 78 },
                  { name: 'Volatility', value: 65 },
                  { name: 'Microstructure', value: 72 },
                  { name: 'ALMA Slope', value: 68 },
                  { name: 'Regime', value: 58 }
                ].map(feature => (
                  <div key={feature.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ width: '120px', fontSize: '11px', color: '#8b949e' }}>{feature.name}</span>
                    <div style={{ position: 'relative', flex: 1, height: '8px', background: '#1f242d', borderRadius: '4px' }}>
                      <div style={{
                        height: '8px',
                        background: '#2f81f7',
                        borderRadius: '4px',
                        width: `${feature.value}%`
                      }}></div>
                      <span style={{
                        position: 'absolute',
                        right: '-35px',
                        fontSize: '10px',
                        color: '#8b949e',
                        top: '-1px'
                      }}>
                        {feature.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTier === 2 && (
            <div style={{ borderBottom: '1px solid #2b3138', padding: '12px' }}>
              <div style={{ fontWeight: 600, margin: '8px 0 10px', fontSize: '14px' }}>Tier 2 - Strategy Engine Analysis</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>Pattern Confidence</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier2.patternConf}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>Regime Detection</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier2.regime}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>Strategy Fit</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier2.strategyFit}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>Market Phase</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier2.marketPhase}</div>
                </div>
              </div>

              {/* Strategy Overview */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontWeight: 600, marginTop: '12px', marginBottom: '8px', fontSize: '14px' }}>Strategy Overview</div>
                {[
                  { name: 'Grid Trading', score: 82 },
                  { name: 'Momentum', score: 76 },
                  { name: 'Mean Reversion', score: 71 },
                  { name: 'Breakout', score: 85 }
                ].map(strategy => (
                  <div key={strategy.name} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid #2b3138',
                    fontSize: '12px'
                  }}>
                    <span>{strategy.name}</span>
                    <span>{strategy.score}/100</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTier === 3 && (
            <div style={{ borderBottom: '1px solid #2b3138', padding: '12px' }}>
              <div style={{ fontWeight: 600, margin: '8px 0 10px', fontSize: '14px' }}>Tier 3 - Deep Forecast Analysis</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>TFT Confidence</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier3.tftConf}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>N-BEATS Accuracy</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier3.nbeatsAcc}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>Risk Score</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier3.riskScore}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#8b949e', marginBottom: '4px' }}>Position Size</div>
                  <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{tierAnalysis.tier3.posSize}</div>
                </div>
              </div>

              {/* Forecast Visualization */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontWeight: 600, marginTop: '12px', marginBottom: '8px', fontSize: '14px' }}>Forecast Visualization</div>
                {[
                  { label: '1h', value: '+2.3%' },
                  { label: '4h', value: '+5.1%' },
                  { label: '1d', value: '+8.7%' },
                  { label: '7d', value: '+15.2%' }
                ].map(forecast => (
                  <div key={forecast.label} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '11px', color: '#8b949e' }}>{forecast.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600 }}>
                      {forecast.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Risk Meters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>VaR</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{tierAnalysis.tier3.var}</div>
                </div>
                <div style={{
                  background: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>CVaR</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{tierAnalysis.tier3.cvar}</div>
                </div>
              </div>
            </div>
          )}
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
          {universe.slice(0, 20).map((coin, i) => {
            const change = (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 3.5).toFixed(1) + '%';
            const tierColor = coin.tier === 1 ? '#3fb950' : coin.tier === 2 ? '#a371f7' : '#ff7b72';
            
            return (
              <span
                key={`${coin.symbol}-${i}`}
                style={{
                  fontSize: '11px',
                  border: '1px solid #2b3138',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  color: tierColor
                }}
              >
                {coin.symbol} · {coin.score} · {change} · T{coin.tier}
              </span>
            );
          })}
        </div>
      </footer>

      {/* Indicator Modal */}
      {showIndicatorModal && (
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
                onClick={() => setShowIndicatorModal(false)}
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
                  setShowIndicatorModal(false);
                  updateChartData();
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
  );
};

export default AI;