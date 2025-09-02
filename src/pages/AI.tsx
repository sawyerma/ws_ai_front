import { useState, useEffect } from "react";
import { ArrowLeft, Search, RefreshCw, Settings, Camera, Send, Copy, MessageSquare } from "lucide-react";
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

interface StrategyScore {
  grid: number;
  day: number;
  pat: number;
  regime: string;
}

interface TierKPIs {
  signals: string;
  winRate: string;
  avgPnL: string;
  latency: string;
}

interface TierAnalysis {
  whaleImpact: string;
  toxicity: string;
  flowDir: string;
  volumeRatio: string;
  patternConf: string;
  regime: string;
  strategyFit: string;
  marketPhase: string;
  tftConf: string;
  nbeatsAcc: string;
  riskScore: string;
  posSize: string;
  var: string;
  cvar: string;
}

const AI = ({ onBackToTrading }: AIProps = {}) => {
  // State Management
  const [activeTier, setActiveTier] = useState(1);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1m");
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [nlPrompt, setNlPrompt] = useState("");
  const [nlModel, setNlModel] = useState("local");
  const [nlOutput, setNlOutput] = useState("—");
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data States
  const [universe, setUniverse] = useState<CoinData[]>([]);
  const [strategyScores, setStrategyScores] = useState<StrategyScore>({
    grid: 0, day: 0, pat: 0, regime: "Choppy"
  });
  const [tierKPIs, setTierKPIs] = useState<TierKPIs>({
    signals: "—", winRate: "—", avgPnL: "—", latency: "—"
  });
  const [tierAnalysis, setTierAnalysis] = useState<TierAnalysis>({
    whaleImpact: "—", toxicity: "—", flowDir: "—", volumeRatio: "—",
    patternConf: "—", regime: "—", strategyFit: "—", marketPhase: "—",
    tftConf: "—", nbeatsAcc: "—", riskScore: "—", posSize: "—",
    var: "—", cvar: "—"
  });

  // Initialize universe data
  useEffect(() => {
    const baseSymbols = [
      'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT','ADAUSDT','AVAXUSDT','DOGEUSDT','TONUSDT','TRXUSDT',
      'DOTUSDT','MATICUSDT','LINKUSDT','LTCUSDT','ATOMUSDT','XLMUSDT','NEARUSDT','APTUSDT','ARBUSDT','OPUSDT',
      'FILUSDT','SUIUSDT','INJUSDT','AAVEUSDT','RUNEUSDT','EGLDUSDT','ALGOUSDT','ICPUSDT','FTMUSDT','IMXUSDT',
      'HBARUSDT','TIAUSDT','SEIUSDT','OMNIUSDT','JUPUSDT','WIFUSDT','PEPEUSDT','PYTHUSDT','ORDIUSDT','ENAUSDT',
      'STRKUSDT','SAGAUSDT','BGBUSDT','TIAUSDC','SEIUSDC','RNDRUSDT','TAOUSDT','POLUSDT','WUSDT','MKRUSDT'
    ];

    const coins = baseSymbols.map((sym, i) => ({
      symbol: sym,
      score: Math.floor(Math.random() * 43 + 55), // 55-98
      tier: i < 10 ? 3 : i < 30 ? 2 : 1,
      price: Math.random() * 70000 + 0.01
    })).sort((a, b) => b.score - a.score);

    setUniverse(coins);
  }, []);

  // Timer effects
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          updateData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update data periodically
  const updateData = () => {
    // Update strategy scores
    setStrategyScores({
      grid: Math.floor(Math.random() * 40 + 60),
      day: Math.floor(Math.random() * 40 + 60),
      pat: Math.floor(Math.random() * 40 + 60),
      regime: ["Choppy", "Range", "Trend", "Breakout"][Math.floor(Math.random() * 4)]
    });

    // Update KPIs based on tier
    const tier = activeTier;
    setTierKPIs({
      signals: (tier === 1 ? Math.random() * 500 + 300 : tier === 2 ? Math.random() * 120 + 80 : Math.random() * 30 + 10).toFixed(0),
      winRate: (tier === 1 ? Math.random() * 10 + 48 : tier === 2 ? Math.random() * 12 + 52 : Math.random() * 13 + 55).toFixed(1) + '%',
      avgPnL: (tier === 1 ? Math.random() * 0.7 + 0.2 : tier === 2 ? Math.random() * 1.1 + 0.5 : Math.random() * 1.4 + 0.8).toFixed(2) + '%',
      latency: (tier === 1 ? Math.random() * 4 + 1 : tier === 2 ? Math.random() * 25 + 5 : Math.random() * 90 + 30).toFixed(0) + ' ms'
    });

    // Update tier-specific analysis
    setTierAnalysis({
      whaleImpact: (Math.random() * 30 + 65).toFixed(1) + '%',
      toxicity: (Math.random() * 30 + 5).toFixed(1) + '%',
      flowDir: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH',
      volumeRatio: (Math.random() * 2.4 + 0.8).toFixed(2),
      patternConf: (Math.random() * 20 + 75).toFixed(1) + '%',
      regime: ['RANGE', 'TREND', 'BREAKOUT'][Math.floor(Math.random() * 3)],
      strategyFit: (Math.random() * 18 + 80).toFixed(1) + '%',
      marketPhase: ['ACCUMULATION', 'DISTRIBUTION', 'MARKUP', 'MARKDOWN'][Math.floor(Math.random() * 4)],
      tftConf: (Math.random() * 9 + 88).toFixed(1) + '%',
      nbeatsAcc: (Math.random() * 10 + 85).toFixed(1) + '%',
      riskScore: (Math.random() * 0.3 + 0.1).toFixed(2),
      posSize: (Math.random() * 13 + 2).toFixed(1) + '%',
      var: (Math.random() * 3 + 1).toFixed(2) + '%',
      cvar: (Math.random() * 4.5 + 1.5).toFixed(2) + '%'
    });

    updateNLOutput();
  };

  const updateNLOutput = () => {
    const coin = universe.find(c => c.symbol === selectedSymbol) || { score: 0 };
    
    if (activeTier === 1) {
      setNlOutput(`🚀 TIER 1 QUANTUM SCREENER - ${selectedSymbol}
Score: ${coin.score}/100 | Confidence: ${Math.min(coin.score + Math.random() * 10 - 5, 100).toFixed(1)}%
Whale Impact: ${tierAnalysis.whaleImpact} | Toxicity: ${tierAnalysis.toxicity}
Flow Direction: ${tierAnalysis.flowDir} | Volume Ratio: ${tierAnalysis.volumeRatio}
Recommendation: ${coin.score >= 70 ? 'Promote to Tier 2' : 'Continue monitoring'}`);
    } else if (activeTier === 2) {
      setNlOutput(`🎯 TIER 2 STRATEGY ENGINE - ${selectedSymbol}
Pattern Confidence: ${tierAnalysis.patternConf} | Regime: ${tierAnalysis.regime}
Strategy Fit: ${tierAnalysis.strategyFit} | Market Phase: ${tierAnalysis.marketPhase}
Grid: ${strategyScores.grid}/100 | Day Trading: ${strategyScores.day}/100 | Pattern: ${strategyScores.pat}/100
Recommendation: ${coin.score >= 85 ? 'Promote to Tier 3' : 'Continue in Tier 2'}`);
    } else {
      setNlOutput(`🔮 TIER 3 DEEP FORECAST - ${selectedSymbol}
TFT Confidence: ${tierAnalysis.tftConf} | N-BEATS Accuracy: ${tierAnalysis.nbeatsAcc}
Risk Score: ${tierAnalysis.riskScore} | Position Size: ${tierAnalysis.posSize}
VaR: ${tierAnalysis.var} | CVaR: ${tierAnalysis.cvar}
Recommendation: ${Math.random() > 0.3 ? 'EXECUTE TRADE' : 'HOLD'}`);
    }
  };

  // Filter coins based on search and tier
  const filteredCoins = universe.filter(coin => {
    const matchesSearch = coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === "all" || coin.tier.toString() === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    updateNLOutput();
  };

  const handleTierChange = (tier: number) => {
    setActiveTier(tier);
    updateData();
  };

  const handleNLSend = () => {
    if (!nlPrompt.trim()) return;
    
    const timestamp = currentTime.toLocaleTimeString('de-DE', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    
    const prev = nlOutput === "—" ? "" : nlOutput + "\n";
    setNlOutput(prev + `> ${timestamp} · User: ${nlPrompt}\n< ${nlModel}: Antwort erzeugt (Demo).`);
    setNlPrompt("");
  };

  const handleCopyNL = () => {
    navigator.clipboard.writeText(nlOutput);
  };

  const handleSendTelegram = () => {
    alert('Telegram-Mock: Chart-Bild generiert und lokal gespeichert.\n(Backend-POST /notify/telegram hier integrieren.)');
  };

  const getScoreClass = (score: number) => {
    if (score >= 85) return "bg-green-500/20 text-green-400";
    if (score >= 70) return "bg-yellow-500/20 text-yellow-400";
    return "bg-gray-500/20 text-gray-400";
  };

  const getTierBadgeClass = (tier: number) => {
    const colors = {
      1: "text-green-400",
      2: "text-purple-400", 
      3: "text-red-400"
    };
    return colors[tier as keyof typeof colors] || "text-gray-400";
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#2b3138]">
          <div className="flex items-center gap-2">
            {onBackToTrading && (
              <button
                onClick={onBackToTrading}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
            <span className="text-lg">⚡</span>
            <span className="font-semibold">Quantum Screener</span>
            <span className="text-xs text-[#8b949e] ml-2">Tier 1/2/3 Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#8b949e]">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#3fb950] rounded-full"></div>
              Tier 1 aktiv
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#d29922] rounded-full"></div>
              Coins: <b>{universe.length}</b>
            </span>
            <span>{currentTime.toLocaleTimeString('de-DE')}</span>
            <span>Auto-Refresh: <b>{refreshCountdown}</b>s</span>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-[280px_1fr_360px] gap-px bg-[#2b3138] min-h-[calc(100vh-56px)]">
          
          {/* Left Panel: Coins + Filter */}
          <aside className="bg-[#161b22] p-3 overflow-auto">
            <div className="font-semibold mb-2 mt-2">Coins</div>
            
            {/* Search */}
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2 top-2 text-[#8b949e]" />
                <input
                  type="text"
                  placeholder="Symbol suchen… (z. B. BTCUSDT)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded px-7 py-2 text-sm focus:outline-none focus:border-[#2f81f7]"
                />
              </div>
              <button 
                onClick={() => {setSearchTerm(""); setTierFilter("all");}}
                className="px-3 py-2 bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded text-sm hover:bg-[#2b3138] transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Tier Badges */}
            <div className="flex gap-1 mb-2">
              {["all", "1", "2", "3"].map(tier => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    tierFilter === tier 
                      ? "text-[#e6edf3] border-[#2f81f7]" 
                      : "text-[#8b949e] border-[#2b3138] bg-[#1f242d] hover:text-[#e6edf3]"
                  }`}
                >
                  {tier === "all" ? "Alle" : `Tier ${tier}`}
                </button>
              ))}
            </div>

            {/* Coin List */}
            <div className="space-y-1">
              {filteredCoins.map(coin => (
                <div
                  key={coin.symbol}
                  onClick={() => handleSymbolSelect(coin.symbol)}
                  className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${
                    selectedSymbol === coin.symbol 
                      ? "bg-[#1f242d] ring-1 ring-[#2f81f7]" 
                      : "hover:bg-[#1f242d]"
                  }`}
                >
                  <span className="font-mono text-sm">{coin.symbol}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getScoreClass(coin.score)}`}>
                    {coin.score}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* Center Panel: Tabs + Chart + NL */}
          <section className="bg-[#161b22] flex flex-col">
            
            {/* Tabs */}
            <div className="flex border-b border-[#2b3138]">
              <button
                onClick={() => handleTierChange(1)}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  activeTier === 1 
                    ? "text-[#e6edf3] border-b-2 border-[#2f81f7]" 
                    : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                TIER 1 · Quantum Screener
              </button>
              <button
                onClick={() => handleTierChange(2)}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  activeTier === 2 
                    ? "text-[#e6edf3] border-b-2 border-[#2f81f7]" 
                    : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                TIER 2 · Strategy Engine
              </button>
              <button
                onClick={() => handleTierChange(3)}
                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                  activeTier === 3 
                    ? "text-[#e6edf3] border-b-2 border-[#2f81f7]" 
                    : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                TIER 3 · Deep Forecast
              </button>
              <div className="flex-1"></div>
              <button
                onClick={() => activeTier < 3 && handleTierChange(activeTier + 1)}
                className="px-4 py-3 text-sm font-semibold text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                Promote →
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 p-3 border-b border-[#2b3138]">
              <div className="px-3 py-1 bg-[#1f242d] border border-[#2f81f7] text-[#e6edf3] rounded text-sm">
                {selectedSymbol}
              </div>
              <div className="px-3 py-1 bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded text-sm">
                ${universe.find(c => c.symbol === selectedSymbol)?.price.toFixed(4) || "—"}
              </div>
              <div className="px-3 py-1 bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded text-sm">
                Score: {universe.find(c => c.symbol === selectedSymbol)?.score || "—"}
              </div>
              <div className="flex-1"></div>
              
              {/* Timeframe buttons */}
              {["1m", "5m", "15m", "1h", "4h", "1d"].map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedTimeframe === tf 
                      ? "bg-[#1a48d8] text-white" 
                      : "bg-[#1f242d] text-[#e6edf3] hover:bg-[#2b3138]"
                  }`}
                >
                  {tf}
                </button>
              ))}
              
              <button className="px-3 py-1 bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded text-sm hover:bg-[#2b3138] transition-colors flex items-center gap-1">
                <Settings size={12} />
                Indikatoren
              </button>
              <button 
                onClick={handleSendTelegram}
                className="px-3 py-1 bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded text-sm hover:bg-[#2b3138] transition-colors flex items-center gap-1"
              >
                <Camera size={12} />
                Chart-Screenshot
              </button>
            </div>

            {/* Chart Area */}
            <div className="relative flex-1 min-h-[320px] bg-[#161b22]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-lg font-semibold mb-2">Lightweight Charts Integration</div>
                  <div className="text-sm text-[#8b949e]">
                    Chart für {selectedSymbol} · {selectedTimeframe} · Tier {activeTier}
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="absolute top-3 left-3 bg-[#0d1117]/80 border border-[#2b3138] px-3 py-2 rounded text-sm">
                {selectedSymbol} ${universe.find(c => c.symbol === selectedSymbol)?.price.toFixed(2) || "—"} +0.5%
              </div>
            </div>

            {/* Natural Language Engine */}
            <div className="border-t border-[#2b3138] p-3">
              <div className="font-semibold mb-2">Natural Language Engine</div>
              <div className="bg-[#1f242d] border border-[#2b3138] rounded-lg p-3 min-h-[88px] whitespace-pre-wrap text-sm mb-2">
                {nlOutput}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={nlPrompt}
                  onChange={(e) => setNlPrompt(e.target.value)}
                  placeholder="Nachricht oder Analyse schreiben…"
                  className="flex-1 min-h-[70px] resize-y bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded p-2 text-sm focus:outline-none focus:border-[#2f81f7]"
                />
                <select
                  value={nlModel}
                  onChange={(e) => setNlModel(e.target.value)}
                  className="bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded px-2 text-sm focus:outline-none focus:border-[#2f81f7]"
                >
                  <option value="local">local:default</option>
                  <option value="anthropic:claude-sonnet-4-20250514">anthropic:claude-sonnet-4-20250514</option>
                  <option value="anthropic:sonnet-4.1-1m">anthropic:sonnet-4.1-1m</option>
                  <option value="openai:gpt-5-thinking">openai:gpt-5-thinking</option>
                </select>
                <button
                  onClick={handleNLSend}
                  className="px-3 py-2 bg-[#1f242d] border border-[#2f81f7] text-[#e6edf3] rounded text-sm hover:bg-[#2b3138] transition-colors flex items-center gap-1"
                >
                  <Send size={12} />
                  Senden
                </button>
                <button
                  onClick={handleCopyNL}
                  className="px-3 py-2 bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded text-sm hover:bg-[#2b3138] transition-colors flex items-center gap-1"
                >
                  <Copy size={12} />
                  Text kopieren
                </button>
                <button
                  onClick={handleSendTelegram}
                  className="px-3 py-2 bg-[#1f242d] border border-[#2b3138] text-[#e6edf3] rounded text-sm hover:bg-[#2b3138] transition-colors flex items-center gap-1"
                >
                  <MessageSquare size={12} />
                  An Telegram senden
                </button>
              </div>
            </div>
          </section>

          {/* Right Panel: KPIs + Analysis */}
          <aside className="bg-[#161b22] flex flex-col overflow-auto">
            
            {/* Tier KPIs */}
            <div className="border-b border-[#2b3138] p-3">
              <div className="font-semibold mb-2">Tier-KPIs</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                  <div className="text-xs text-[#8b949e]">Signals (24h)</div>
                  <div className="text-base font-bold mt-1">{tierKPIs.signals}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                  <div className="text-xs text-[#8b949e]">Win-Rate</div>
                  <div className="text-base font-bold mt-1">{tierKPIs.winRate}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                  <div className="text-xs text-[#8b949e]">Avg PnL</div>
                  <div className="text-base font-bold mt-1">{tierKPIs.avgPnL}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                  <div className="text-xs text-[#8b949e]">Latency</div>
                  <div className="text-base font-bold mt-1">{tierKPIs.latency}</div>
                </div>
              </div>
            </div>

            {/* Strategy Scores */}
            <div className="border-b border-[#2b3138] p-3">
              <div className="font-semibold mb-2">Strategy-Scores</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                  <div className="text-xs text-[#8b949e]">Grid</div>
                  <div className="text-base font-bold mt-1">{strategyScores.grid}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                  <div className="text-xs text-[#8b949e]">Daytrading</div>
                  <div className="text-base font-bold mt-1">{strategyScores.day}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                  <div className="text-xs text-[#8b949e]">Pattern</div>
                  <div className="text-base font-bold mt-1">{strategyScores.pat}</div>
                </div>
                <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                  <div className="text-xs text-[#8b949e]">Regime</div>
                  <div className="text-base font-bold mt-1">{strategyScores.regime}</div>
                </div>
              </div>
            </div>

            {/* Tier 3 Forecast & Risk (only show for Tier 3) */}
            {activeTier === 3 && (
              <div className="border-b border-[#2b3138] p-3">
                <div className="font-semibold mb-2">Forecast & Risk</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">1h / 1d Forecast</div>
                    <div className="text-base font-bold mt-1">+2.1% / +5.8%</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">4h / 7d Forecast</div>
                    <div className="text-base font-bold mt-1">+3.2% / +12.4%</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">VaR / CVaR</div>
                    <div className="text-base font-bold mt-1">{tierAnalysis.var} / {tierAnalysis.cvar}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Sharpe</div>
                    <div className="text-base font-bold mt-1">2.34</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tier-Specific Analysis */}
            {activeTier === 1 && (
              <div className="p-3">
                <div className="font-semibold mb-3">Tier 1 - Quantum Screener Analysis</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Whale Impact</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.whaleImpact}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Toxicity Score</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.toxicity}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Flow Direction</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.flowDir}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Volume Ratio</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.volumeRatio}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="font-semibold mb-2">LightGBM Feature Importance</div>
                  {[
                    { name: 'Whale Impact', value: 85 },
                    { name: 'Liquidity', value: 78 },
                    { name: 'Volatility', value: 65 },
                    { name: 'Microstructure', value: 72 },
                    { name: 'ALMA Slope', value: 58 },
                    { name: 'Regime', value: 62 }
                  ].map(feature => (
                    <div key={feature.name} className="flex items-center mb-1">
                      <span className="w-24 text-xs text-[#8b949e]">{feature.name}</span>
                      <div className="flex-1 mx-2">
                        <div className="h-2 bg-[#1f242d] rounded">
                          <div 
                            className="h-full bg-[#2f81f7] rounded"
                            style={{ width: `${feature.value}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs text-[#8b949e] w-8">{feature.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTier === 2 && (
              <div className="p-3">
                <div className="font-semibold mb-3">Tier 2 - Strategy Engine Analysis</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Pattern Confidence</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.patternConf}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Regime Detection</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.regime}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Strategy Fit</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.strategyFit}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Market Phase</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.marketPhase}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="font-semibold mb-2">Strategy Overview</div>
                  {[
                    { name: 'Grid Trading', score: 85 },
                    { name: 'Momentum', score: 78 },
                    { name: 'Mean Reversion', score: 72 },
                    { name: 'Breakout', score: 81 }
                  ].map(strategy => (
                    <div key={strategy.name} className="flex justify-between py-1 border-b border-[#2b3138] last:border-b-0">
                      <span className="text-sm">{strategy.name}</span>
                      <span className="text-sm font-semibold">{strategy.score}/100</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTier === 3 && (
              <div className="p-3">
                <div className="font-semibold mb-3">Tier 3 - Deep Forecast Analysis</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">TFT Confidence</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.tftConf}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">N-BEATS Accuracy</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.nbeatsAcc}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Risk Score</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.riskScore}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2">
                    <div className="text-xs text-[#8b949e]">Position Size</div>
                    <div className="text-sm font-semibold font-mono mt-1">{tierAnalysis.posSize}</div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="font-semibold mb-2">Forecast Visualization</div>
                  {[
                    { label: '1h', value: '+2.1%' },
                    { label: '4h', value: '+3.2%' },
                    { label: '1d', value: '+5.8%' },
                    { label: '7d', value: '+12.4%' }
                  ].map(forecast => (
                    <div key={forecast.label} className="flex justify-between items-center py-1">
                      <span className="text-xs text-[#8b949e]">{forecast.label}</span>
                      <span className="text-sm font-semibold font-mono">{forecast.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2 text-center">
                    <div className="text-xs text-[#8b949e] mb-1">VaR</div>
                    <div className="text-sm font-semibold font-mono">{tierAnalysis.var}</div>
                  </div>
                  <div className="bg-[#1f242d] border border-[#2b3138] rounded p-2 text-center">
                    <div className="text-xs text-[#8b949e] mb-1">CVaR</div>
                    <div className="text-sm font-semibold font-mono">{tierAnalysis.cvar}</div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Bottom Ticker */}
        <footer className="flex items-center gap-3 px-3 py-2 bg-[#161b22] border-t border-[#2b3138] overflow-hidden">
          <div className="flex gap-4 animate-scroll whitespace-nowrap">
            {Array.from({ length: 20 }, (_, i) => {
              const coin = universe[Math.floor(Math.random() * universe.length)];
              const sign = Math.random() > 0.5 ? '+' : '-';
              const pct = (Math.random() * 3.4 + 0.1).toFixed(1);
              return (
                <span key={i} className={`text-xs border border-[#2b3138] rounded px-2 py-1 ${getTierBadgeClass(coin.tier)}`}>
                  {coin.symbol} · {coin.score} · {sign}{pct}% · T{coin.tier}
                </span>
              );
            })}
          </div>
        </footer>

        <style jsx>{`
          @keyframes scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
        `}</style>
      </div>
    </ThemeProvider>
  );
};

export default AI;