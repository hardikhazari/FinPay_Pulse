"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes, adminRoutes } from "./Sidebar";

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-zinc-950 border-r-zinc-800 p-0 pt-10">
            <div className="flex flex-col px-4">
              <div className="space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === route.path 
                        ? "bg-zinc-800 text-zinc-100" 
                        : "text-zinc-400 hover:text-zinc-200"
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
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.name}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <span className="ml-4 font-semibold text-zinc-100 tracking-tight">FinPay Pulse</span>
      </div>
      
      <div className="hidden md:block">
         {/* Desktop placeholder if needed, e.g. Breadcrumbs */}
      </div>

      <div className="flex items-center gap-4">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 rounded-md"
            }
          }}
        />
      </div>
    </header>
  );
}
