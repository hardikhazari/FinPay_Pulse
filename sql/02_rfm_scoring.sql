-- 02_rfm_scoring.sql
-- FinPay Pulse - RFM Scoring with NTILE
-- Calculates Recency, Frequency, Monetary values and assigns quintile scores (1-5)

-- Step 1: Calculate raw RFM metrics per customer
-- Recency  = Days since last transaction
-- Frequency = Total number of successful transactions
-- Monetary  = Total amount spent on successful transactions

SELECT 
    t.customer_id,
    DATEDIFF((SELECT MAX(transaction_date) FROM transactions), MAX(t.transaction_date)) AS recency,
    COUNT(*) AS frequency,
    ROUND(SUM(t.amount), 2) AS monetary
FROM transactions t
WHERE t.status = 'Success'
GROUP BY t.customer_id
ORDER BY monetary DESC;

-- Step 2: Assign RFM Scores using NTILE (quintiles 1-5)
-- For Recency: LOWER is better (more recent), so we reverse the score
-- For Frequency & Monetary: HIGHER is better

WITH rfm_raw AS (
    SELECT 
        customer_id,
        DATEDIFF((SELECT MAX(transaction_date) FROM transactions), MAX(transaction_date)) AS recency,
        COUNT(*) AS frequency,
        ROUND(SUM(amount), 2) AS monetary
    FROM transactions
    WHERE status = 'Success'
    GROUP BY customer_id
),
rfm_scored AS (
    SELECT 
        customer_id,
        recency,
        frequency,
        monetary,
        -- Recency: lower days = better = higher score (reverse NTILE)
        NTILE(5) OVER (ORDER BY recency DESC) AS r_score,
        -- Frequency: Static thresholds for ~20% quintiles
        CASE 
            WHEN frequency <= 8 THEN 1
            WHEN frequency BETWEEN 9 AND 10 THEN 2
            WHEN frequency BETWEEN 11 AND 12 THEN 3
            WHEN frequency BETWEEN 13 AND 14 THEN 4
            ELSE 5 
        END AS f_score,
        -- Monetary: more spend = higher score
        NTILE(5) OVER (ORDER BY monetary ASC) AS m_score
    FROM rfm_raw
)
SELECT 
    customer_id,
    recency,
    frequency,
    monetary,
    r_score,
    f_score,
    m_score,
    (r_score + f_score + m_score) AS rfm_total
FROM rfm_scored
ORDER BY rfm_total DESC;

-- Step 3: Segment assignment logic
-- Champions:       rfm_total >= 13
-- Loyal Customers: rfm_total >= 10 AND rfm_total < 13
-- At-Risk:         r_score <= 2 AND (f_score >= 3 OR m_score >= 3)
-- New Users:       r_score >= 4 AND f_score <= 2
-- Dormant:         Everything else (low across all three)

SELECT 
    segment,
    COUNT(*) AS customer_count,
    ROUND(AVG(recency), 0) AS avg_recency,
    ROUND(AVG(frequency), 1) AS avg_frequency,
    ROUND(AVG(monetary), 2) AS avg_monetary,
    ROUND(AVG(rfm_total), 1) AS avg_rfm_score
FROM customer_segments
GROUP BY segment
ORDER BY avg_rfm_score DESC;
