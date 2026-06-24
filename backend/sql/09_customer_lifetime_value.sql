-- FinPay Pulse - Customer Lifetime Value (CLV) Summary
-- Summary of predicted CLV by customer segment
SELECT 
    segment,
    COUNT(c.customerId) AS num_customers,
    ROUND(AVG(predictedClv), 2) AS avg_projected_annual_clv,
    ROUND(SUM(predictedClv), 2) AS total_projected_annual_clv
FROM Clv c
JOIN RfmScore s ON c.customerId = s.customerId
GROUP BY segment
ORDER BY avg_projected_annual_clv DESC
