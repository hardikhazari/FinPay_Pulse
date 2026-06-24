-- FinPay Pulse - Average Transaction Value by Customer Segment
-- Compares spending patterns across RFM-based customer segments
SELECT 
    cs.segment,
    COUNT(t.id) AS total_transactions,
    COUNT(DISTINCT t.customerId) AS unique_customers,
    ROUND(AVG(t.amount), 2) AS avg_transaction_amount,
    ROUND(SUM(t.amount), 2) AS total_revenue
FROM Transaction t
JOIN RfmScore cs ON t.customerId = cs.customerId
WHERE t.status = 'Success'
GROUP BY cs.segment
ORDER BY avg_transaction_amount DESC
