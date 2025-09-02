import React, { useState, useEffect } from "react";
import ThemeProvider from "../components/ui/theme-provider";

interface AIProps {
  onBackToTrading?: () => void;
}

const AI = ({ onBackToTrading }: AIProps = {}) => {
  return (
    <ThemeProvider>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0d1117', 
        color: '#e6edf3', 
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto' 
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateRows: '56px 1fr 52px', 
          minHeight: '100vh' 
        }}>
          {/* Topbar */}
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            backgroundColor: '#161b22',
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
                    borderRadius: '4px'
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
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3fb950' }}></div>
                Tier 1 aktiv
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d29922' }}></div>
                Coins: <b>150</b>
              </span>
              <span>{new Date().toLocaleTimeString('de-DE')}</span>
              <span>Auto-Refresh: <b>30</b>s</span>
            </div>
          </header>

          {/* Main Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr 360px',
            gap: '1px',
            backgroundColor: '#2b3138',
            minHeight: '0'
          }}>
            {/* Left Panel: Coins */}
            <aside style={{
              backgroundColor: '#161b22',
              padding: '12px',
              overflow: 'auto',
              minHeight: '0'
            }}>
              <div style={{ fontWeight: 600, margin: '8px 0 10px' }}>Coins</div>
              
              {/* Search */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Symbol suchen… (z. B. BTCUSDT)"
                  style={{
                    flex: 1,
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    color: '#e6edf3',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '14px'
                  }}
                />
                <button style={{
                  backgroundColor: '#1f242d',
                  border: '1px solid #2b3138',
                  color: '#e6edf3',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer'
                }}>
                  Reset
                </button>
              </div>

              {/* Tier Badges */}
              <div style={{ display: 'flex', gap: '6px', margin: '6px 0 10px' }}>
                {["all", "1", "2", "3"].map(tier => (
                  <button
                    key={tier}
                    style={{
                      fontSize: '11px',
                      borderRadius: '999px',
                      padding: '2px 8px',
                      backgroundColor: tier === "all" ? '#2f81f7' : '#1f242d',
                      border: `1px solid ${tier === "all" ? '#2f81f7' : '#2b3138'}`,
                      color: tier === "all" ? '#e6edf3' : '#8b949e',
                      cursor: 'pointer'
                    }}
                  >
                    {tier === "all" ? "Alle" : `Tier ${tier}`}
                  </button>
                ))}
              </div>

              {/* Coin List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOGEUSDT'].map((symbol, i) => {
                  const score = Math.floor(Math.random() * 43 + 55);
                  const isSelected = i === 0;
                  return (
                    <div
                      key={symbol}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#1f242d' : 'transparent',
                        border: isSelected ? '1px solid #2f81f7' : '1px solid transparent'
                      }}
                    >
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '13px' }}>{symbol}</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: score >= 85 ? 'rgba(63,185,80,.18)' : score >= 70 ? 'rgba(210,153,34,.18)' : 'rgba(139,148,158,.18)',
                        color: score >= 85 ? '#3fb950' : score >= 70 ? '#d29922' : '#8b949e'
                      }}>
                        {score}
                      </span>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Center Panel: Tabs + Chart + NL */}
            <section style={{
              backgroundColor: '#161b22',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '0'
            }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #2b3138' }}>
                <button style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#e6edf3',
                  borderBottom: '2px solid #2f81f7',
                  backgroundColor: 'transparent',
                  border: 'none'
                }}>
                  TIER 1 · Quantum Screener
                </button>
                <button style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#8b949e',
                  backgroundColor: 'transparent',
                  border: 'none'
                }}>
                  TIER 2 · Strategy Engine
                </button>
                <button style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#8b949e',
                  backgroundColor: 'transparent',
                  border: 'none'
                }}>
                  TIER 3 · Deep Forecast
                </button>
                <div style={{ flex: 1 }}></div>
                <button style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#8b949e',
                  backgroundColor: 'transparent',
                  border: 'none'
                }}>
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
                  border: '1px solid #2f81f7',
                  backgroundColor: '#1f242d',
                  color: '#e6edf3',
                  padding: '6px 10px',
                  borderRadius: '6px'
                }}>
                  BTCUSDT
                </div>
                <div style={{
                  border: '1px solid #2b3138',
                  backgroundColor: '#1f242d',
                  color: '#e6edf3',
                  padding: '6px 10px',
                  borderRadius: '6px'
                }}>
                  $42,350.50
                </div>
                <div style={{
                  border: '1px solid #2b3138',
                  backgroundColor: '#1f242d',
                  color: '#e6edf3',
                  padding: '6px 10px',
                  borderRadius: '6px'
                }}>
                  Score: 87
                </div>
                <div style={{ flex: 1 }}></div>
                
                {/* Timeframe buttons */}
                {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf, i) => (
                  <button
                    key={tf}
                    style={{
                      padding: '6px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      backgroundColor: i === 0 ? '#1a48d8' : '#1f242d',
                      color: i === 0 ? 'white' : '#e6edf3',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {tf}
                  </button>
                ))}
                
                <button style={{
                  border: '1px solid #2b3138',
                  backgroundColor: '#1f242d',
                  color: '#e6edf3',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                  Indikatoren
                </button>
                <button style={{
                  border: '1px solid #2b3138',
                  backgroundColor: '#1f242d',
                  color: '#e6edf3',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                  Chart-Screenshot
                </button>
              </div>

              {/* Chart Area */}
              <div style={{
                position: 'relative',
                flex: 1,
                minHeight: '320px',
                backgroundColor: '#161b22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📊</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
                    Lightweight Charts Integration
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#8b949e' }}>
                    Chart für BTCUSDT · 1m · Tier 1
                  </div>
                </div>
                
                {/* Legend */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(13,17,23,.8)',
                  border: '1px solid #2b3138',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  BTCUSDT $42,350.50 +0.5%
                </div>
              </div>

              {/* Natural Language Engine */}
              <div style={{ borderTop: '1px solid #2b3138', padding: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Natural Language Engine</div>
                <div style={{
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#1f242d',
                  border: '1px solid #2b3138',
                  borderRadius: '8px',
                  padding: '10px',
                  minHeight: '88px',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}>
                  🚀 TIER 1 QUANTUM SCREENER - BTCUSDT{'\n'}
                  Score: 87/100 | Confidence: 89.2%{'\n'}
                  Whale Impact: 78.5% | Toxicity: 12.3%{'\n'}
                  Flow Direction: BULLISH | Volume Ratio: 2.14{'\n'}
                  Recommendation: Promote to Tier 2
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <textarea
                    placeholder="Nachricht oder Analyse schreiben…"
                    style={{
                      flex: 1,
                      minHeight: '70px',
                      resize: 'vertical',
                      backgroundColor: '#1f242d',
                      border: '1px solid #2b3138',
                      color: '#e6edf3',
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <select style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    color: '#e6edf3',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '14px'
                  }}>
                    <option value="local">local:default</option>
                    <option value="anthropic">anthropic:claude-sonnet-4</option>
                    <option value="openai">openai:gpt-5-thinking</option>
                  </select>
                  <button style={{
                    border: '1px solid #2f81f7',
                    backgroundColor: '#1f242d',
                    color: '#e6edf3',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    Senden
                  </button>
                  <button style={{
                    border: '1px solid #2b3138',
                    backgroundColor: '#1f242d',
                    color: '#e6edf3',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    Text kopieren
                  </button>
                  <button style={{
                    border: '1px solid #2b3138',
                    backgroundColor: '#1f242d',
                    color: '#e6edf3',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    An Telegram senden
                  </button>
                </div>
              </div>
            </section>

            {/* Right Panel: KPIs + Analysis */}
            <aside style={{
              backgroundColor: '#161b22',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              minHeight: '0'
            }}>
              {/* Tier KPIs */}
              <div style={{ borderBottom: '1px solid #2b3138', padding: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Tier-KPIs</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>Signals (24h)</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>347</div>
                  </div>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>Win-Rate</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>73.2%</div>
                  </div>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>Avg PnL</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>2.47%</div>
                  </div>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>Latency</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>2.1 ms</div>
                  </div>
                </div>
              </div>

              {/* Strategy Scores */}
              <div style={{ borderBottom: '1px solid #2b3138', padding: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Strategy-Scores</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>Grid</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>84</div>
                  </div>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>Daytrading</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>76</div>
                  </div>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>Pattern</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>91</div>
                  </div>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>Regime</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>Trend</div>
                  </div>
                </div>
              </div>

              {/* Tier 1 Analysis */}
              <div style={{ padding: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '12px' }}>Tier 1 - Quantum Screener Analysis</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Whale Impact</div>
                    <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>78.5%</div>
                  </div>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Toxicity Score</div>
                    <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>12.3%</div>
                  </div>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Flow Direction</div>
                    <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>BULLISH</div>
                  </div>
                  <div style={{
                    backgroundColor: '#1f242d',
                    border: '1px solid #2b3138',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>Volume Ratio</div>
                    <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>2.14</div>
                  </div>
                </div>
                
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>LightGBM Feature Importance</div>
                  {[
                    { name: 'Whale Impact', value: 85 },
                    { name: 'Liquidity', value: 78 },
                    { name: 'Volatility', value: 65 },
                    { name: 'Microstructure', value: 72 },
                    { name: 'ALMA Slope', value: 58 },
                    { name: 'Regime', value: 62 }
                  ].map(feature => (
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
                          backgroundColor: '#1f242d',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            backgroundColor: '#2f81f7',
                            width: `${feature.value}%`,
                            borderRadius: '4px'
                          }}></div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', color: '#8b949e', width: '30px' }}>
                        {feature.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom Ticker */}
          <footer style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#161b22',
            borderTop: '1px solid #2b3138',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              whiteSpace: 'nowrap',
              animation: 'scroll 30s linear infinite'
            }}>
              {Array.from({ length: 20 }, (_, i) => {
                const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];
                const symbol = symbols[i % symbols.length];
                const score = Math.floor(Math.random() * 40 + 60);
                const change = (Math.random() * 6 - 3).toFixed(1);
                const tier = Math.floor(Math.random() * 3) + 1;
                const sign = parseFloat(change) >= 0 ? '+' : '';
                
                return (
                  <span
                    key={i}
                    style={{
                      fontSize: '11px',
                      border: '1px solid #2b3138',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      color: tier === 1 ? '#3fb950' : tier === 2 ? '#a371f7' : '#ff7b72'
                    }}
                  >
                    {symbol} · {score} · {sign}{change}% · T{tier}
                  </span>
                );
              })}
            </div>
          </footer>
        </div>

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