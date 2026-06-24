-- FinPay Pulse - Monthly Active Users (MAU) Analysis
-- Tracks unique active customers per month and growth trends
WITH mau AS (
    SELECT 
        DATE_FORMAT(transactionDate, '%Y-%m') AS month,
        COUNT(DISTINCT customerId) AS active_users
    FROM Transaction
    WHERE status = 'Success'
    GROUP BY month
)
SELECT 
    month,
    active_users,
    LAG(active_users) OVER (ORDER BY month) AS prev_month_users,
    ROUND(
        (active_users - LAG(active_users) OVER (ORDER BY month)) * 100.0 
        / NULLIF(LAG(active_users) OVER (ORDER BY month), 0), 
        2
    ) AS mom_growth_pct
FROM mau
ORDER BY month
