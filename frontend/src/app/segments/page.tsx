import { fetchApi } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { RfmChart } from "./RfmChart";

export default async function SegmentsPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  let rfmData = [];
  let errorMsg = null;

  try {
    const res = await fetchApi('/api/rfm?limit=1000');
    rfmData = res.data;
  } catch (err: any) {
    errorMsg = err.message || "Failed to load RFM data.";
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">RFM Segmentation</h1>
        <p className="text-zinc-400 text-sm mt-1">
          K-Means clustering applied to Recency, Frequency, and Monetary scores.
        </p>
      </div>

      {errorMsg ? (
        <div className="p-4 rounded-md bg-rose-950/20 border border-rose-900/50 text-rose-500 text-sm">
          {errorMsg}
        </div>
      ) : (
        <div className="space-y-6">
          <RfmChart data={rfmData} />
          
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 sticky left-0 bg-zinc-900 border-r border-zinc-800 z-10">Customer ID</th>
                  <th className="px-4 py-3">Segment</th>
                  <th className="px-4 py-3 text-right">R Score</th>
                  <th className="px-4 py-3 text-right">F Score</th>
                  <th className="px-4 py-3 text-right">M Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {rfmData.map((row: any) => (
                  <tr key={row.customerId} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-300 sticky left-0 bg-zinc-900 border-r border-zinc-800 z-10">{row.customerId}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs font-medium text-zinc-300">
                        {row.segment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-400">{row.recencyScore}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-400">{row.frequencyScore}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-400">{row.monetaryScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
