"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from "@/components/ui/card";

interface RfmChartProps {
  data: { name: string; value: number; fill: string }[];
}

export function RfmChart({ data }: RfmChartProps) {
  const segmentColors: Record<string, string> = {
    'Champions': '#10b981', // emerald-500
    'Loyal Customers': '#0ea5e9', // sky-500
    'New Users': '#a855f7', // purple-500
    'At-Risk': '#f59e0b', // amber-500
    'Dormant': '#f43f5e', // rose-500
  };

  // Group data for the legend
  const segments = Object.keys(segmentColors);
  
  return (
    <Card className="p-6 border-zinc-800 bg-zinc-900/50">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-zinc-200">Segment Distribution (Frequency vs Monetary)</h3>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              type="number" 
              dataKey="frequencyScore" 
              name="Frequency Score"
              stroke="#52525b"
              tick={{ fill: '#71717a', fontSize: 12 }}
              domain={[0, 5]}
            />
            <YAxis 
              type="number" 
              dataKey="monetaryScore" 
              name="Monetary Score"
              stroke="#52525b"
              tick={{ fill: '#71717a', fontSize: 12 }}
              domain={[0, 5]}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3', stroke: '#3f3f46' }}
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px' }}
              itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
              labelStyle={{ display: 'none' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }}
            />
            
            {segments.map(segment => (
              <Scatter 
                key={segment} 
                name={segment} 
                data={data.filter(d => d.segment === segment)} 
                fill={segmentColors[segment]}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
