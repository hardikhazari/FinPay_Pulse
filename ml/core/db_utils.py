import os
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.dialects.mysql import insert

def get_engine():
    # Read DATABASE_URL from environment or fallback to a local MySQL instance
    db_url = os.environ.get("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/finpay_pulse")
    if db_url.startswith("mysql://"):
        db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)
    return create_engine(db_url)

def mysql_upsert(table, conn, keys, data_iter):
    """
    Custom method for pandas to_sql to perform MySQL INSERT ON DUPLICATE KEY UPDATE.
    """
    insert_stmt = insert(table.table).values(list(data_iter))
    
    # Update all columns except the primary key on duplicate
    # We assume 'customerId' or 'month' are the primary keys
    update_dict = {c.name: c for c in insert_stmt.inserted if c.name not in ('customerId', 'month')}
    
    if update_dict:
        on_duplicate_key_stmt = insert_stmt.on_duplicate_key_update(update_dict)
    else:
        on_duplicate_key_stmt = insert_stmt.on_duplicate_key_ignore()
        
    conn.execute(on_duplicate_key_stmt)

def write_to_db(df, table_name):
    engine = get_engine()
    df.to_sql(
        name=table_name,
        con=engine,
        if_exists='append',
        index=False,
        method=mysql_upsert
    )
