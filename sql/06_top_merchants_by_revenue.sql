-- 06_top_merchants_by_revenue.sql
-- FinPay Pulse - Top Merchants by Revenue
-- Ranks merchants by total revenue, transaction count, and average transaction value

-- Top 20 merchants by total revenue
SELECT 
    merchant_id,
    COUNT(*) AS total_transactions,
    COUNT(DISTINCT customer_id) AS unique_customers,
    ROUND(SUM(amount), 2) AS total_revenue,
    ROUND(AVG(amount), 2) AS avg_transaction_value,
    ROUND(MAX(amount), 2) AS max_transaction
FROM transactions
WHERE status = 'Success'
GROUP BY merchant_id
ORDER BY total_revenue DESC
LIMIT 20;

-- Merchant concentration: what % of revenue do top 10% merchants drive?
WITH merchant_revenue AS (
    SELECT 
        merchant_id,
        SUM(amount) AS total_revenue
    FROM transactions
    WHERE status = 'Success'
    GROUP BY merchant_id
),
ranked AS (
    SELECT 
        merchant_id,
        total_revenue,
        NTILE(10) OVER (ORDER BY total_revenue DESC) AS decile
    FROM merchant_revenue
)
SELECT 
    decile,
    COUNT(*) AS merchant_count,
    ROUND(SUM(total_revenue), 2) AS decile_revenue,
    ROUND(SUM(total_revenue) * 100.0 / (SELECT SUM(total_revenue) FROM merchant_revenue), 2) AS pct_of_total
FROM ranked
GROUP BY decile
ORDER BY decile;
