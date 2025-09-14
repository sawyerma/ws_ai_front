import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"

const alertsPanelVariants = cva(
  "space-y-4",
  {
    variants: {
      layout: {
        compact: "space-y-2",
        default: "space-y-4",
        spacious: "space-y-6"
      }
    },
    defaultVariants: {
      layout: "default"
    }
  }
)

const alertItemVariants = cva(
  "transition-all duration-300 hover:shadow-md",
  {
    variants: {
      severity: {
        critical: "border-[hsl(var(--status-error-border))] bg-[hsl(var(--status-error-bg))]",
        high: "border-[hsl(var(--status-warning-border))] bg-[hsl(var(--status-warning-bg))]",
        medium: "border-[hsl(var(--status-warning-border))] bg-[hsl(var(--status-warning-bg))]",
        low: "border-[hsl(var(--status-info-border))] bg-[hsl(var(--status-info-bg))]"
      },
      status: {
        active: "opacity-100",
        resolved: "opacity-60"
      }
    },
    defaultVariants: {
      severity: "medium",
      status: "active"
    }
  }
)

export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals'
  threshold: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  enabled: boolean
  notification_channels: string[]
}

export interface AlertItem {
  id: string
  rule: AlertRule
  currentValue: number
  triggeredAt: string
  resolvedAt?: string
  status: 'active' | 'resolved'
  description?: string
}

export interface AlertsPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertsPanelVariants> {
  alerts: AlertItem[]
  rules: AlertRule[]
  onResolveAlert?: (alertId: string) => void
  onConfigureRule?: (ruleId: string) => void
}

const AlertsPanel = React.forwardRef<HTMLDivElement, AlertsPanelProps>(
  ({ className, layout, alerts, rules, onResolveAlert, onConfigureRule, ...props }, ref) => {
    const activeAlerts = alerts.filter(alert => alert.status === 'active')
    const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved')
    
    const getSeverityIcon = (severity: string) => {
      switch (severity) {
        case 'critical': return <XCircle className="h-4 w-4" />
        case 'high': return <AlertTriangle className="h-4 w-4" />
        case 'medium': return <Clock className="h-4 w-4" />
        default: return <CheckCircle className="h-4 w-4" />
      }
    }
    
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'critical': return 'destructive'
        case 'high': return 'default'
        case 'medium': return 'secondary'
        default: return 'outline'
      }
    }

    return (
      <div className={cn(alertsPanelVariants({ layout, className }))} ref={ref} {...props}>
        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                🚨 Active Alerts ({activeAlerts.length})
              </span>
              <Badge variant={activeAlerts.length > 0 ? "destructive" : "secondary"}>
                {activeAlerts.length > 0 ? "ATTENTION REQUIRED" : "ALL CLEAR"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                No active alerts. System operating normally.
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <Alert key={alert.id} className={alertItemVariants({ 
                  severity: alert.rule.severity, 
                  status: alert.status 
                })}>
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        {getSeverityIcon(alert.rule.severity)}
                        {alert.rule.name}
                        <Badge variant={getSeverityColor(alert.rule.severity) as any}>
                          {alert.rule.severity.toUpperCase()}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        <div className="space-y-1">
                          <div>
                            Current: <strong>{alert.currentValue}</strong> | 
                            Threshold: <strong>{alert.rule.threshold}</strong>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                          </div>
                          {alert.description && (
                            <div className="text-xs">{alert.description}</div>
                          )}
                        </div>
                      </AlertDescription>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onResolveAlert?.(alert.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </CardContent>
        </Card>
        
        {/* Alert Rules Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📊 Alert Rules ({rules.length})</span>
              <Button size="sm" variant="outline">
                Add Rule
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {rule.metric} {rule.condition.replace('_', ' ')} {rule.threshold}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(rule.severity) as any}>
                      {rule.severity}
                    </Badge>
                    <Badge variant={rule.enabled ? "default" : "secondary"}>
                      {rule.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onConfigureRule?.(rule.id)}
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Resolved Alerts */}
        {resolvedAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📈 Recent Resolutions ({resolvedAlerts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {resolvedAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 border rounded text-sm opacity-60">
                    <span>{alert.rule.name}</span>
                    <span className="text-muted-foreground">
                      Resolved: {alert.resolvedAt && new Date(alert.resolvedAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }
)
AlertsPanel.displayName = "AlertsPanel"

export { AlertsPanel, alertsPanelVariants, alertItemVariants }
