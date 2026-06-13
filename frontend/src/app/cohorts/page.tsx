import { fetchApi } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CohortHeatmap } from "./CohortHeatmap";

export default async function CohortsPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  let cohortData = [];
  let errorMsg = null;

  try {
    const res = await fetchApi('/api/cohort?limit=10000');
    cohortData = res.data;
  } catch (err: any) {
    errorMsg = err.message || "Failed to load Cohort data.";
  }

  // Pre-process aggregated data into a matrix
  const matrix: Record<string, Record<string, { total: number, retained: number }>> = {};
  
  cohortData.forEach((row: any) => {
    if (!matrix[row.cohortMonth]) {
      matrix[row.cohortMonth] = {};
    }
    matrix[row.cohortMonth][row.activeMonth] = { total: row.total, retained: row.retained };
  });

  // Calculate percentages
  const heatmapData: any[] = [];
  const allActiveMonths = new Set<string>();

  Object.keys(matrix).sort().forEach(cohortMonth => {
    const rowObj: any = { cohortMonth };
    
    // Sort active months to find Month 0, 1, 2... relative to cohort
    const sortedActive = Object.keys(matrix[cohortMonth]).sort();
    
    sortedActive.forEach((activeMonth, idx) => {
      const monthLabel = `M${idx}`;
      allActiveMonths.add(monthLabel);
      
      const stats = matrix[cohortMonth][activeMonth];
      // M0 is always 100% technically, but we use the data
      const percent = stats.total > 0 ? (stats.retained / stats.total) * 100 : 0;
      rowObj[monthLabel] = percent;
    });
    
    heatmapData.push(rowObj);
  });

  const columns = Array.from(allActiveMonths).sort((a, b) => {
    return parseInt(a.replace('M', '')) - parseInt(b.replace('M', ''));
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">Cohort Retention</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Month-over-month user retention grouped by acquisition cohort.
        </p>
      </div>

      {errorMsg ? (
        <div className="p-4 rounded-md bg-rose-950/20 border border-rose-900/50 text-rose-500 text-sm">
          {errorMsg}
        </div>
      ) : (
        <CohortHeatmap data={heatmapData} columns={columns} />
      )}
    </div>
  );
}
