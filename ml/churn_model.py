import pandas as pd
import numpy as np
import datetime
import argparse
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from db_utils import write_to_db, get_engine
import warnings
warnings.filterwarnings('ignore')

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'churn_model.joblib')

def train_or_load_model(retrain=False):
    engine = get_engine()
    
    if not retrain and os.path.exists(MODEL_PATH):
        print("Loading existing churn model...")
        return joblib.load(MODEL_PATH)
        
    print("Training new churn model...")
    transactions = pd.read_sql("SELECT customerId AS customer_id, transactionDate AS transaction_date, status, amount FROM Transaction", engine)
    transactions['transaction_date'] = pd.to_datetime(transactions['transaction_date'])
    
    if transactions.empty:
        raise ValueError("No transactions found in database.")
    
    max_date = transactions['transaction_date'].max()
    cutoff_date = max_date - pd.Timedelta(days=30)
    
    feature_tx = transactions[(transactions['transaction_date'] <= cutoff_date) & (transactions['status'] == 'Success')]
    target_tx = transactions[(transactions['transaction_date'] > cutoff_date) & (transactions['status'] == 'Success')]
    
    cust_features = feature_tx.groupby('customer_id').agg(
        frequency=('customer_id', 'count'),
        monetary=('amount', 'sum'),
        avg_amount=('amount', 'mean'),
        max_amount=('amount', 'max')
    ).reset_index()
    
    active_in_target = target_tx['customer_id'].unique()
    cust_features['is_churn'] = (~cust_features['customer_id'].isin(active_in_target)).astype(int)
    
    X = cust_features[['frequency', 'monetary', 'avg_amount', 'max_amount']]
    y = cust_features['is_churn']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    log_reg = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', LogisticRegression(class_weight='balanced', random_state=42))
    ])
    
    log_reg.fit(X_train, y_train)
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(log_reg, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    
    return log_reg

def run_churn_scoring(retrain=False):
    print("Running Churn Scoring...")
    model = train_or_load_model(retrain)
    
    engine = get_engine()
    # To score everyone, we rebuild features up to TODAY (or the latest data available)
    transactions = pd.read_sql("SELECT customerId AS customer_id, amount FROM Transaction WHERE status = 'Success'", engine)
    if transactions.empty:
        return
        
    cust_features = transactions.groupby('customer_id').agg(
        frequency=('customer_id', 'count'),
        monetary=('amount', 'sum'),
        avg_amount=('amount', 'mean'),
        max_amount=('amount', 'max')
    ).reset_index()
    
    X = cust_features[['frequency', 'monetary', 'avg_amount', 'max_amount']]
    probabilities = model.predict_proba(X)[:, 1]
    
    def get_risk_tier(prob):
        if prob < 0.45: return 'Low'
        if prob <= 0.505: return 'Medium'
        return 'High'
        
    output_df = pd.DataFrame({
        'customerId': cust_features['customer_id'],
        'churnProbability': np.round(probabilities, 4),
        'riskTier': [get_risk_tier(p) for p in probabilities],
        'computedAt': datetime.datetime.utcnow()
    })
    
    write_to_db(output_df, 'ChurnScore')
    print(f"Churn scoring complete. Updated {len(output_df)} records.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--retrain', action='store_true', help="Force retraining of the model")
    args = parser.parse_args()
    run_churn_scoring(retrain=args.retrain)
