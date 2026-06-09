-- 09_customer_lifetime_value.sql
-- FinPay Pulse - Customer Lifetime Value (CLV) Estimation
-- Estimates CLV using historical transaction data and RFM segments

-- CLV per customer: Total revenue + avg monthly revenue projection
WITH customer_metrics AS (
    SELECT 
        t.customer_id,
        cs.segment,
        COUNT(*) AS total_transactions,
        ROUND(SUM(t.amount), 2) AS total_spent,
        ROUND(AVG(t.amount), 2) AS avg_transaction,
        MIN(t.transaction_date) AS first_txn_date,
        MAX(t.transaction_date) AS last_txn_date,
        DATEDIFF(MAX(t.transaction_date), MIN(t.transaction_date)) AS customer_lifespan_days
    FROM transactions t
    JOIN customer_segments cs ON t.customer_id = cs.customer_id
    WHERE t.status = 'Success'
    GROUP BY t.customer_id, cs.segment
)
SELECT 
    customer_id,
    segment,
    total_transactions,
    total_spent,
    avg_transaction,
    customer_lifespan_days,
    -- Estimated monthly revenue
    CASE 
        WHEN customer_lifespan_days > 0 
        THEN ROUND(total_spent / (customer_lifespan_days / 30.0), 2)
        ELSE total_spent
    END AS estimated_monthly_revenue,
    -- Simple CLV projection (12-month forward)
    CASE 
        WHEN customer_lifespan_days > 0 
        THEN ROUND((total_spent / (customer_lifespan_days / 30.0)) * 12, 2)
        ELSE total_spent
    END AS projected_annual_clv
FROM customer_metrics
ORDER BY projected_annual_clv DESC
LIMIT 50;

-- CLV summary by segment
WITH customer_clv AS (
    SELECT 
        t.customer_id,
        cs.segment,
        SUM(t.amount) AS total_spent,
        DATEDIFF(MAX(t.transaction_date), MIN(t.transaction_date)) AS lifespan_days
    FROM transactions t
    JOIN customer_segments cs ON t.customer_id = cs.customer_id
    WHERE t.status = 'Success'
    GROUP BY t.customer_id, cs.segment
)
SELECT 
    segment,
    COUNT(*) AS num_customers,
    ROUND(AVG(total_spent), 2) AS avg_total_spent,
    ROUND(AVG(lifespan_days), 0) AS avg_lifespan_days,
    ROUND(AVG(
        CASE WHEN lifespan_days > 0 THEN (total_spent / (lifespan_days / 30.0)) * 12 ELSE total_spent END
    ), 2) AS avg_projected_annual_clv,
    ROUND(SUM(
        CASE WHEN lifespan_days > 0 THEN (total_spent / (lifespan_days / 30.0)) * 12 ELSE total_spent END
    ), 2) AS total_projected_annual_clv
FROM customer_clv
GROUP BY segment
ORDER BY avg_projected_annual_clv DESC;
