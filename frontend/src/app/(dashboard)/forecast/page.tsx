import { fetchApi } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ForecastChart } from "./ForecastChart";
import { Forecast } from "@/types/api";

export default async function ForecastPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  let forecastData: Forecast[] = [];
  let errorMsg = null;

  try {
    const res = await fetchApi('/api/forecast?limit=24'); // Get up to 24 months
    forecastData = res.data;
  } catch (err: unknown) {
    errorMsg = (err as Error).message || "Failed to load Forecast data.";
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">Revenue Forecasting</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Holt-Winters time-series projection for upcoming months based on historical transaction volume.
        </p>
      </div>

      {errorMsg ? (
        <div className="p-4 rounded-md bg-rose-950/20 border border-rose-900/50 text-rose-500 text-sm">
          {errorMsg}
        </div>
      ) : (
        <div className="space-y-6">
          <ForecastChart data={forecastData} />

          <div className="border border-zinc-800 bg-zinc-900/50 rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 sticky left-0 bg-zinc-900 border-r border-zinc-800 z-10">Month</th>
                  <th className="px-4 py-3 text-right">Predicted Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {forecastData.map((row: Forecast) => (
                  <tr key={row.month} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-300 sticky left-0 bg-zinc-900 border-r border-zinc-800 z-10">
                      {row.month}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-400 font-medium">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(row.predictedRevenue))}
                    </td>
                  </tr>
                ))}
                {forecastData.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-zinc-500 text-sm">
                      No forecast data available. Run the ML scoring pipeline first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
