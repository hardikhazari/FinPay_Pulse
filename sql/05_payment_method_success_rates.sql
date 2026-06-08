-- 05_payment_method_success_rates.sql
-- FinPay Pulse - Payment Method Success/Failure Rate Analysis
-- Identifies which payment methods and devices have the highest failure rates

-- Success rate by payment method
SELECT 
    payment_method,
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN status = 'Success' THEN 1 ELSE 0 END) AS successful,
    SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed,
    ROUND(SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS failure_rate_pct
FROM transactions
GROUP BY payment_method
ORDER BY failure_rate_pct DESC;

-- Success rate by device
SELECT 
    device_used,
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN status = 'Success' THEN 1 ELSE 0 END) AS successful,
    SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed,
    ROUND(SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS failure_rate_pct
FROM transactions
GROUP BY device_used
ORDER BY failure_rate_pct DESC;

-- Cross analysis: Payment method x Device failure rate
SELECT 
    payment_method,
    device_used,
    COUNT(*) AS total_transactions,
    ROUND(SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS failure_rate_pct
FROM transactions
GROUP BY payment_method, device_used
HAVING total_transactions > 100
ORDER BY failure_rate_pct DESC;
