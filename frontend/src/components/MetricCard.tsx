import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="p-5 border-zinc-800 bg-zinc-900/50 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</h3>
        {Icon && <Icon className="h-4 w-4 text-zinc-600" />}
      </div>
      
      <div>
        <div className="text-2xl font-semibold tabular-nums text-zinc-100 tracking-tight">
          {value}
        </div>
        
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={`text-xs font-medium tabular-nums ${trend.direction === 'up' ? 'text-emerald-500' : trend.direction === 'down' ? 'text-rose-500' : 'text-zinc-500'}`}>
                {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-zinc-500">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
