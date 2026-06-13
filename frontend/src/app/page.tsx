import { fetchApi } from "@/lib/api";
import { MetricCard } from "@/components/MetricCard";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  let rfmData, churnData, forecastData;
  let errorMsg = null;

  try {
    // Parallel fetching
    const [rfmRes, churnRes, forecastRes] = await Promise.all([
      fetchApi('/api/rfm?limit=1'),
      fetchApi('/api/churn?limit=10000'),
      fetchApi('/api/forecast?limit=12')
    ]);
    
    rfmData = rfmRes.meta;
    churnData = churnRes.data;
    forecastData = forecastRes.data;
  } catch (err: any) {
    errorMsg = err.message || "Failed to load dashboard data. Ensure the Express backend is running.";
  }

  // Calculate high level metrics
  const totalCustomers = rfmData?.total || 0;
  const highRiskCustomers = churnData?.filter((c: any) => c.riskTier === 'High').length || 0;
  const highRiskPercent = totalCustomers > 0 ? ((highRiskCustomers / totalCustomers) * 100).toFixed(1) : "0.0";
  
  const currentMonthForecast = forecastData?.[0]?.predictedRevenue || 0;
  const formattedRevenue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(currentMonthForecast);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">Overview</h1>
      </div>

      {errorMsg ? (
        <div className="p-4 rounded-md bg-rose-950/20 border border-rose-900/50 text-rose-500 text-sm">
          {errorMsg}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard 
              title="Total Active Base" 
              value={totalCustomers.toLocaleString()} 
            />
            <MetricCard 
              title="High Risk Churn" 
              value={highRiskCustomers.toLocaleString()} 
              subtitle="of total customer base"
              trend={{ direction: 'down', value: `${highRiskPercent}%` }}
            />
            <MetricCard 
              title="Projected Next Month" 
              value={formattedRevenue}
              subtitle="Holt-Winters forecast"
            />
          </div>

          <div className="h-96 w-full border border-zinc-800 bg-zinc-900/50 rounded-lg flex items-center justify-center flex-col text-zinc-500">
            <p className="text-sm font-medium">Dashboard visual overview</p>
            <p className="text-xs">Navigate to specific tabs for deep-dives.</p>
          </div>
        </>
      )}
    </div>
  );
}
