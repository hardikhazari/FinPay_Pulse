-- FinPay Pulse - Daily Transaction Volume
-- Tracks volume and revenue on a daily basis
SELECT 
    DATE(transactionDate) AS txn_day,
    COUNT(id) AS total_transactions,
    ROUND(SUM(amount), 2) AS total_revenue
FROM Transaction
WHERE status = 'Success'
GROUP BY txn_day
ORDER BY txn_day DESC
LIMIT 30
