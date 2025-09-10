import * as React from "react"
import { ProcessRAMBar } from "./ProcessRAMBar"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Switch } from "@/shared/ui/switch"
import { Label } from "@/shared/ui/label"

// Mock process data - will be replaced with real API data
const mockProcessData = [
  {
    processName: "Tier 1 Quantum",
    pid: 12345,
    ramUsageMB: 245,
    ramUsagePercent: 15.3,
    cpuUsagePercent: 23.5,
    status: "running"
  },
  {
    processName: "Tier 2 Strategy",
    pid: 12346,
    ramUsageMB: 180,
    ramUsagePercent: 11.2,
    cpuUsagePercent: 18.7,
    status: "running"
  },
  {
    processName: "Tier 3 Neural",
    pid: 12347,
    ramUsageMB: 220,
    ramUsagePercent: 13.8,
    cpuUsagePercent: 31.2,
    status: "running"
  },
  {
    processName: "ClickHouse",
    pid: 12348,
    ramUsageMB: 150,
    ramUsagePercent: 9.4,
    cpuUsagePercent: 12.1,
    status: "running"
  },
  {
    processName: "Redis",
    pid: 12349,
    ramUsageMB: 90,
    ramUsagePercent: 5.6,
    cpuUsagePercent: 3.2,
    status: "running"
  },
  {
    processName: "Binance Collector",
    pid: 12350,
    ramUsageMB: 65,
    ramUsagePercent: 4.1,
    cpuUsagePercent: 15.8,
    status: "running"
  },
  {
    processName: "Bitget Collector",
    pid: 12351,
    ramUsageMB: 60,
    ramUsagePercent: 3.8,
    cpuUsagePercent: 14.3,
    status: "running"
  },
  {
    processName: "FastAPI Backend",
    pid: 12352,
    ramUsageMB: 120,
    ramUsagePercent: 7.5,
    cpuUsagePercent: 8.9,
    status: "running"
  }
]

const mockSystemStats = {
  totalMemoryGB: 16,
  usedMemoryGB: 1.13,
  availableMemoryGB: 14.87,
  memoryUsagePercent: 7.1,
  cpuCores: 8,
  avgCpuUsage: 15.2
}

export const ProcessMonitorTab = () => {
  const [autoRefresh, setAutoRefresh] = React.useState(true)

  // ASCII System Overview
  const generateSystemASCII = () => {
    const memoryBars = Math.floor((mockSystemStats.memoryUsagePercent / 100) * 40)
    const memoryBar = "█".repeat(memoryBars) + "░".repeat(40 - memoryBars)
    
    return `
RAM Usage by Process:
┌─────────────────────────────────────────────────────────────┐
│ Tier 1 Quantum     ████████░░░░░░░░░░░░░░░░░░░░ 245 MB │
│ Tier 2 Strategy    ██████░░░░░░░░░░░░░░░░░░░░░░ 180 MB │
│ Tier 3 Neural      ███████░░░░░░░░░░░░░░░░░░░░░ 220 MB │
│ ClickHouse         █████░░░░░░░░░░░░░░░░░░░░░░░ 150 MB │
│ Redis              ███░░░░░░░░░░░░░░░░░░░░░░░░░  90 MB │
│ Binance Collector  ██░░░░░░░░░░░░░░░░░░░░░░░░░░  65 MB │
│ Bitget Collector   ██░░░░░░░░░░░░░░░░░░░░░░░░░░  60 MB │
│ FastAPI Backend    ████░░░░░░░░░░░░░░░░░░░░░░░░ 120 MB │
└─────────────────────────────────────────────────────────────┘
Total System: ${mockSystemStats.usedMemoryGB} GB / ${mockSystemStats.totalMemoryGB} GB (${mockSystemStats.memoryUsagePercent}%)

System Overview:
${memoryBar} ${mockSystemStats.memoryUsagePercent.toFixed(1)}% RAM
CPU Cores: ${mockSystemStats.cpuCores} | Average Usage: ${mockSystemStats.avgCpuUsage}%
    `
  }

  return (
    <div className="space-y-6">
      {/* Process Monitor Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              💻 System Process Monitor
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
              </div>
              <Button size="sm" variant="outline">
                Refresh Now
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Real-time monitoring of system processes with memory and CPU usage tracking
          </div>
        </CardContent>
      </Card>

      {/* System Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockSystemStats.usedMemoryGB} GB
              </div>
              <div className="text-xs text-muted-foreground">Memory Used</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockSystemStats.availableMemoryGB} GB
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mockSystemStats.avgCpuUsage}%
              </div>
              <div className="text-xs text-muted-foreground">Avg CPU</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {mockProcessData.length}
              </div>
              <div className="text-xs text-muted-foreground">Processes</div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Process List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>📊 Process Details</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Total: {mockSystemStats.usedMemoryGB} GB / {mockSystemStats.totalMemoryGB} GB
              </Badge>
              <Badge variant={mockSystemStats.memoryUsagePercent < 50 ? "default" : mockSystemStats.memoryUsagePercent < 80 ? "secondary" : "destructive"}>
                {mockSystemStats.memoryUsagePercent.toFixed(1)}% Used
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockProcessData.map((process, index) => (
            <ProcessRAMBar
              key={process.pid}
              processName={process.processName}
              pid={process.pid}
              ramUsageMB={process.ramUsageMB}
              ramUsagePercent={process.ramUsagePercent}
              cpuUsagePercent={process.cpuUsagePercent}
            />
          ))}
        </CardContent>
      </Card>

      {/* Memory Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Memory Consumers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🔥 Top Memory Consumers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockProcessData
                .sort((a, b) => b.ramUsageMB - a.ramUsageMB)
                .slice(0, 5)
                .map((process, index) => (
                  <div key={process.pid} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{process.processName}</span>
                    </div>
                    <div className="text-sm font-bold">
                      {process.ramUsageMB} MB
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Top CPU Consumers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">⚡ Top CPU Consumers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockProcessData
                .sort((a, b) => b.cpuUsagePercent - a.cpuUsagePercent)
                .slice(0, 5)
                .map((process, index) => (
                  <div key={process.pid} className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{process.processName}</span>
                    </div>
                    <div className="text-sm font-bold">
                      {process.cpuUsagePercent.toFixed(1)}%
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">💚 System Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Memory Health</div>
                <div className="text-sm text-muted-foreground">
                  {mockSystemStats.usedMemoryGB}GB / {mockSystemStats.totalMemoryGB}GB used
                </div>
              </div>
              <Badge variant={mockSystemStats.memoryUsagePercent < 50 ? "default" : mockSystemStats.memoryUsagePercent < 80 ? "secondary" : "destructive"}>
                {mockSystemStats.memoryUsagePercent < 50 ? "Excellent" : mockSystemStats.memoryUsagePercent < 80 ? "Good" : "Warning"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">CPU Health</div>
                <div className="text-sm text-muted-foreground">
                  {mockSystemStats.avgCpuUsage}% average load
                </div>
              </div>
              <Badge variant={mockSystemStats.avgCpuUsage < 30 ? "default" : mockSystemStats.avgCpuUsage < 70 ? "secondary" : "destructive"}>
                {mockSystemStats.avgCpuUsage < 30 ? "Excellent" : mockSystemStats.avgCpuUsage < 70 ? "Good" : "Warning"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Process Status</div>
                <div className="text-sm text-muted-foreground">
                  {mockProcessData.length} processes running
                </div>
              </div>
              <Badge variant="default">
                All Running
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
