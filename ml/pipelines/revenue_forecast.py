"""
FinPay Pulse - Revenue Forecasting Model

This module uses Holt-Winters Exponential Smoothing (with additive seasonality)
to predict aggregate monthly revenue for the upcoming 6 months. It isolates underlying
trends from seasonal transaction spikes.
"""

import pandas as pd
import numpy as np
import datetime
import argparse
import joblib
import os
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from core.db_utils import write_to_db, get_engine
import warnings
warnings.filterwarnings('ignore')

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'revenue_forecast_model.joblib')

def train_or_load_model(monthly_series, retrain=False):
    if not retrain and os.path.exists(MODEL_PATH):
        print("Loading existing Holt-Winters model...")
        return joblib.load(MODEL_PATH)
        
    print("Training new Holt-Winters model...")
    model = ExponentialSmoothing(monthly_series, trend='add', seasonal='add', seasonal_periods=12)
    fit_model = model.fit()
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(fit_model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    return fit_model

def run_revenue_forecast(retrain=False):
    print("Running Revenue Forecast...")
    engine = get_engine()
    
    transactions = pd.read_sql("SELECT transactionDate AS transaction_date, amount FROM Transaction WHERE status = 'Success'", engine)
    if transactions.empty:
        print("No transactions found in database.")
        return
        
    transactions['transaction_date'] = pd.to_datetime(transactions['transaction_date'])
    transactions.set_index('transaction_date', inplace=True)
    
    monthly_series = transactions['amount'].resample('ME').sum()
    
    # Require at least 2 years of data for a robust 12-month seasonal model
    if len(monthly_series) < 24:
        print(f"Warning: Only {len(monthly_series)} months of data available. Forecast might be unreliable.")
        
    model = train_or_load_model(monthly_series, retrain)
    
    forecast = model.forecast(6)
    
    output_df = pd.DataFrame({
        'month': forecast.index.strftime('%Y-%m'),
        'predictedRevenue': np.round(forecast.values, 2),
        'modelUsed': 'Holt-Winters Monthly',
        'computedAt': datetime.datetime.utcnow()
    })
    
    write_to_db(output_df, 'Forecast')
    print(f"Forecast scoring complete. Updated {len(output_df)} records.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--retrain', action='store_true', help="Force retraining of the model")
    args = parser.parse_args()
    run_revenue_forecast(retrain=args.retrain)
