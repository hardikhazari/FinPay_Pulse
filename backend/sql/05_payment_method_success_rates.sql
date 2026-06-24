-- FinPay Pulse - Product Category Success Rates
-- Evaluates transaction success and failure rates by category
SELECT 
    productCategory,
    COUNT(id) AS total_transactions,
    SUM(CASE WHEN status = 'Success' THEN 1 ELSE 0 END) AS successful,
    SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed,
    ROUND(SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS failure_rate_pct
FROM Transaction
GROUP BY productCategory
ORDER BY failure_rate_pct DESC
