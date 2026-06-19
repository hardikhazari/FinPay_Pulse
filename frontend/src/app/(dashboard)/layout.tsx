import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

/**
 * Dashboard layout — wraps all authenticated analytics pages
 * with the persistent sidebar navigation and top bar.
 *
 * This is a Next.js "Route Group" layout, so the (dashboard)
 * folder name does NOT appear in the URL. Routes inside here
 * are accessed at /dashboard, /segments, /churn, etc.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden flex">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
