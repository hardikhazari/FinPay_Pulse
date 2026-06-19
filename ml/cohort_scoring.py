"""
cohort_scoring.py — Monthly Cohort Retention Generator

Groups every customer by their first transaction month (cohort),
then maps each subsequent active month to build a retention matrix
that the frontend renders as a heatmap.
"""

import pandas as pd
import datetime
import uuid
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import text
from db_utils import get_engine


def run_cohort_scoring():
    print("Running Cohort Scoring...")
    engine = get_engine()

    # Pull successful transactions — we only care about customer id and date
    query = (
        "SELECT customerId AS customer_id, "
        "       transactionDate AS transaction_date "
        "FROM Transaction "
        "WHERE status = 'Success'"
    )
    transactions = pd.read_sql(query, engine)

    if transactions.empty:
        print("No transactions found in database.")
        return

    transactions['transaction_date'] = pd.to_datetime(transactions['transaction_date'])
    transactions['activity_month'] = transactions['transaction_date'].dt.strftime('%Y-%m')

    # Each customer's first ever transaction month is their "cohort"
    cohorts = (
        transactions
        .groupby('customer_id')['activity_month']
        .min()
        .reset_index()
        .rename(columns={'activity_month': 'cohort_month'})
    )

    # Merge cohort month back onto every transaction row
    df = pd.merge(transactions, cohorts, on='customer_id')

    # Deduplicate: one row per (customer, cohort, active month)
    active_months = df[['customer_id', 'cohort_month', 'activity_month']].drop_duplicates()
    active_months['retained'] = True

    # Build the output dataframe that matches the Prisma Cohort schema
    output_df = pd.DataFrame({
        'id':          [str(uuid.uuid4()) for _ in range(len(active_months))],
        'customerId':  active_months['customer_id'].values,
        'cohortMonth': active_months['cohort_month'].values,
        'activeMonth': active_months['activity_month'].values,
        'retained':    active_months['retained'].astype(int).values,
        'computedAt':  datetime.datetime.utcnow(),
    })

    # Wipe previous cohort data so we don't accumulate stale rows
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM Cohort"))

    # Bulk insert fresh retention records
    output_df.to_sql(name='Cohort', con=engine, if_exists='append', index=False)

    print(f"Cohort scoring complete. Inserted {len(output_df)} records.")


if __name__ == "__main__":
    run_cohort_scoring()
