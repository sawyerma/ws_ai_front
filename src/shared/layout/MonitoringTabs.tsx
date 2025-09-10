import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Button } from "@/shared/ui/button"
import { GlobalPerformanceMonitor } from "./GlobalPerformanceMonitor"
import { TierPerformanceTab } from "./TierPerformanceTab"
import { ProcessMonitorTab } from "./ProcessMonitorTab"
import { AlertsPanel } from "./AlertsPanel"

const monitoringTabsVariants = cva(
  "w-full space-y-4",
  {
    variants: {
      theme: {
        default: "bg-background text-foreground",
        enterprise: "bg-card text-card-foreground"
      },
      size: {
        default: "p-6",
        compact: "p-4",
        full: "p-8"
      }
    },
    defaultVariants: {
      theme: "default",
      size: "default"
    }
  }
)

export interface MonitoringTabsProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof monitoringTabsVariants> {}

const MonitoringTabs = React.forwardRef<HTMLDivElement, MonitoringTabsProps>(
  ({ className, theme, size, ...props }, ref) => {
    const handleRecord = () => {
      console.log('Recording started...');
    };

    const handleExport = () => {
      console.log('Exporting report...');
    };

    return (
      <div
        className={cn(monitoringTabsVariants({ theme, size, className }))}
        ref={ref}
        {...props}
      >
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="tiers">🎯 Tiers</TabsTrigger>
            <TabsTrigger value="processes">💻 Processes</TabsTrigger>
            <TabsTrigger value="charts">📈 Charts</TabsTrigger>
            <TabsTrigger value="alerts">🚨 Alerts</TabsTrigger>
            <TabsTrigger value="reports">📋 Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">System Overview</h3>
              <div className="flex gap-2">
                <Button onClick={handleRecord} size="sm" className="bg-green-600 hover:bg-green-700">
                  ▶ Record
                </Button>
                <Button onClick={handleExport} size="sm" variant="outline">
                  📊 Export
                </Button>
              </div>
            </div>
            <GlobalPerformanceMonitor />
          </TabsContent>
          
          <TabsContent value="tiers">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tier Performance</h3>
              <div className="flex gap-2">
                <Button onClick={handleRecord} size="sm" className="bg-green-600 hover:bg-green-700">
                  ▶ Record
                </Button>
                <Button onClick={handleExport} size="sm" variant="outline">
                  📊 Export
                </Button>
              </div>
            </div>
            <TierPerformanceTab />
          </TabsContent>
          
          <TabsContent value="processes">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Process Monitoring</h3>
              <div className="flex gap-2">
                <Button onClick={handleRecord} size="sm" className="bg-green-600 hover:bg-green-700">
                  ▶ Record
                </Button>
                <Button onClick={handleExport} size="sm" variant="outline">
                  📊 Export
                </Button>
              </div>
            </div>
            <ProcessMonitorTab />
          </TabsContent>
          
          <TabsContent value="charts">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Performance Charts</h3>
              <div className="flex gap-2">
                <Button onClick={handleRecord} size="sm" className="bg-green-600 hover:bg-green-700">
                  ▶ Record
                </Button>
                <Button onClick={handleExport} size="sm" variant="outline">
                  📊 Export
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium mb-3">Latency Trends</h4>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Real-time latency charts will appear here
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium mb-3">Throughput Metrics</h4>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Throughput analytics will appear here
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium mb-3">Resource Usage</h4>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  System resource charts will appear here
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium mb-3">SLA Compliance</h4>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  SLA compliance tracking will appear here
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="alerts">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Alert Management</h3>
              <div className="flex gap-2">
                <Button onClick={handleRecord} size="sm" className="bg-green-600 hover:bg-green-700">
                  ▶ Record
                </Button>
                <Button onClick={handleExport} size="sm" variant="outline">
                  📊 Export
                </Button>
              </div>
            </div>
            <AlertsPanel
              alerts={[]}
              rules={[
                {
                  id: "frontend-latency",
                  name: "Frontend Latency SLA",
                  metric: "frontend.latency_ms",
                  condition: "greater_than",
                  threshold: 5,
                  severity: "high",
                  enabled: true,
                  notification_channels: ["email", "slack"]
                },
                {
                  id: "sla-compliance",
                  name: "SLA Compliance Rate",
                  metric: "sla.compliance_percent",
                  condition: "less_than",
                  threshold: 99,
                  severity: "critical",
                  enabled: true,
                  notification_channels: ["email", "slack", "webhook"]
                }
              ]}
            />
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Reports & Analytics</h3>
              <div className="flex gap-2">
                <Button onClick={handleRecord} size="sm" className="bg-green-600 hover:bg-green-700">
                  ▶ Record
                </Button>
                <Button onClick={handleExport} size="sm" variant="outline">
                  📊 Export
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  📋 Performance Reports
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate comprehensive performance analysis reports with historical data and trends.
                </p>
                <Button variant="outline" className="w-full">
                  Generate Performance Report
                </Button>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  🎯 SLA Compliance Report
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed SLA compliance analysis with breach notifications and recommendations.
                </p>
                <Button variant="outline" className="w-full">
                  Generate SLA Report
                </Button>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  💻 System Health Report
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete system health overview including resource usage and process monitoring.
                </p>
                <Button variant="outline" className="w-full">
                  Generate Health Report
                </Button>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  🚨 Incident Analysis
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyze incidents, alerts, and system anomalies with root cause analysis.
                </p>
                <Button variant="outline" className="w-full">
                  Generate Incident Report
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }
)
MonitoringTabs.displayName = "MonitoringTabs"

export { MonitoringTabs, monitoringTabsVariants }
