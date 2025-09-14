import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"

const tierLatencyVariants = cva(
  "transition-all duration-300 hover:shadow-lg",
  {
    variants: {
      status: {
        success: "border-[hsl(var(--status-success-border))] bg-[hsl(var(--status-success-bg))] hover:bg-[hsl(var(--status-success-bg))]",
        warning: "border-[hsl(var(--status-warning-border))] bg-[hsl(var(--status-warning-bg))] hover:bg-[hsl(var(--status-warning-bg))]",
        error: "border-[hsl(var(--status-error-border))] bg-[hsl(var(--status-error-bg))] hover:bg-[hsl(var(--status-error-bg))]"
      },
      tier: {
        tier1: "border-l-4 border-l-blue-500",
        tier2: "border-l-4 border-l-purple-500",
        tier3: "border-l-4 border-l-cyan-500"
      }
    },
    defaultVariants: {
      status: "success",
      tier: "tier1"
    }
  }
)

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        success: "bg-[hsl(var(--status-success-bg))] text-[hsl(var(--status-success))]",
        warning: "bg-[hsl(var(--status-warning-bg))] text-[hsl(var(--status-warning))]",
        error: "bg-[hsl(var(--status-error-bg))] text-[hsl(var(--status-error))]"
      }
    },
    defaultVariants: {
      status: "success"
    }
  }
)

export interface TierLatencyCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tierLatencyVariants> {
  tierName: string
  currentLatency: number
  targetLatency: number
  throughput?: number
  successRate?: number
  icon: string
}

const TierLatencyCard = React.forwardRef<HTMLDivElement, TierLatencyCardProps>(
  ({ className, status, tier, tierName, currentLatency, targetLatency, throughput, successRate, icon, ...props }, ref) => {
    const statusText = currentLatency <= targetLatency ? "SUCCESS" : 
                      currentLatency <= targetLatency * 2 ? "WARNING" : "ERROR"
    
    const actualStatus = currentLatency <= targetLatency ? "success" :
                        currentLatency <= targetLatency * 2 ? "warning" : "error"

    return (
      <Card
        className={cn(tierLatencyVariants({ status: actualStatus, tier, className }))}
        ref={ref}
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            {tierName}
          </CardTitle>
          <Badge className={statusBadgeVariants({ status: actualStatus })}>
            {statusText}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current</span>
              <span className="font-bold text-lg">
                {currentLatency}{tier === "tier3" ? "s" : "ms"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Target</span>
              <span className="text-sm">
                &lt;{targetLatency}{tier === "tier3" ? "s" : "ms"}
              </span>
            </div>
            
            {throughput && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Throughput</span>
                <span className="text-sm font-medium">{throughput}/sec</span>
              </div>
            )}
            
            {successRate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="text-sm font-medium">{successRate.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)
TierLatencyCard.displayName = "TierLatencyCard"

export { TierLatencyCard, tierLatencyVariants, statusBadgeVariants }
