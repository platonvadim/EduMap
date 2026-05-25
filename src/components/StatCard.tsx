import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  className?: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon, description, className, trend, trendUp }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && <div className="text-primary/80">{icon}</div>}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{value}</h2>
          {trend && (
            <span className={cn("text-xs font-medium", trendUp ? "text-emerald-500" : "text-amber-500")}>
              {trend}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
