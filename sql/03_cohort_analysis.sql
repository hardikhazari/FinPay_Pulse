-- 03_cohort_analysis.sql
-- FinPay Pulse - Monthly Cohort Retention Analysis
-- Tracks customer retention by grouping users into monthly cohorts based on their first transaction

-- Step 1: Identify each customer's first transaction month (cohort month)
WITH customer_cohort AS (
    SELECT 
        customer_id,
        DATE_FORMAT(MIN(transaction_date), '%Y-%m') AS cohort_month
    FROM transactions
    WHERE status = 'Success'
    GROUP BY customer_id
),

-- Step 2: Map each transaction to the customer's cohort and activity month
cohort_activity AS (
    SELECT 
        cc.cohort_month,
        DATE_FORMAT(t.transaction_date, '%Y-%m') AS activity_month,
        t.customer_id
    FROM transactions t
    JOIN customer_cohort cc ON t.customer_id = cc.customer_id
    WHERE t.status = 'Success'
),

-- Step 3: Calculate the month offset (0 = cohort month, 1 = next month, etc.)
cohort_size AS (
    SELECT 
        cohort_month,
        COUNT(DISTINCT customer_id) AS num_customers
    FROM customer_cohort
    GROUP BY cohort_month
),

retention AS (
    SELECT 
        ca.cohort_month,
        TIMESTAMPDIFF(MONTH, 
            STR_TO_DATE(CONCAT(ca.cohort_month, '-01'), '%Y-%m-%d'),
            STR_TO_DATE(CONCAT(ca.activity_month, '-01'), '%Y-%m-%d')
        ) AS month_offset,
        COUNT(DISTINCT ca.customer_id) AS active_customers
    FROM cohort_activity ca
    GROUP BY ca.cohort_month, month_offset
)

-- Step 4: Final cohort retention table
SELECT 
    r.cohort_month,
    cs.num_customers AS cohort_size,
    r.month_offset,
    r.active_customers,
    ROUND(r.active_customers * 100.0 / cs.num_customers, 1) AS retention_pct
FROM retention r
JOIN cohort_size cs ON r.cohort_month = cs.cohort_month
ORDER BY r.cohort_month, r.month_offset;
