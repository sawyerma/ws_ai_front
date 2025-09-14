import * as React from "react"
import { TierLatencyCard } from "./TierLatencyCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"

// Mock data - will be replaced with real hook data
const mockTierData = {
  tier1: {
    target_latency_ms: 5,
    current_latency_ms: 3.2,
    throughput_signals_per_sec: 156,
    success_rate_percent: 94.7,
    last_signal_timestamp: new Date().toISOString()
  },
  tier2: {
    target_latency_ms: 50,
    current_latency_ms: 34,
    assignments_per_minute: 89,
    strategy_distribution: {
      grid: 45,
      daytrading: 35,
      pattern: 20
    },
    confidence_avg: 78.3
  },
  tier3: {
    target_latency_sec: 5,
    current_latency_sec: 3.1,
    forecasts_per_minute: 12,
    model_accuracy: {
      tft: 82,
      nbeats: 79,
      lstm: 85
    },
    risk_score_avg: 0.23
  }
}

export const TierPerformanceTab = () => {
  const overallSlaCompliance = React.useMemo(() => {
    const tier1Compliant = mockTierData.tier1.current_latency_ms <= mockTierData.tier1.target_latency_ms
    const tier2Compliant = mockTierData.tier2.current_latency_ms <= mockTierData.tier2.target_latency_ms
    const tier3Compliant = mockTierData.tier3.current_latency_sec <= mockTierData.tier3.target_latency_sec
    
    const compliantTiers = [tier1Compliant, tier2Compliant, tier3Compliant].filter(Boolean).length
    return (compliantTiers / 3) * 100
  }, [])

  return (
    <div className="space-y-6">
      {/* Overall Tier Performance Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              🎯 Tier System Performance Overview
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">SLA Compliance:</span>
              <Badge variant={overallSlaCompliance >= 99 ? "default" : overallSlaCompliance >= 90 ? "secondary" : "destructive"}>
                {overallSlaCompliance.toFixed(1)}%
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Real-time performance monitoring across all three-tier architecture levels
          </div>
        </CardContent>
      </Card>

      {/* Tier Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier 1 - Quantum Screener */}
        <TierLatencyCard
          tier="tier1"
          tierName="TIER 1 - QUANTUM SCREENER"
          icon="🚀"
          currentLatency={mockTierData.tier1.current_latency_ms}
          targetLatency={mockTierData.tier1.target_latency_ms}
          throughput={mockTierData.tier1.throughput_signals_per_sec}
          successRate={mockTierData.tier1.success_rate_percent}
        />

        {/* Tier 2 - Strategy Engine */}
        <TierLatencyCard
          tier="tier2"
          tierName="TIER 2 - STRATEGY ENGINE"
          icon="🎯"
          currentLatency={mockTierData.tier2.current_latency_ms}
          targetLatency={mockTierData.tier2.target_latency_ms}
          throughput={mockTierData.tier2.assignments_per_minute}
          successRate={mockTierData.tier2.confidence_avg}
        />

        {/* Tier 3 - Forecast & Risk */}
        <TierLatencyCard
          tier="tier3"
          tierName="TIER 3 - FORECAST & RISK"
          icon="🔮"
          currentLatency={mockTierData.tier3.current_latency_sec}
          targetLatency={mockTierData.tier3.target_latency_sec}
          throughput={mockTierData.tier3.forecasts_per_minute}
        />
      </div>

      {/* Detailed Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier 2 Strategy Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              🎯 Strategy Distribution (Tier 2)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Grid Trading</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--chart-primary))] transition-all duration-300"
                      style={{ width: `${mockTierData.tier2.strategy_distribution.grid}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{mockTierData.tier2.strategy_distribution.grid}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Day Trading</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--chart-secondary))] transition-all duration-300"
                      style={{ width: `${mockTierData.tier2.strategy_distribution.daytrading}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{mockTierData.tier2.strategy_distribution.daytrading}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pattern Recognition</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--chart-tertiary))] transition-all duration-300"
                      style={{ width: `${mockTierData.tier2.strategy_distribution.pattern}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{mockTierData.tier2.strategy_distribution.pattern}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier 3 Model Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              🔮 Model Accuracy (Tier 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">TFT (Temporal Fusion)</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--chart-tertiary))] transition-all duration-300"
                      style={{ width: `${mockTierData.tier3.model_accuracy.tft}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{mockTierData.tier3.model_accuracy.tft}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">N-BEATS</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--chart-quaternary))] transition-all duration-300"
                      style={{ width: `${mockTierData.tier3.model_accuracy.nbeats}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{mockTierData.tier3.model_accuracy.nbeats}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">LSTM</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[hsl(var(--chart-quinary))] transition-all duration-300"
                      style={{ width: `${mockTierData.tier3.model_accuracy.lstm}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{mockTierData.tier3.model_accuracy.lstm}%</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Risk Score Average</span>
                  <Badge variant={mockTierData.tier3.risk_score_avg < 0.3 ? "default" : "destructive"}>
                    {mockTierData.tier3.risk_score_avg.toFixed(3)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">📊 System Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(var(--status-success))]">
                {mockTierData.tier1.current_latency_ms}ms
              </div>
              <div className="text-xs text-muted-foreground">Tier 1 Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(var(--chart-secondary))]">
                {mockTierData.tier2.current_latency_ms}ms
              </div>
              <div className="text-xs text-muted-foreground">Tier 2 Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(var(--chart-tertiary))]">
                {mockTierData.tier3.current_latency_sec}s
              </div>
              <div className="text-xs text-muted-foreground">Tier 3 Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {overallSlaCompliance.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">SLA Compliance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
