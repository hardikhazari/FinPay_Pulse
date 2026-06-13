"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, UserMinus, LineChart, PieChart, Upload } from 'lucide-react';

export const routes = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'RFM Segments', path: '/segments', icon: PieChart },
  { name: 'Cohorts', path: '/cohorts', icon: Users },
  { name: 'Churn Risk', path: '/churn', icon: UserMinus },
  { name: 'Forecast', path: '/forecast', icon: LineChart },
];

export const adminRoutes = [
  { name: 'Data Upload', path: '/admin', icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-950 px-4 py-6">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="h-6 w-6 rounded bg-zinc-100 flex items-center justify-center">
          <div className="h-3 w-3 bg-zinc-950" />
        </div>
        <span className="font-semibold text-lg text-zinc-100 tracking-tight">FinPay Pulse</span>
      </div>

      <div className="space-y-1">
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === route.path 
                ? "bg-zinc-800 text-zinc-100" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 mb-2 px-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
        Admin
      </div>
      <div className="space-y-1">
        {adminRoutes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === route.path 
                ? "bg-zinc-800 text-zinc-100" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}
