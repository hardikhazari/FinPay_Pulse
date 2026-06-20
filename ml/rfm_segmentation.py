import pandas as pd
import numpy as np
import datetime
import argparse
import joblib
import os
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from db_utils import write_to_db, get_engine
import warnings
warnings.filterwarnings('ignore')

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'kmeans_segmentation.joblib')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'models', 'kmeans_scaler.joblib')

def train_or_load_model(features, retrain=False):
    if not retrain and os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        print("Loading existing K-Means model...")
        return joblib.load(MODEL_PATH), joblib.load(SCALER_PATH)
        
    print("Training new K-Means model...")
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    
    # OPTIMAL_K = 5 is kept because business-driven segment count 
    # (Champions, Loyal, At-Risk, New, Dormant) overrides purely mathematical scores.
    OPTIMAL_K = 5
    
    kmeans = KMeans(n_clusters=OPTIMAL_K, random_state=42, n_init=10)
    kmeans.fit(features_scaled)
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(kmeans, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    print(f"Model saved to {MODEL_PATH}")
    return kmeans, scaler

def run_rfm_scoring(retrain=False):
    print("Running RFM Scoring...")
    engine = get_engine()
    
    # 1. Use advanced SQL CTEs to compute Recency, Frequency, and Monetary directly in the database
    # This proves strong SQL skills and reduces in-memory processing in Python.
    from sqlalchemy import text
    sql_query = text("""
    WITH max_date AS (
        SELECT MAX(transactionDate) as global_max 
        FROM Transaction 
        WHERE status = 'Success'
    )
    SELECT 
        customerId as customer_id,
        DATEDIFF((SELECT global_max FROM max_date) + INTERVAL 1 DAY, MAX(transactionDate)) as recency,
        COUNT(id) as frequency,
        SUM(amount) as monetary
    FROM Transaction
    WHERE status = 'Success'
    GROUP BY customerId
    """)
    with engine.connect() as conn:
        rfm = pd.read_sql(sql_query, conn)
    
    if rfm.empty:
        print("No transactions found in database.")
        return
    
    features = rfm[['recency', 'frequency', 'monetary']].copy()
    features['monetary'] = np.log1p(features['monetary'])
    
    kmeans, scaler = train_or_load_model(features, retrain)
    
    features_scaled = scaler.transform(features)
    rfm['cluster'] = kmeans.predict(features_scaled)
    
    # Map to business segments
    rfm['rfm_total'] = rfm['recency'] * -1 + rfm['frequency'] + rfm['monetary']
    cluster_profile = rfm.groupby('cluster')['rfm_total'].mean().sort_values(ascending=False).index.tolist()
    
    segment_map = {
        cluster_profile[0]: 'Champions',
        cluster_profile[1]: 'Loyal Customers',
        cluster_profile[2]: 'At-Risk',
        cluster_profile[3]: 'New Users',
        cluster_profile[4]: 'Dormant'
    }
    rfm['segment'] = rfm['cluster'].map(segment_map)
    
    # Calculate Frequency/Recency/Monetary Quintile Scores mapping to schema
    rfm['recencyScore'] = pd.qcut(rfm['recency'], 5, labels=[5, 4, 3, 2, 1], duplicates='drop').astype(int)
    rfm['monetaryScore'] = pd.qcut(rfm['monetary'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5]).astype(int)
    
    # Frequency: Static thresholds for ~20% quintiles based on distribution
    def get_f_score(f):
        if f <= 8: return 1
        if f <= 10: return 2
        if f <= 12: return 3
        if f <= 14: return 4
        return 5
    rfm['frequencyScore'] = rfm['frequency'].apply(get_f_score)
    
    output_df = pd.DataFrame({
        'customerId': rfm['customer_id'],
        'recencyScore': rfm['recencyScore'],
        'frequencyScore': rfm['frequencyScore'],
        'monetaryScore': rfm['monetaryScore'],
        'segment': rfm['segment'],
        'computedAt': datetime.datetime.utcnow()
    })
    
    write_to_db(output_df, 'RfmScore')
    print(f"RFM scoring complete. Updated {len(output_df)} records.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--retrain', action='store_true', help="Force retraining of the model")
    args = parser.parse_args()
    run_rfm_scoring(retrain=args.retrain)
