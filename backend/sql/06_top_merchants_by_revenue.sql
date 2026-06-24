-- FinPay Pulse - Top Customers by Revenue
-- Ranks customers by total revenue, transaction count, and average transaction value
SELECT 
    customerId,
    COUNT(id) AS total_transactions,
    ROUND(SUM(amount), 2) AS total_revenue,
    ROUND(AVG(amount), 2) AS avg_transaction_value,
    ROUND(MAX(amount), 2) AS max_transaction
FROM Transaction
WHERE status = 'Success'
GROUP BY customerId
ORDER BY total_revenue DESC
LIMIT 20
