import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "primary" | "accent";
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl p-6 transition-all hover:shadow-lg",
      variant === "default" && "bg-card border border-border",
      variant === "primary" && "bg-primary text-primary-foreground",
      variant === "accent" && "bg-accent text-accent-foreground"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === "default" && "text-muted-foreground",
            variant === "primary" && "text-primary-foreground/80",
            variant === "accent" && "text-accent-foreground/80"
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-sm",
              variant === "default" && "text-muted-foreground",
              variant === "primary" && "text-primary-foreground/70",
              variant === "accent" && "text-accent-foreground/70"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={cn(
              "text-sm flex items-center gap-1",
              trend.value >= 0 ? "text-success" : "text-destructive"
            )}>
              <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              <span className={cn(
                variant === "default" && "text-muted-foreground",
                variant === "primary" && "text-primary-foreground/60",
                variant === "accent" && "text-accent-foreground/60"
              )}>
                {trend.label}
              </span>
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-lg",
          variant === "default" && "bg-primary/10",
          variant === "primary" && "bg-primary-foreground/20",
          variant === "accent" && "bg-accent-foreground/20"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            variant === "default" && "text-primary",
            variant === "primary" && "text-primary-foreground",
            variant === "accent" && "text-accent-foreground"
          )} />
        </div>
      </div>
    </div>
  );
}
