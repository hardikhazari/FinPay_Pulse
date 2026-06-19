import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinPay Pulse | ML-Powered Fintech Analytics",
  description: "Real-time customer segmentation, churn prediction, and revenue forecasting for fintech platforms.",
};

/**
 * Root layout wraps the entire app in ClerkProvider for auth.
 * Individual route groups handle their own chrome (sidebar, topbar, etc.)
 * so this layout stays minimal.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-zinc-950 text-zinc-50 antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
