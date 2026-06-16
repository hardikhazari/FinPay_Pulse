"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";

interface ForecastChartProps {
  data: { month: string; predictedRevenue: number | string; modelUsed: string; computedAt: string }[];
}

export function ForecastChart({ data }: ForecastChartProps) {
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0,
      notation: "compact"
    }).format(val);
  };

  return (
    <Card className="p-6 border-zinc-800 bg-zinc-900/50">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-zinc-200">Revenue Projection (USD)</h3>
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#52525b"
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              stroke="#52525b"
              tick={{ fill: '#71717a', fontSize: 12 }}
              tickFormatter={formatCurrency}
              width={60}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px' }}
              itemStyle={{ color: '#10b981', fontSize: '14px', fontWeight: '500' }}
              labelStyle={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}
              formatter={(value: number | string | Array<number | string> | undefined) => [
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0)),
                'Projected Revenue'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="predictedRevenue" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
