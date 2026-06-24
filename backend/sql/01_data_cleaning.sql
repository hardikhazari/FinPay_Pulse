-- FinPay Pulse - Data Cleaning & Validation
-- Check for NULL values in critical fields
SELECT 
    SUM(CASE WHEN id IS NULL THEN 1 ELSE 0 END) AS null_txn_id,
    SUM(CASE WHEN customerId IS NULL THEN 1 ELSE 0 END) AS null_cust_id,
    SUM(CASE WHEN amount IS NULL THEN 1 ELSE 0 END) AS null_amount,
    SUM(CASE WHEN transactionDate IS NULL THEN 1 ELSE 0 END) AS null_date,
    SUM(CASE WHEN status IS NULL THEN 1 ELSE 0 END) AS null_status
FROM Transaction
