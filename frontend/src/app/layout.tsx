import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinPay Pulse | Analytics",
  description: "High-density fintech analytics dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-zinc-950 text-zinc-50 antialiased h-screen overflow-hidden flex`}>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-950">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
