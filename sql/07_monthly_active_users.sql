-- 07_monthly_active_users.sql
-- FinPay Pulse - Monthly Active Users (MAU) Analysis
-- Tracks unique active customers per month and growth trends

-- Monthly Active Users
SELECT 
    DATE_FORMAT(transaction_date, '%Y-%m') AS month,
    COUNT(DISTINCT customer_id) AS monthly_active_users,
    COUNT(*) AS total_transactions,
    ROUND(SUM(amount), 2) AS total_volume
FROM transactions
WHERE status = 'Success'
GROUP BY month
ORDER BY month;

-- Month-over-month MAU growth rate
WITH mau AS (
    SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') AS month,
        COUNT(DISTINCT customer_id) AS active_users
    FROM transactions
    WHERE status = 'Success'
    GROUP BY month
)
SELECT 
    month,
    active_users,
    LAG(active_users) OVER (ORDER BY month) AS prev_month_users,
    ROUND(
        (active_users - LAG(active_users) OVER (ORDER BY month)) * 100.0 
        / LAG(active_users) OVER (ORDER BY month), 
        2
    ) AS mom_growth_pct
FROM mau
ORDER BY month;

-- New vs. Returning users per month
WITH first_txn AS (
    SELECT 
        customer_id,
        DATE_FORMAT(MIN(transaction_date), '%Y-%m') AS first_month
    FROM transactions
    WHERE status = 'Success'
    GROUP BY customer_id
),
monthly_users AS (
    SELECT 
        DATE_FORMAT(t.transaction_date, '%Y-%m') AS month,
        t.customer_id,
        ft.first_month
    FROM transactions t
    JOIN first_txn ft ON t.customer_id = ft.customer_id
    WHERE t.status = 'Success'
)
SELECT 
    month,
    COUNT(DISTINCT CASE WHEN month = first_month THEN customer_id END) AS new_users,
    COUNT(DISTINCT CASE WHEN month != first_month THEN customer_id END) AS returning_users
FROM monthly_users
GROUP BY month
ORDER BY month;
