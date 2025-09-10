import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Progress } from "@/shared/ui/progress"
import { Card, CardContent } from "@/shared/ui/card"

const processRAMBarVariants = cva(
  "font-mono text-sm transition-all duration-300",
  {
    variants: {
      usage: {
        low: "text-[hsl(var(--status-success))]",
        medium: "text-[hsl(var(--status-warning))]", 
        high: "text-[hsl(var(--status-error))]"
      },
      variant: {
        compact: "p-2",
        default: "p-3",
        detailed: "p-4"
      }
    },
    defaultVariants: {
      usage: "low",
      variant: "default"
    }
  }
)

const progressBarVariants = cva(
  "h-4 transition-all duration-500",
  {
    variants: {
      usage: {
        low: "[&>div]:bg-[hsl(var(--status-success))]",
        medium: "[&>div]:bg-[hsl(var(--status-warning))]",
        high: "[&>div]:bg-[hsl(var(--status-error))]"
      }
    },
    defaultVariants: {
      usage: "low"
    }
  }
)

export interface ProcessRAMBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof processRAMBarVariants> {
  processName: string
  ramUsageMB: number
  ramUsagePercent: number
  cpuUsagePercent?: number
  pid?: number
}

const ProcessRAMBar = React.forwardRef<HTMLDivElement, ProcessRAMBarProps>(
  ({ className, usage, variant, processName, ramUsageMB, ramUsagePercent, cpuUsagePercent, pid, ...props }, ref) => {
    const usageLevel = ramUsagePercent > 80 ? "high" : ramUsagePercent > 60 ? "medium" : "low"

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className={cn(processRAMBarVariants({ usage: usageLevel, variant, className }))} ref={ref} {...props}>
          <div className="flex items-center gap-3">
            {/* Process Name */}
            <div className="w-32 truncate">
              <span className="font-semibold">{processName}</span>
              {pid && <span className="text-xs text-muted-foreground ml-1">({pid})</span>}
            </div>
            
            {/* Progress Bar */}
            <div className="flex-1">
              <Progress 
                value={ramUsagePercent}
                className={cn(progressBarVariants({ usage: usageLevel }))}
              />
            </div>
            
            {/* Memory Usage */}
            <div className="w-20 text-right">
              <span className="font-bold">{ramUsageMB} MB</span>
            </div>
            
            {/* CPU Usage (Optional) */}
            {cpuUsagePercent !== undefined && (
              <div className="w-16 text-right text-xs text-muted-foreground">
                {cpuUsagePercent.toFixed(1)}% CPU
              </div>
            )}
            
            {/* Percentage */}
            <div className="w-12 text-right text-xs">
              {ramUsagePercent.toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
ProcessRAMBar.displayName = "ProcessRAMBar"

export { ProcessRAMBar, processRAMBarVariants, progressBarVariants }
