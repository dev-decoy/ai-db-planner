import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "destructive";
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  subtitle, 
  icon, 
  trend,
  variant = "default" 
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-gradient-to-br from-success/5 to-success/10";
      case "warning":
        return "border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10";
      case "destructive":
        return "border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10";
      default:
        return "border-card-border bg-gradient-card";
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    return trend.value > 0 ? "text-success" : trend.value < 0 ? "text-destructive" : "text-muted-foreground";
  };

  return (
    <Card className={cn(
      "p-6 shadow-card transition-all duration-300 hover:shadow-glow hover:scale-[1.02]",
      getVariantStyles()
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1">
              <span className={cn("text-xs font-medium", getTrendColor())}>
                {trend.value > 0 ? "↗" : trend.value < 0 ? "↘" : "→"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}