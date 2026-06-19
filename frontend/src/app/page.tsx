import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  PieChart, Users, LineChart, ShieldAlert, Database, ArrowRight,
} from "lucide-react";

/* ── Feature cards shown on the landing page ───────────────────────── */

const features = [
  {
    icon: PieChart,
    title: "RFM Segmentation",
    desc: "K-Means clustering on Recency, Frequency, and Monetary scores to identify your Champions, Loyal users, and Dormant accounts.",
  },
  {
    icon: ShieldAlert,
    title: "Churn Prediction",
    desc: "Logistic Regression model trained on historical behaviour flags high-risk customers before they leave.",
  },
  {
    icon: LineChart,
    title: "Revenue Forecasting",
    desc: "Holt-Winters exponential smoothing generates 6-month revenue projections from your transaction history.",
  },
  {
    icon: Users,
    title: "Cohort Retention",
    desc: "Month-over-month retention heatmaps grouped by acquisition cohort — see exactly where users drop off.",
  },
  {
    icon: Database,
    title: "One-Click Data Upload",
    desc: "Upload a raw CSV and the engine validates, deduplicates, and bulk-inserts hundreds of thousands of rows in seconds.",
  },
];

/* ── Landing page ──────────────────────────────────────────────────── */

export default async function LandingPage() {
  /* If the visitor is already signed in, link them straight to the dashboard */
  const { userId } = auth();
  const ctaHref = userId ? "/dashboard" : "/sign-in";
  const ctaLabel = userId ? "Go to Dashboard" : "Sign In";

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800/60 backdrop-blur-sm bg-zinc-950/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-zinc-100 flex items-center justify-center">
              <div className="h-3.5 w-3.5 bg-zinc-950" />
            </div>
            <span className="font-semibold text-lg tracking-tight">FinPay Pulse</span>
          </div>

          <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#about" className="hover:text-zinc-100 transition-colors">About</a>
          </nav>

          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white transition-colors"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-4 py-1.5 text-xs text-zinc-400 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          ML Pipeline Active
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
          Know Your Customers
          <br />
          <span className="bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
            Before They Leave
          </span>
        </h1>

        <p className="mt-6 text-zinc-400 text-lg max-w-xl leading-relaxed">
          FinPay Pulse combines real-time transaction analytics with machine-learning models
          to surface churn risk, predict revenue, and segment your customer base — all from a single CSV upload.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            See What It Does
          </a>
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-center mb-12">
          What Powers the Dashboard
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
                <f.icon className="h-5 w-5 text-zinc-300" />
              </div>
              <h3 className="text-base font-medium text-zinc-100 mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About section ──────────────────────────────────────────── */}
      <section id="about" className="border-t border-zinc-800/60 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">About FinPay Pulse</h2>
          <p className="text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            FinPay Pulse was built as a full-stack data analytics capstone that bridges the gap
            between raw fintech transaction data and actionable business intelligence.
            The project combines a <strong className="text-zinc-200">Next.js</strong> frontend,
            an <strong className="text-zinc-200">Express + Prisma</strong> REST API, and a
            <strong className="text-zinc-200"> Python ML pipeline</strong> (scikit-learn, statsmodels)
            backed by a <strong className="text-zinc-200">MySQL</strong> database — all deployed
            on <strong className="text-zinc-200">Railway</strong> for production-grade reliability.
          </p>
          <p className="text-zinc-500 text-sm mt-6">
            Designed and developed by Hardik Hazari.
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/40 py-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} FinPay Pulse — All rights reserved.
      </footer>
    </div>
  );
}
