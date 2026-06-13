# FinPay Pulse 🚀
### Customer Intelligence Platform for Digital Payments

An end-to-end analytics platform that solves the **silent churn problem** in digital payments — by segmenting customers behaviourally, predicting failures with Machine Learning, and displaying real-time insights on a custom Node.js dashboard.

> Digital payment platforms lose 30–40% of active users silently every quarter. This project builds the data infrastructure to identify who's slipping before it's too late.

---

## 🔧 Tech Stack

![Python](https://img.shields.io/badge/Python-3.10-3776AB?logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Web_App-339933?logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Machine_Learning-F7931E?logo=scikitlearn&logoColor=white)
![Statsmodels](https://img.shields.io/badge/Statsmodels-Forecasting-blue)
![HTML/CSS](https://img.shields.io/badge/Frontend-Glassmorphism-E34F26)

---

## 📊 Key Features & Findings

- **Machine Learning**: 
  - **Transaction Failure Model**: *(Disabled in production)* Originally a Random Forest predicting failure based on device. Intentionally disabled as the Prisma schema does not track device hardware.
  - **Logistic Regression**: Identifies the exact mathematical drivers of Customer Churn.
  - **Exponential Smoothing**: Holt-Winters time-series forecasting to predict the next 30 days of revenue.
- **Statistical Testing**: Two-Proportion Z-Test simulating an A/B test for a new checkout flow (proving statistical significance).
- **RFM Segmentation**: Using SQL NTILE functions to mathematically categorize users into Champions, At-Risk, and Dormant.
- **Interactive Dashboard**: A custom-built, responsive Node.js web application utilizing Chart.js to visualize the SQLite/MySQL data in real-time.

---

## 📁 Project Structure

```
FinPay_Pulse/
├── webapp/                         # Live Node.js Dashboard
│   ├── server.js                   # Express backend connecting to MySQL
│   ├── index.html                  # Landing / Login page
│   ├── dashboard.html              # Real-time transaction metrics
│   ├── analytics.html              # Core BI charts (Chart.js)
│   ├── more_analytics.html         # Advanced deep-dive analytics
│   ├── info.html                   # Educational RFM Guide
│   ├── app.js                      # Frontend logic and API calls
│   └── style.css                   # Glassmorphism UI design
├── sql/                            # SQL analytical layer
│   ├── 01_data_cleaning.sql        # Dedup, null handling, validation
│   ├── 02_rfm_scoring.sql          # RFM scoring with NTILE
│   ├── 03_cohort_analysis.sql      # Monthly cohort retention
│   ├── 04_daily_transaction_volume.sql
│   └── 09_customer_lifetime_value.sql
├── notebooks/                      # Data Science & Machine Learning
│   ├── eda_and_segmentation.ipynb  # EDA + K-Means Clustering
│   └── machine_learning_models.ipynb # Random Forest, A/B Testing, Forecasting
├── data/                           
│   └── plots/                      # 25+ generated Data Science Visualizations
└── README.md
```

---

## 🚀 Quick Start

### 1. Launch the Live Dashboard
Ensure you have Node.js and MySQL installed.
```bash
# Double click the batch file to start the server!
./run_webapp.bat
```
Navigate to `http://localhost:3050` in your browser.

### 2. Run the Machine Learning Pipeline
*(Note: The ML scoring pipeline is intentionally configured to run manually, rather than as a background cron job. See `ml/README.md` for full architecture decisions).*
```bash
cd ml
python run_scoring.py --retrain
```

---

## 🎯 Customer Segments

| Segment | Description | Action |
|---------|-------------|--------|
| 🏆 **Champions** | High recency, frequency, and monetary. Power users. | VIP rewards, beta access, referral ambassador |
| 💙 **Loyal** | Consistent, reliable engagement. Steady spenders. | Loyalty program, personalised cashback |
| ⚠️ **At-Risk** | Declining engagement. On the path to churn. | Win-back campaigns, push notifications |
| 🆕 **New Users** | Recently joined, limited history. High potential. | Onboarding incentives, first-txn rewards |
| 💤 **Dormant** | Inactive for 90+ days. Silent churn. | Low-cost reactivation or write-off |

---

## 📐 Data Architecture

```
Raw CSV Files → MySQL Database (finpay_pulse) 
    ↓
SQL Analytical Layer (9 scripts → cleaned tables + RFM scoring)
    ↓
Python K-Means Clustering (Customer Segments exported back to MySQL)
    ↓
Machine Learning Pipeline (Random Forest, Logistic Regression, Holt-Winters)
    ↓
Node.js Express Backend API
    ↓
Interactive Chart.js Web Dashboard
```

## 📸 Application Screenshots

<div align="center">
  <img src="Photos/Screenshot 2026-06-03 140925.png" width="800" />
  <br><br>
  <img src="Photos/Screenshot 2026-06-03 140917.png" width="800" />
  <br><br>
  <img src="Photos/Screenshot 2026-06-03 140717.png" width="800" />
  <br><br>
  <img src="Photos/Screenshot 2026-06-03 140756.png" width="800" />
  <br><br>
  <img src="Photos/Screenshot 2026-06-03 140746.png" width="800" />
  <br><br>
  <img src="Photos/Screenshot 2026-06-03 140727.png" width="800" />
  <br><br>
  <img src="Photos/Screenshot 2026-06-03 140822.png" width="800" />
  <br><br>
  <img src="Photos/Screenshot 2026-06-03 140833.png" width="800" />
</div>
