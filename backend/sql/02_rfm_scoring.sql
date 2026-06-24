-- FinPay Pulse - RFM Scoring Base Query
-- Calculates Recency, Frequency, and Monetary value per customer
WITH max_date AS (
    SELECT MAX(transactionDate) as global_max 
    FROM Transaction 
    WHERE status = 'Success'
)
SELECT 
    customerId,
    DATEDIFF((SELECT global_max FROM max_date) + INTERVAL 1 DAY, MAX(transactionDate)) as recency,
    COUNT(id) as frequency,
    SUM(amount) as monetary
FROM Transaction
WHERE status = 'Success'
GROUP BY customerId
ORDER BY monetary DESC
LIMIT 50
