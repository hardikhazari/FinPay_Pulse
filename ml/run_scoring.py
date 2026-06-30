import sys
import time
import datetime
import argparse
import os
from dotenv import load_dotenv
load_dotenv()
from pipelines.rfm_segmentation import run_rfm_scoring
from pipelines.churn_model import run_churn_scoring
from pipelines.clv_forecast import run_clv_forecast
from pipelines.revenue_forecast import run_revenue_forecast
from pipelines.transaction_failure_model import run_failure_model
import warnings
warnings.filterwarnings('ignore')

def main():
    parser = argparse.ArgumentParser(description="FinPay Pulse Batch ML Scoring")
    parser.add_argument('--retrain', action='store_true', help="Force retraining of all machine learning models")
    args = parser.parse_args()
    
    print(f"=== Starting FinPay Pulse Scoring Pipeline at {datetime.datetime.utcnow()} ===")
    
    steps = [
        ("RFM Scoring", run_rfm_scoring),
        ("Churn Scoring", run_churn_scoring), # Fully independent from RFM, uses 30-day target window
        ("CLV Forecast", run_clv_forecast),
        ("Revenue Forecast", run_revenue_forecast)
        # ("Transaction Failure Model", run_failure_model)
    ]
    
    overall_success = True
    
    for step_name, step_func in steps:
        print(f"\n--- Starting {step_name} ---")
        start_time = time.time()
        try:
            # Only models with retrain arguments get the arg
            if step_name == "CLV Forecast":
                step_func()
            else:
                step_func(retrain=args.retrain)
                
            elapsed = time.time() - start_time
            print(f"[OK] {step_name} completed in {elapsed:.2f} seconds.")
        except Exception as e:
            elapsed = time.time() - start_time
            print(f"[FAIL] {step_name} FAILED after {elapsed:.2f} seconds.")
            print(f"Error details: {str(e)}")
            overall_success = False
            # We continue to the next step even if one fails
            
    if overall_success:
        print(f"\n=== Pipeline completed SUCCESSFULLY at {datetime.datetime.utcnow()} ===")
    else:
        print(f"\n=== Pipeline completed with ERRORS at {datetime.datetime.utcnow()} ===")
        sys.exit(1)

if __name__ == "__main__":
    main()
