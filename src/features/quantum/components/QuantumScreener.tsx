import { useState, useRef } from "react";
import { useQuantumData } from '../hooks/useQuantumData';
import { useQuantumClock } from '../hooks/useQuantumClock';
import { useQuantumNL } from '../hooks/useQuantumNL';
import type { QuantumTier, TimeframeType, TierFilterType } from '../types/quantum';

const QuantumScreener = () => {
  const [currentTier, setCurrentTier] = useState<QuantumTier>(1);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>('1m');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<TierFilterType>('all');
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);
  const [smaOn, setSmaOn] = useState(true);
  const [smaLen, setSmaLen] = useState(20);
  const [maOn, setMaOn] = useState(false);
  const [maLen, setMaLen] = useState(50);

  const chartRef = useRef<HTMLDivElement>(null);

  // Custom hooks for business logic
  const { universe, kpis, tierAnalysis, updateAllData } = useQuantumData(currentTier);
  const { clock, refreshCountdown } = useQuantumClock(updateAllData);
  const { 
    nlText, 
    nlPrompt, 
    nlModel, 
    setNlPrompt, 
    setNlModel, 
    handleNLSend 
  } = useQuantumNL(selectedSymbol, currentTier, universe, tierAnalysis, kpis);

  const filteredUniverse = universe.filter(coin => {
    const matchesSearch = !searchTerm || coin.symbol.toUpperCase().includes(searchTerm.toUpperCase());
    const matchesTier = tierFilter === 'all' || coin.tier.toString() === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getScoreClass = (score: number) => {
    if (score >= 85) return 'text-[hsl(var(--status-success))]';
    if (score >= 70) return 'text-[hsl(var(--status-warning))]';
    return 'text-muted-foreground';
  };

  const formatPrice = (price: number) => {
    return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const selectedCoin = universe.find(u => u.symbol === selectedSymbol);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto', fontSize: '14px', lineHeight: '1.45' }}>
      {/* Topbar */}
      <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border h-14">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-lg">⚡</span>
          <span>Quantum Screener</span>
          <span className="text-xs text-muted-foreground">Tier 1/2/3 Architecture</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            <span className="inline-block w-2 h-2 bg-[hsl(var(--status-success))] rounded-full mr-1"></span>
            Tier 1 aktiv
          </span>
          <span>
            <span className="inline-block w-2 h-2 bg-[hsl(var(--status-warning))] rounded-full mr-1"></span>
            Coins: <b>{universe.length}</b>
          </span>
          <span>{clock}</span>
          <span>Auto-Refresh: <b>{refreshCountdown}</b>s</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-[280px_1fr_360px] gap-px bg-border min-h-[calc(100vh-56px-52px)]">
        {/* Left Panel - Coins */}
        <aside className="bg-card flex flex-col p-3 overflow-auto">
          <div className="font-semibold my-2">Coins</div>
          
          {/* Search */}
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Symbol suchen… (z. B. BTCUSDT)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-background border border-border text-foreground rounded-md px-2 py-2 text-sm"
            />
            <button
              onClick={() => {
                setSearchTerm('');
                setTierFilter('all');
              }}
              className="border border-border bg-muted text-foreground px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-muted/80"
            >
              Reset
            </button>
          </div>

          {/* Tier Badges */}
          <div className="flex gap-1.5 my-2">
            {['all', '1', '2', '3'].map(tier => (
              <span
                key={tier}
                onClick={() => setTierFilter(tier as TierFilterType)}
                className={`text-xs rounded-full px-2 py-1 bg-muted border cursor-pointer ${
                  tierFilter === tier 
                    ? 'text-foreground border-primary' 
                    : 'text-muted-foreground border-border hover:text-foreground'
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
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                  selectedSymbol === coin.symbol 
                    ? 'bg-muted outline outline-1 outline-primary' 
                    : 'hover:bg-muted'
                }`}
              >
                <span className="font-mono text-xs">{coin.symbol}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${coin.score >= 85 ? 'text-[hsl(var(--status-success))] bg-[hsl(var(--status-success-bg))]' : coin.score >= 70 ? 'text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning-bg))]' : 'text-muted-foreground bg-muted/50'}`}>
                  {coin.score}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Panel */}
        <div className="bg-card flex flex-col">
          {/* Tier Tabs */}
          <div className="flex border-b border-border">
            {([1, 2, 3] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setCurrentTier(tier as QuantumTier)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  currentTier === tier 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                TIER {tier} · {tier === 1 ? 'Quantum Screener' : tier === 2 ? 'Strategy Engine' : 'Deep Forecast'}
              </button>
            ))}
          </div>

          {/* Symbol Info Bar */}
          <div className="flex gap-3 items-center p-3 border-b border-border">
            <span className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
              {selectedSymbol}
            </span>
            <span className="px-3 py-1 bg-muted rounded-md text-sm">
              {selectedCoin ? formatPrice(selectedCoin.price) : '—'}
            </span>
            <span className="px-3 py-1 bg-muted rounded-md text-sm">
              Score: {selectedCoin?.score || '—'}
            </span>
            <div className="flex-1"></div>
            
            {(['1m', '5m', '15m', '1h', '4h', '1d'] as const).map(tf => (
              <span
                key={tf}
                onClick={() => setSelectedTimeframe(tf as TimeframeType)}
                className={`px-2 py-1 text-xs rounded-md cursor-pointer transition-colors ${
                  selectedTimeframe === tf 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {tf}
              </span>
            ))}
            
            <button
              onClick={() => setShowIndicatorModal(true)}
              className="px-3 py-1 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
            >
              Indikatoren
            </button>
          </div>

          {/* Chart Area */}
          <div className="relative flex-1 p-3">
            <div ref={chartRef} className="w-full h-full bg-muted rounded-md flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">📈</div>
                <div>Chart wird geladen...</div>
                <div className="text-sm mt-1">{selectedSymbol} - {selectedTimeframe}</div>
              </div>
            </div>
          </div>

          {/* Natural Language Section */}
          <div className="border-t border-border p-3">
            <h4 className="font-semibold mb-2">Natural Language Engine</h4>
            <div className="bg-muted rounded-lg p-3 min-h-[100px] text-sm whitespace-pre-wrap mb-3">
              {nlText}
            </div>
            <div className="flex gap-2">
              <textarea
                value={nlPrompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNlPrompt(e.target.value)}
                placeholder="Nachricht oder Analyse schreiben…"
                className="flex-1 min-h-[60px] resize-y bg-background border border-border rounded-md p-2 text-sm text-foreground"
              />
              <div className="flex flex-col gap-2">
                <select
                  value={nlModel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNlModel(e.target.value as import('../types/quantum').NLModelType)}
                  className="bg-background border border-border rounded-md p-2 text-sm text-foreground"
                >
                  <option value="local">local:default</option>
                  <option value="anthropic:claude-sonnet-4-20250514">anthropic:claude-sonnet-4-20250514</option>
                  <option value="anthropic:sonnet-4.1-1m">anthropic:sonnet-4.1-1m</option>
                  <option value="openai:gpt-5-thinking">openai:gpt-5-thinking</option>
                </select>
                <button
                  onClick={handleNLSend}
                  className="px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/80 rounded-md text-sm transition-colors"
                >
                  Senden
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - KPIs */}
        <div className="bg-card flex flex-col gap-4 p-3 overflow-auto">
          {/* Tier KPIs */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Tier-KPIs</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted border border-border rounded-md p-2">
                <div className="text-xs text-muted-foreground">Signals (24h)</div>
                <div className="font-bold">{kpis.signals}</div>
              </div>
              <div className="bg-muted border border-border rounded-md p-2">
                <div className="text-xs text-muted-foreground">Win-Rate</div>
                <div className="font-bold">{kpis.winRate}</div>
              </div>
              <div className="bg-muted border border-border rounded-md p-2">
                <div className="text-xs text-muted-foreground">Avg PnL</div>
                <div className="font-bold">{kpis.avgPnL}</div>
              </div>
              <div className="bg-muted border border-border rounded-md p-2">
                <div className="text-xs text-muted-foreground">Latency</div>
                <div className="font-bold">{kpis.latency}</div>
              </div>
            </div>
          </div>

          {/* Strategy Scores */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Strategy-Scores</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted border border-border rounded-md p-2">
                <div className="text-xs text-muted-foreground">Grid</div>
                <div className="font-bold">{kpis.grid}</div>
              </div>
              <div className="bg-muted border border-border rounded-md p-2">
                <div className="text-xs text-muted-foreground">Daytrading</div>
                <div className="font-bold">{kpis.day}</div>
              </div>
              <div className="bg-muted border border-border rounded-md p-2">
                <div className="text-xs text-muted-foreground">Pattern</div>
                <div className="font-bold">{kpis.pattern}</div>
              </div>
              <div className="bg-muted border border-border rounded-md p-2">
                <div className="text-xs text-muted-foreground">Regime</div>
                <div className="font-bold">{kpis.regime}</div>
              </div>
            </div>
          </div>

          {/* Tier-specific Analysis */}
          {currentTier === 1 && (
            <div>
              <h4 className="font-semibold mb-3 text-sm">Tier 1 Analysis</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Whale Impact</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier1.whaleImpact}</div>
                </div>
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Toxicity</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier1.toxicity}</div>
                </div>
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Flow Direction</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier1.flowDir}</div>
                </div>
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Volume Ratio</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier1.volumeRatio}</div>
                </div>
              </div>
            </div>
          )}

          {currentTier === 2 && (
            <div>
              <h4 className="font-semibold mb-3 text-sm">Tier 2 Analysis</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Pattern Confidence</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier2.patternConf}</div>
                </div>
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Regime</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier2.regime}</div>
                </div>
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Strategy Fit</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier2.strategyFit}</div>
                </div>
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Market Phase</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier2.marketPhase}</div>
                </div>
              </div>
            </div>
          )}

          {currentTier === 3 && (
            <div>
              <h4 className="font-semibold mb-3 text-sm">Tier 3 Analysis</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">TFT Confidence</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier3.tftConf}</div>
                </div>
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">N-BEATS Accuracy</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier3.nbeatsAcc}</div>
                </div>
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Risk Score</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier3.riskScore}</div>
                </div>
                <div className="bg-muted border border-border rounded-md p-2 text-xs">
                  <div className="text-muted-foreground mb-1">Position Size</div>
                  <div className="font-semibold font-mono">{tierAnalysis.tier3.posSize}</div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced KPIs */}
          <div>
            <h4 className="font-semibold mb-3 text-sm">Advanced KPIs</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-muted border border-border rounded-md p-2 text-xs">
                <div className="text-muted-foreground mb-1">F1 (1d/1w)</div>
                <div className="font-semibold font-mono">{kpis.f1}</div>
              </div>
              <div className="bg-muted border border-border rounded-md p-2 text-xs">
                <div className="text-muted-foreground mb-1">F2 (1w/1m)</div>
                <div className="font-semibold font-mono">{kpis.f2}</div>
              </div>
              <div className="bg-muted border border-border rounded-md p-2 text-xs">
                <div className="text-muted-foreground mb-1">VaR (95/99%)</div>
                <div className="font-semibold font-mono">{kpis.var}</div>
              </div>
              <div className="bg-muted border border-border rounded-md p-2 text-xs">
                <div className="text-muted-foreground mb-1">Sharpe Ratio</div>
                <div className="font-semibold font-mono">{kpis.sharpe}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicator Modal */}
      {showIndicatorModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card border border-border rounded-lg p-6 min-w-[320px] max-w-[90vw] text-foreground">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Indikatoren</h3>
              <button
                onClick={() => setShowIndicatorModal(false)}
                className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">SMA</label>
                <input
                  type="checkbox"
                  checked={smaOn}
                  onChange={(e) => setSmaOn(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              
              {smaOn && (
                <div className="flex items-center gap-2">
                  <label className="text-sm">Länge:</label>
                  <input
                    type="number"
                    value={smaLen}
                    onChange={(e) => setSmaLen(parseInt(e.target.value) || 20)}
                    className="w-16 px-2 py-1 bg-background border border-border rounded-md text-sm text-foreground"
                    min="1"
                    max="200"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Moving Average</label>
                <input
                  type="checkbox"
                  checked={maOn}
                  onChange={(e) => setMaOn(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              
              {maOn && (
                <div className="flex items-center gap-2">
                  <label className="text-sm">Länge:</label>
                  <input
                    type="number"
                    value={maLen}
                    onChange={(e) => setMaLen(parseInt(e.target.value) || 50)}
                    className="w-16 px-2 py-1 bg-background border border-border rounded-md text-sm text-foreground"
                    min="1"
                    max="200"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowIndicatorModal(false)}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-md text-sm transition-colors"
              >
                Anwenden
              </button>
              <button
                onClick={() => {
                  setSmaOn(true);
                  setSmaLen(20);
                  setMaOn(false);
                  setMaLen(50);
                }}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors text-foreground"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Ticker */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border h-[52px] overflow-hidden">
        <div className="flex items-center h-full">
          <div className="animate-ticker flex whitespace-nowrap text-sm text-muted-foreground">
            <span className="mx-8">⚡ Tier 1 aktiv: {universe.length} Coins</span>
            <span className="mx-8">🔥 Top Performer: {universe.find(c => c.score >= 85)?.symbol || 'N/A'}</span>
            <span className="mx-8">📊 Win-Rate: {kpis.winRate}</span>
            <span className="mx-8">⏱️ Avg Latency: {kpis.latency}</span>
            <span className="mx-8">💰 Best Grid Score: {kpis.grid}</span>
            <span className="mx-8">📈 Pattern Recognition: {kpis.pattern}</span>
            <span className="mx-8">🎯 Active Strategies: Grid • Day • Pattern • Regime</span>
            <span className="mx-8">⚡ Tier 1 aktiv: {universe.length} Coins</span>
            <span className="mx-8">🔥 Top Performer: {universe.find(c => c.score >= 85)?.symbol || 'N/A'}</span>
            <span className="mx-8">📊 Win-Rate: {kpis.winRate}</span>
            <span className="mx-8">⏱️ Avg Latency: {kpis.latency}</span>
            <span className="mx-8">💰 Best Grid Score: {kpis.grid}</span>
            <span className="mx-8">📈 Pattern Recognition: {kpis.pattern}</span>
            <span className="mx-8">🎯 Active Strategies: Grid • Day • Pattern • Regime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumScreener;
