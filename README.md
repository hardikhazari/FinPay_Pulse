# FinPay Pulse — ML-Powered Fintech Analytics Dashboard

A full-stack analytics platform that transforms raw transaction data into actionable business intelligence through machine learning. Upload a CSV, and the system automatically segments customers, predicts churn, forecasts revenue, and generates retention cohorts.

**Live Demo:** [https://zonal-acceptance-production-2fc4.up.railway.app](https://zonal-acceptance-production-2fc4.up.railway.app)

---

## Table of Contents

- [Screenshots](#screenshots)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [ML Pipeline](#ml-pipeline)
- [API Reference](#api-reference)
- [Deployment](#deployment)

---

## Screenshots

<div align="center">
  <img src="Photos/1.png" width="800" alt="Dashboard Overview"/>
  <br/>
  <img src="Photos/2.png" width="800" alt="Segmentation"/>
  <br/>
  <img src="Photos/2a.png" width="800" alt="Segmentation 2"/>
  <br/>
  <img src="Photos/3.png" width="800" alt="Churn Analysis"/>
  <br/>
  <img src="Photos/4.png" width="800" alt="Forecast"/>
  <br/>
  <img src="Photos/5.png" width="800" alt="Cohorts"/>
  <br/>
  <img src="Photos/6.png" width="800" alt="SQL Insights"/>
  <br/>
  <img src="Photos/7.png" width="800" alt="Data Upload"/>
</div>

---

## Architecture Overview

```
┌─────────────────┐      HTTPS/JSON       ┌──────────────────┐
│   Next.js App   │ ◄──────────────────► │  Express REST API │
│   (Frontend)    │    Clerk JWT Auth      │    (Backend)      │
│   Port 3000     │                        │    Port 8080      │
└────────┬────────┘                        └────────┬─────────┘
         │                                          │
         │ Clerk SSO                    Prisma ORM  │
         ▼                                          ▼
┌─────────────────┐                        ┌──────────────────┐
│  Clerk Auth     │                        │   MySQL (Railway) │
│  (Identity)     │                        │   PlanetScale-    │
└─────────────────┘                        │   compatible      │
                                           └────────┬─────────┘
                                                    │
                                           ┌────────┴─────────┐
                                           │  Python ML Engine │
                                           │  (Offline Batch)  │
                                           └──────────────────┘
```

The frontend is a server-rendered Next.js application that fetches analytics data from the Express API. Authentication flows through Clerk on both sides — the frontend uses Clerk's Next.js SDK, and the backend validates JWTs via `@clerk/clerk-sdk-node`. The Python ML pipeline runs as an offline batch job that reads from and writes to the same MySQL database.

---

## Tech Stack

| Layer           | Technology                                              |
| --------------- | ------------------------------------------------------- |
| **Frontend**    | Next.js 14 (App Router), React 18, Tailwind CSS, Recharts |
| **Backend**     | Express 5, Prisma ORM, Zod validation                   |
| **Auth**        | Clerk (SSO, JWT-based API auth)                          |
| **Database**    | MySQL 8 (Railway-hosted)                                 |
| **ML Engine**   | Python 3.11 — scikit-learn, statsmodels, pandas          |
| **Deployment**  | Railway (auto-deploy from GitHub)                        |
| **UI Library**  | shadcn/ui, Lucide icons                                  |

---

## Features

### 1. RFM Customer Segmentation
Customers are scored on **Recency** (days since last purchase), **Frequency** (total transactions), and **Monetary** value (total spend). A K-Means clustering model groups them into five business-relevant segments:

- **Champions** — High frequency, high spend, recent activity
- **Loyal Customers** — Consistent repeat buyers
- **At-Risk** — Previously active, now showing signs of disengagement
- **New Users** — Recent signups with limited history
- **Dormant** — Inactive for extended periods

### 2. Churn Prediction
A Logistic Regression classifier trained on customer transaction features predicts the probability of churn within the next 30 days. Customers are bucketed into Low, Medium, and High risk tiers. The model uses class-weight balancing to handle the natural skew toward non-churned users.

### 3. Revenue Forecasting
Holt-Winters Exponential Smoothing with additive trend and seasonal components generates 6-month revenue projections. The model captures monthly seasonality patterns in transaction volume to provide forward-looking financial estimates.

### 4. Customer Lifetime Value (CLV)
A simplified CLV formula normalises each customer's total spend by their active lifespan (floored at 30 days to avoid division spikes), then annualises the result to project 12-month value.

### 5. Cohort Retention Analysis
Users are grouped by the month of their first transaction. A heatmap shows what percentage of each cohort remains active in subsequent months, making it easy to spot retention cliffs.

### 6. CSV Data Upload
Admin users can upload raw CSV datasets through the browser. The backend uses multer's memory storage (no temp files) and Zod validation to parse, validate, and bulk-insert up to 120,000+ rows in batches of 500.

---

## Project Structure

```
FinPay_Pulse/
├── frontend/                 # Next.js 14 application
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Public landing page
│       │   ├── (dashboard)/          # Route group (authenticated)
│       │   │   ├── layout.tsx        # Sidebar + Topbar wrapper
│       │   │   ├── dashboard/        # Overview metrics
│       │   │   ├── segments/         # RFM segmentation charts
│       │   │   ├── cohorts/          # Retention heatmap
│       │   │   ├── churn/            # Churn risk analysis
│       │   │   ├── forecast/         # Revenue forecast charts
│       │   │   └── admin/            # CSV upload interface
│       │   ├── sign-in/              # Clerk sign-in page
│       │   └── sign-up/              # Clerk sign-up page
│       ├── components/               # Reusable UI components
│       ├── lib/                      # API helpers, utilities
│       ├── types/                    # TypeScript interfaces
│       └── middleware.ts             # Clerk auth middleware
│
├── backend/                  # Express REST API
│   └── src/
│       ├── index.ts                  # Server entrypoint
│       ├── controllers/              # Route handlers
│       │   ├── rfm.controller.ts
│       │   ├── churn.controller.ts
│       │   ├── clv.controller.ts
│       │   ├── forecast.controller.ts
│       │   ├── cohort.controller.ts
│       │   └── upload.controller.ts
│       ├── routes/                   # Express route definitions
│       ├── middleware/               # Auth + error handling
│       └── lib/                      # Prisma client singleton
│   └── prisma/
│       └── schema.prisma             # Database schema
│
├── ml/                       # Python ML scoring pipeline
│   ├── run_scoring.py                # Orchestrator script
│   ├── core/                         # Infrastructure & Utils
│   │   └── db_utils.py               # SQLAlchemy DB helpers
│   ├── pipelines/                    # ML Job Scripts
│   │   ├── rfm_segmentation.py       # K-Means clustering
│   │   ├── churn_model.py            # Logistic Regression
│   │   ├── clv_forecast.py           # Customer lifetime value
│   │   ├── revenue_forecast.py       # Holt-Winters forecasting
│   │   ├── cohort_scoring.py         # Cohort retention matrix
│   │   ├── transaction_failure_model.py
│   │   └── models/                   # Serialised model files (.joblib)
│
├── sql/                      # Standalone SQL analysis queries
├── data/                     # Sample CSV datasets
└── notebooks/                # Jupyter exploration notebooks
```

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **MySQL** 8 (local or cloud)
- **Clerk account** for authentication keys

### 1. Clone the repository
```bash
git clone https://github.com/hardikhazari/FinPay_Pulse.git
cd FinPay_Pulse
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env    # fill in DATABASE_URL, CLERK_SECRET_KEY
npx prisma generate     # generate the Prisma client
npx prisma db push      # sync schema to MySQL
npm run dev              # starts on http://localhost:3001
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env    # fill in NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
npm run dev              # starts on http://localhost:3000
```

### 4. ML pipeline
```bash
cd ml
pip install -r requirements.txt   # pandas, scikit-learn, statsmodels, etc.
cp .env.example .env              # set DATABASE_URL
python run_scoring.py --retrain   # runs all models and writes results to DB
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable           | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `DATABASE_URL`     | MySQL connection string (e.g. `mysql://user:pass@host:port/db`) |
| `CLERK_SECRET_KEY` | Clerk secret key (`sk_test_...` or `sk_live_...`)    |
| `FRONTEND_URL`     | Full URL of the frontend (for CORS whitelist)        |
| `ADMIN_CLERK_ID`   | *(Optional)* Clerk user ID to auto-promote to admin  |
| `PORT`             | *(Optional)* Server port, defaults to `3001`         |

### Frontend (`frontend/.env.local`)
| Variable                           | Description                                      |
| ---------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`              | Backend URL (e.g. `https://your-backend.railway.app`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`| Clerk publishable key (`pk_test_...`)            |
| `CLERK_SECRET_KEY`                 | Clerk secret key (server-side middleware)         |

### ML (`ml/.env`)
| Variable       | Description                          |
| -------------- | ------------------------------------ |
| `DATABASE_URL` | Same MySQL connection string         |

---

## Database Schema

The Prisma schema defines seven models:

- **User** — Clerk user mapping with role (`admin` / `viewer`)
- **Customer** — Unique customer records (PK from CSV `customer_id`)
- **Transaction** — Individual payment records with amount, date, status
- **RfmScore** — Per-customer R/F/M quintile scores + segment label
- **ChurnScore** — Per-customer churn probability + risk tier
- **Clv** — Predicted 12-month customer lifetime value
- **Forecast** — Monthly revenue predictions (month PK)
- **Cohort** — Retention matrix rows (cohort month × active month)

---

## ML Pipeline

Run the full pipeline with:
```bash
cd ml
python run_scoring.py --retrain
python pipelines/cohort_scoring.py
```

| Model               | Algorithm                     | Input                       | Output Table |
| -------------------- | ----------------------------- | --------------------------- | ------------ |
| RFM Segmentation     | K-Means (k=5)                 | Recency, Frequency, Monetary | `RfmScore`   |
| Churn Prediction     | Logistic Regression (balanced) | Frequency, Monetary, Avg/Max | `ChurnScore` |
| CLV Forecast         | Heuristic (annualised spend)  | Total spend, lifespan       | `Clv`        |
| Revenue Forecast     | Holt-Winters (additive)       | Monthly revenue time series | `Forecast`   |
| Cohort Retention     | SQL aggregation               | Transaction dates           | `Cohort`     |

Models are serialised to `.joblib` files in `ml/models/` and reused on subsequent runs unless `--retrain` is passed.

---

## API Reference

All endpoints require a valid Clerk JWT in the `Authorization: Bearer <token>` header.

| Method | Endpoint                    | Description                      | Auth       |
| ------ | --------------------------- | -------------------------------- | ---------- |
| GET    | `/health`                   | Server + DB health check         | None       |
| GET    | `/api/rfm?limit=N&offset=M` | RFM scores with pagination      | Required   |
| GET    | `/api/churn?riskTier=High`  | Churn scores, filterable by tier | Required   |
| GET    | `/api/clv?limit=N`          | CLV predictions, sorted by value | Required   |
| GET    | `/api/forecast?limit=N`     | Revenue forecast months          | Required   |
| GET    | `/api/cohort?limit=N`       | Cohort retention aggregations    | Required   |
| POST   | `/api/upload/transactions`  | CSV file upload (multipart)      | Admin only |

---

## Deployment

Both frontend and backend are deployed on **Railway** with auto-deploy from the `master` branch.

### Railway Configuration
- **Frontend Service:** Watches `frontend/` — runs `npm run build && npm start`
- **Backend Service:** Watches `backend/` — runs `npm run build && npm start`
- **MySQL Add-on:** Provisioned through Railway's database plugin

### Important Railway Variables
Make sure to set all [environment variables](#environment-variables) in the Railway dashboard. Both `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` must include the `https://` prefix and have no trailing slash.

---

## Author

**Hardik Hazari & Nandini Gupta**

---

## License

This project is for educational and portfolio purposes.
