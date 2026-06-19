"use client";

import { Card } from "@/components/ui/card";
import { CohortMatrixRow } from "@/types/api";

interface CohortHeatmapProps {
  data: CohortMatrixRow[];
  columns: string[];
}

export function CohortHeatmap({ data, columns }: CohortHeatmapProps) {
  
  // Calculate dynamic opacity based on percentage for monochromatic look (emerald scale)
  const getBackgroundColor = (value: number | undefined) => {
    if (value === undefined) return "bg-transparent";
    // If value is 100%, pure emerald-500 (#10b981). Lower % approaches zinc-900.
    const opacity = Math.max(0.05, value / 100);
    return `rgba(16, 185, 129, ${opacity})`;
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="p-6 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-200">Retention Matrix (%)</h3>
      </div>
      
      {/* Strict horizontal scroll for the matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-zinc-900 sticky left-0 z-10 border-r border-zinc-800 border-b text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider min-w-[120px]">
                Cohort
              </th>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider min-w-[60px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.cohortMonth}>
                <td className="px-4 py-3 bg-zinc-900 sticky left-0 z-10 border-r border-zinc-800 font-medium text-zinc-300">
                  {row.cohortMonth}
                </td>
                {columns.map(col => {
                  const val = row[col] as number | undefined;
                  return (
                    <td 
                      key={col} 
                      className="px-2 py-2 text-center"
                    >
                      {val !== undefined ? (
                        <div 
                          className="h-10 w-full flex items-center justify-center rounded-sm font-semibold text-zinc-50 tabular-nums transition-colors"
                          style={{ backgroundColor: getBackgroundColor(val) }}
                        >
                          {Math.round(val)}%
                        </div>
                      ) : (
                        <div className="h-10 w-full" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
