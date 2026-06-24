-- FinPay Pulse - Cohort Retention Matrix
-- Generates user cohorts by first transaction month
WITH user_cohorts AS (
    SELECT 
        customerId,
        DATE_FORMAT(MIN(transactionDate), '%Y-%m') as cohort_month
    FROM Transaction
    WHERE status = 'Success'
    GROUP BY customerId
),
active_months AS (
    SELECT DISTINCT
        customerId,
        DATE_FORMAT(transactionDate, '%Y-%m') as activity_month
    FROM Transaction
    WHERE status = 'Success'
)
SELECT 
    c.cohort_month,
    a.activity_month,
    COUNT(DISTINCT a.customerId) as retained_users
FROM active_months a
JOIN user_cohorts c ON a.customerId = c.customerId
GROUP BY c.cohort_month, a.activity_month
ORDER BY c.cohort_month, a.activity_month
