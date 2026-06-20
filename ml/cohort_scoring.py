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

    # Use pure SQL with CTEs to calculate cohorts and active months.
    # This highlights advanced SQL skills by moving the logic from Pandas into the database.
    query = text("""
    WITH user_cohorts AS (
        SELECT 
            customerId as customer_id,
            DATE_FORMAT(MIN(transactionDate), '%%Y-%%m') as cohort_month
        FROM Transaction
        WHERE status = 'Success'
        GROUP BY customerId
    ),
    active_months AS (
        SELECT DISTINCT
            customerId as customer_id,
            DATE_FORMAT(transactionDate, '%%Y-%%m') as activity_month
        FROM Transaction
        WHERE status = 'Success'
    )
    SELECT 
        a.customer_id,
        c.cohort_month,
        a.activity_month,
        1 as retained
    FROM active_months a
    JOIN user_cohorts c ON a.customer_id = c.customer_id
    """)
    with engine.connect() as conn:
        active_months = pd.read_sql(query, conn)

    if active_months.empty:
        print("No transactions found in database.")
        return

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
