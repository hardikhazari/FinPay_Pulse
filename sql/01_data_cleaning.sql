-- 01_data_cleaning.sql
-- FinPay Pulse - Data Cleaning & Validation
-- Removes duplicates, handles NULL values, and validates data types

-- Remove duplicate transactions (keep first occurrence)
DELETE t1 FROM transactions t1
INNER JOIN transactions t2 
WHERE t1.transaction_id > t2.transaction_id 
  AND t1.customer_id = t2.customer_id 
  AND t1.transaction_date = t2.transaction_date
  AND t1.amount = t2.amount;

-- Check for NULL values in critical fields
SELECT 
    SUM(CASE WHEN transaction_id IS NULL THEN 1 ELSE 0 END) AS null_txn_id,
    SUM(CASE WHEN customer_id IS NULL THEN 1 ELSE 0 END) AS null_cust_id,
    SUM(CASE WHEN amount IS NULL THEN 1 ELSE 0 END) AS null_amount,
    SUM(CASE WHEN transaction_date IS NULL THEN 1 ELSE 0 END) AS null_date,
    SUM(CASE WHEN status IS NULL THEN 1 ELSE 0 END) AS null_status
FROM transactions;

-- Validate amount is positive
SELECT COUNT(*) AS negative_amounts
FROM transactions
WHERE amount <= 0;

-- Validate transaction dates are within expected range
SELECT 
    MIN(transaction_date) AS earliest_txn,
    MAX(transaction_date) AS latest_txn
FROM transactions;

-- Validate status values
SELECT status, COUNT(*) AS count
FROM transactions
GROUP BY status
ORDER BY count DESC;

-- Check for orphan transactions (customer_id not in customer_segments)
SELECT COUNT(*) AS orphan_transactions
FROM transactions t
LEFT JOIN customer_segments cs ON t.customer_id = cs.customer_id
WHERE cs.customer_id IS NULL;

-- Summary statistics after cleaning
SELECT 
    COUNT(DISTINCT customer_id) AS unique_customers,
    COUNT(DISTINCT merchant_id) AS unique_merchants,
    COUNT(*) AS total_transactions,
    ROUND(AVG(amount), 2) AS avg_amount,
    ROUND(MIN(amount), 2) AS min_amount,
    ROUND(MAX(amount), 2) AS max_amount
FROM transactions;
