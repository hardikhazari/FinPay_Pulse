import pandas as pd
import numpy as np
import datetime
import argparse
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from db_utils import get_engine
import warnings
warnings.filterwarnings('ignore')

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'transaction_failure_model.joblib')

def train_or_load_model(retrain=False):
    if not retrain and os.path.exists(MODEL_PATH):
        print("Loading existing transaction failure model...")
        return joblib.load(MODEL_PATH)
        
    print("Training new transaction failure model...")
    engine = get_engine()
    
    # We load historical data for training
    transactions = pd.read_sql("SELECT * FROM transactions WHERE status IN ('Success', 'Failed')", engine)
    if transactions.empty:
        raise ValueError("No transactions found in database for training.")
        
    transactions['is_failed'] = (transactions['status'] == 'Failed').astype(int)
    transactions['hour'] = pd.to_timedelta(transactions['transaction_time']).dt.components['hours']
    
    features = ['amount', 'transaction_type', 'payment_method', 'device_used', 'hour']
    X = transactions[features]
    y = transactions['is_failed']
    
    numeric_features = ['amount', 'hour']
    categorical_features = ['transaction_type', 'payment_method', 'device_used']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(drop='first', handle_unknown='ignore'), categorical_features)
        ])
        
    rf_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight='balanced', n_jobs=-1))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    rf_pipeline.fit(X_train, y_train)
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(rf_pipeline, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    
    return rf_pipeline

def run_failure_model(retrain=False):
    # This model doesn't actively score database rows like the others in batch,
    # as it's meant for real-time transaction scoring in production (or API).
    # We just ensure it's trained and available.
    print("Ensuring Transaction Failure Model is trained...")
    train_or_load_model(retrain)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--retrain', action='store_true', help="Force retraining of the model")
    args = parser.parse_args()
    run_failure_model(retrain=args.retrain)
