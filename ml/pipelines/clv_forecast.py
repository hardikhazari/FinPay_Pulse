import pandas as pd
import numpy as np
import datetime
from core.db_utils import write_to_db, get_engine
import warnings
warnings.filterwarnings('ignore')

def run_clv_forecast():
    print("Running CLV calculation...")
    engine = get_engine()
    
    # Read transactions directly from the database
    transactions = pd.read_sql("SELECT customerId AS customer_id, transactionDate AS transaction_date, amount FROM Transaction WHERE status = 'Success'", engine)
    
    if transactions.empty:
        print("No transactions found in database.")
        return
        
    transactions['transaction_date'] = pd.to_datetime(transactions['transaction_date'])
    
    clv_df = transactions.groupby('customer_id').agg(
        total_spent=('amount', 'sum'),
        min_date=('transaction_date', 'min'),
        max_date=('transaction_date', 'max')
    ).reset_index()
    
    clv_df['lifespan_days'] = (clv_df['max_date'] - clv_df['min_date']).dt.days
    
    # CLV Formula: (total_spent / (GREATEST(lifespan_days, 30) / 30.0)) * 12
    # Apply floor of 30 days to prevent inflation
    clv_df['lifespan_floor'] = np.maximum(clv_df['lifespan_days'], 30)
    clv_df['predictedClv'] = np.round((clv_df['total_spent'] / (clv_df['lifespan_floor'] / 30.0)) * 12, 2)
    
    output_df = pd.DataFrame({
        'customerId': clv_df['customer_id'],
        'predictedClv': clv_df['predictedClv'],
        'computedAt': datetime.datetime.utcnow()
    })
    
    write_to_db(output_df, 'Clv')
    print(f"CLV calculation complete. Updated {len(output_df)} records.")

if __name__ == "__main__":
    run_clv_forecast()
