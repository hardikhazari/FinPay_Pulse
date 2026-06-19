"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from "@/components/ui/card";

interface ChurnChartsProps {
  data: { name: string; value: number; fill: string }[];
  total: number;
}

export function ChurnCharts({ data, total }: ChurnChartsProps) {
  return (
    <Card className="p-6 border-zinc-800 bg-zinc-900/50 flex flex-col h-full">
      <div className="mb-2">
        <h3 className="text-sm font-medium text-zinc-200">Risk Distribution</h3>
        <p className="text-xs text-zinc-500 mt-1">Base: {total.toLocaleString()} users</p>
      </div>
      
      <div className="h-[300px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px' }}
              itemStyle={{ color: '#e4e4e7', fontSize: '12px' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [Number(value || 0).toLocaleString(), 'Users']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
