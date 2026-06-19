import { fetchApi } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ChurnCharts } from "./ChurnCharts";
import { ChurnScore } from "@/types/api";

export default async function ChurnPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  let churnData: ChurnScore[] = [];
  let distribution = { Low: 0, Medium: 0, High: 0 };
  let errorMsg = null;

  try {
    // Only fetch top 100 high risk customers for the priority table
    const res = await fetchApi('/api/churn?limit=100&riskTier=High');
    churnData = res.data;
    if (res.distribution) {
      distribution = res.distribution;
    }
  } catch (err: unknown) {
    errorMsg = (err as Error).message || "Failed to load Churn data.";
  }

  const chartData = [
    { name: 'Low Risk', value: distribution.Low, fill: '#10b981' }, // emerald-500
    { name: 'Medium Risk', value: distribution.Medium, fill: '#f59e0b' }, // amber-500
    { name: 'High Risk', value: distribution.High, fill: '#f43f5e' }, // rose-500
  ];

  // Already filtered and sorted by API
  const highRiskCustomers = churnData;
  const totalCustomers = distribution.Low + distribution.Medium + distribution.High;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">Churn Risk Analysis</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Machine-learning derived probability of customer churn within the next 30 days.
        </p>
      </div>

      {errorMsg ? (
        <div className="p-4 rounded-md bg-rose-950/20 border border-rose-900/50 text-rose-500 text-sm">
          {errorMsg}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ChurnCharts data={chartData} total={totalCustomers} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-medium text-zinc-200">High Risk Customers Priority List</h3>
            
            <div className="border border-zinc-800 bg-zinc-900/50 rounded-lg overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky top-0 z-20">
                  <tr>
                    <th className="px-4 py-3 sticky left-0 bg-zinc-900 border-r border-zinc-800 z-30">Customer ID</th>
                    <th className="px-4 py-3">Risk Tier</th>
                    <th className="px-4 py-3 text-right">Probability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {highRiskCustomers.map((row: ChurnScore) => (
                    <tr key={row.customerId} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-300 sticky left-0 bg-zinc-900 border-r border-zinc-800 z-10">{row.customerId}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-rose-950/50 border border-rose-900/50 text-rose-500 rounded-md text-xs font-medium">
                          {row.riskTier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-rose-400">
                        {(row.churnProbability * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  {highRiskCustomers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-zinc-500 text-sm">
                        No high-risk customers identified.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
