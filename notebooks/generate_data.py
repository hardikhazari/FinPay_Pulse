#!/usr/bin/env python
# coding: utf-8

# # FinPay Pulse - Synthetic Data Generation
# ## Customer Intelligence Platform for Digital Payments
# 
# This notebook generates realistic synthetic data for a digital payments platform:
# - **500 merchants** with industry categories
# - **10,000 customers** with demographic profiles
# - **150,000 transactions** with realistic patterns
# - **5,000 support tickets** tied to customers
# 
# All data is saved to the `data/` folder as CSV files and loaded into a SQLite database.

# In[1]:


import pandas as pd
import numpy as np
from faker import Faker
import random
import os
from datetime import datetime, timedelta
import sqlite3

fake = Faker('en_IN')
Faker.seed(42)
np.random.seed(42)
random.seed(42)

DATA_DIR = os.path.join('..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)
print('Data directory ready:', DATA_DIR)


# ## 1. Generate Merchants (500)

# In[2]:


CATEGORIES = ['Food & Beverage', 'Retail', 'Electronics', 'Travel', 'Healthcare',
              'Entertainment', 'Education', 'Utilities', 'Fashion', 'Groceries']

CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
          'Ahmedabad', 'Jaipur', 'Lucknow', 'Nagpur', 'Kochi', 'Chandigarh', 'Indore',
          'Patna', 'Guwahati', 'Coimbatore', 'Bhopal', 'Visakhapatnam', 'Thiruvananthapuram']

merchants = []
for i in range(500):
    merchants.append({
        'merchant_id': f'MER-{i+1:05d}',
        'merchant_name': fake.company(),
        'category': random.choice(CATEGORIES),
        'subcategory': fake.bs(),
        'city': random.choice(CITIES),
        'state': fake.state(),
        'registration_date': fake.date_between(start_date=datetime(2020, 1, 1), end_date=datetime(2023, 1, 1)),
        'is_verified': random.choice([True, True, True, False]),
        'avg_rating': round(random.uniform(3.0, 5.0), 1),
        'total_reviews': random.randint(10, 5000),
        'annual_revenue': round(random.uniform(100000, 50000000), 2),
        'employee_count': random.randint(5, 500)
    })

merchants_df = pd.DataFrame(merchants)
merchants_df.to_csv(os.path.join(DATA_DIR, 'merchants.csv'), index=False)
print(f'Generated {len(merchants_df)} merchants')
merchants_df.head()


# ## 2. Generate Customers (10,000)

# In[3]:


INCOME_BRACKETS = ['<2L', '2L-5L', '5L-10L', '10L-20L', '20L+']
OCCUPATIONS = ['Salaried', 'Self-Employed', 'Student', 'Freelancer', 'Retired', 'Homemaker']
AGE_GROUPS = ['18-25', '26-35', '36-45', '46-55', '55+']

customers = []
for i in range(10000):
    signup_date = fake.date_between(start_date=datetime(2023, 1, 1), end_date=datetime(2025, 5, 31))
    last_login = fake.date_between(start_date=signup_date, end_date=datetime(2025, 5, 31))
    customers.append({
        'customer_id': f'CUS-{i+1:06d}',
        'first_name': fake.first_name(),
        'last_name': fake.last_name(),
        'email': fake.email(),
        'phone': fake.phone_number(),
        'city': random.choice(CITIES),
        'state': fake.state(),
        'age_group': random.choice(AGE_GROUPS),
        'gender': random.choice(['Male', 'Female', 'Other']),
        'occupation': random.choice(OCCUPATIONS),
        'income_bracket': random.choice(INCOME_BRACKETS),
        'signup_date': signup_date,
        'last_login': last_login,
        'kyc_status': random.choice(['Verified', 'Verified', 'Verified', 'Pending', 'Rejected']),
        'account_status': random.choice(['Active', 'Active', 'Active', 'Active', 'Inactive', 'Suspended']),
        'preferred_language': random.choice(['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali']),
        'referral_source': random.choice(['Organic', 'Social Media', 'Referral', 'Ad Campaign', 'App Store']),
        'app_version': f'{random.randint(3,6)}.{random.randint(0,9)}.{random.randint(0,9)}',
        'device_os': random.choice(['Android', 'iOS', 'Android', 'Android']),
        'total_balance': round(random.uniform(0, 100000), 2)
    })

customers_df = pd.DataFrame(customers)
customers_df.to_csv(os.path.join(DATA_DIR, 'customers.csv'), index=False)
print(f'Generated {len(customers_df)} customers')
customers_df.head()


# ## 3. Generate Transactions (150,000)

# In[4]:


TRANSACTION_TYPES = ['P2M', 'P2P', 'Bill Payment', 'Recharge', 'Investment']
PAYMENT_METHODS = ['UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Wallet']
STATUSES = ['Success', 'Success', 'Success', 'Success', 'Success', 'Success',
            'Success', 'Success', 'Failed', 'Pending', 'Refunded']
DEVICES = ['Android', 'Android', 'Android', 'iOS', 'iOS', 'Web']
CURRENCIES = ['INR', 'INR', 'INR', 'INR', 'INR', 'INR', 'INR', 'INR', 'INR', 'USD']

customer_ids = customers_df['customer_id'].tolist()
merchant_ids = merchants_df['merchant_id'].tolist()

transactions = []
start_date = datetime(2023, 1, 1)
end_date = datetime(2025, 5, 31)

for i in range(150000):
    txn_date = fake.date_between(start_date=start_date, end_date=end_date)
    txn_time = f'{random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}'
    txn_type = random.choice(TRANSACTION_TYPES)

    # Amount varies by transaction type
    if txn_type == 'Recharge':
        amount = round(random.uniform(10, 999), 2)
    elif txn_type == 'P2P':
        amount = round(random.uniform(100, 10000), 2)
    elif txn_type == 'Investment':
        amount = round(random.uniform(500, 50000), 2)
    elif txn_type == 'Bill Payment':
        amount = round(random.uniform(200, 15000), 2)
    else:  # P2M
        amount = round(random.uniform(50, 20000), 2)

    transactions.append({
        'transaction_id': f'TXN-{i+1:08d}',
        'customer_id': random.choice(customer_ids),
        'merchant_id': random.choice(merchant_ids),
        'transaction_date': txn_date,
        'transaction_time': txn_time,
        'transaction_type': txn_type,
        'amount': amount,
        'currency': random.choice(CURRENCIES),
        'payment_method': random.choice(PAYMENT_METHODS),
        'status': random.choice(STATUSES),
        'device_used': random.choice(DEVICES),
        'ip_city': random.choice(CITIES)
    })

transactions_df = pd.DataFrame(transactions)
transactions_df.to_csv(os.path.join(DATA_DIR, 'transactions.csv'), index=False)
print(f'Generated {len(transactions_df)} transactions')
print(f'Date range: {transactions_df["transaction_date"].min()} to {transactions_df["transaction_date"].max()}')
transactions_df.head()


# ## 4. Generate Support Tickets (5,000)

# In[5]:


TICKET_CATEGORIES = ['Payment Failed', 'Refund Request', 'Account Issue', 'KYC Problem',
                     'App Bug', 'Cashback Missing', 'Fraud Report', 'General Inquiry']
PRIORITIES = ['Low', 'Medium', 'Medium', 'High', 'Critical']
TICKET_STATUSES = ['Open', 'In Progress', 'Resolved', 'Resolved', 'Resolved', 'Closed', 'Closed']

tickets = []
for i in range(5000):
    created = fake.date_between(start_date=start_date, end_date=end_date)
    tickets.append({
        'ticket_id': f'TKT-{i+1:06d}',
        'customer_id': random.choice(customer_ids),
        'category': random.choice(TICKET_CATEGORIES),
        'priority': random.choice(PRIORITIES),
        'status': random.choice(TICKET_STATUSES),
        'created_date': created,
        'resolved_date': fake.date_between(start_date=created, end_date=end_date) if random.random() > 0.2 else None,
        'satisfaction_score': random.choice([1, 2, 3, 3, 4, 4, 4, 5, 5, None])
    })

tickets_df = pd.DataFrame(tickets)
tickets_df.to_csv(os.path.join(DATA_DIR, 'support_tickets.csv'), index=False)
print(f'Generated {len(tickets_df)} support tickets')
tickets_df.head()


# ## 5. Load into SQLite Database

# In[6]:


db_path = os.path.join(DATA_DIR, 'finpay_pulse.db')
conn = sqlite3.connect(db_path)

merchants_df.to_sql('merchants', conn, if_exists='replace', index=False)
customers_df.to_sql('customers', conn, if_exists='replace', index=False)
transactions_df.to_sql('transactions', conn, if_exists='replace', index=False)
tickets_df.to_sql('support_tickets', conn, if_exists='replace', index=False)

# Verify
for table in ['merchants', 'customers', 'transactions', 'support_tickets']:
    count = pd.read_sql(f'SELECT COUNT(*) as cnt FROM {table}', conn)['cnt'][0]
    print(f'{table}: {count} rows')

conn.close()
print(f'\nSQLite database saved to: {db_path}')


# ## Summary
# 
# Generated datasets:
# - `merchants.csv` — 500 merchants, 12 fields
# - `customers.csv` — 10,000 customers, 20 fields
# - `transactions.csv` — 150,000 transactions, 12 fields
# - `support_tickets.csv` — 5,000 tickets, 8 fields
# - `finpay_pulse.db` — SQLite database with all 4 tables
# 
# Next step: Run the SQL analytical layer (`sql/run_all_sql.py`) then open `eda_and_segmentation.ipynb`.
