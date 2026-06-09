-- 08_avg_transaction_by_segment.sql
-- FinPay Pulse - Average Transaction Value by Customer Segment
-- Compares spending patterns across RFM-based customer segments

-- Average transaction amount per segment
SELECT 
    cs.segment,
    COUNT(*) AS total_transactions,
    COUNT(DISTINCT t.customer_id) AS unique_customers,
    ROUND(AVG(t.amount), 2) AS avg_transaction_amount,
    ROUND(SUM(t.amount), 2) AS total_revenue,
    ROUND(STDDEV(t.amount), 2) AS std_dev_amount
FROM transactions t
JOIN customer_segments cs ON t.customer_id = cs.customer_id
WHERE t.status = 'Success'
GROUP BY cs.segment
ORDER BY avg_transaction_amount DESC;

-- Transaction type breakdown by segment
SELECT 
    cs.segment,
    t.transaction_type,
    COUNT(*) AS tx_count,
    ROUND(AVG(t.amount), 2) AS avg_amount,
    ROUND(SUM(t.amount), 2) AS total_amount
FROM transactions t
JOIN customer_segments cs ON t.customer_id = cs.customer_id
WHERE t.status = 'Success'
GROUP BY cs.segment, t.transaction_type
ORDER BY cs.segment, total_amount DESC;

-- Payment method preference by segment
SELECT 
    cs.segment,
    t.payment_method,
    COUNT(*) AS tx_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY cs.segment), 1) AS pct_of_segment
FROM transactions t
JOIN customer_segments cs ON t.customer_id = cs.customer_id
WHERE t.status = 'Success'
GROUP BY cs.segment, t.payment_method
ORDER BY cs.segment, tx_count DESC;
