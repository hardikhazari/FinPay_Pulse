-- 04_daily_transaction_volume.sql
-- FinPay Pulse - Daily Transaction Volume Analysis
-- Analyzes transaction patterns by day of week, day of month, and hourly trends

-- Daily transaction volume over time
SELECT 
    transaction_date,
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN status = 'Success' THEN 1 ELSE 0 END) AS successful,
    SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) AS failed,
    ROUND(SUM(amount), 2) AS total_volume
FROM transactions
GROUP BY transaction_date
ORDER BY transaction_date;

-- Transaction volume by day of week
SELECT 
    DAYNAME(transaction_date) AS day_name,
    DAYOFWEEK(transaction_date) AS day_num,
    COUNT(*) AS total_transactions,
    ROUND(AVG(amount), 2) AS avg_amount,
    ROUND(SUM(amount), 2) AS total_volume
FROM transactions
WHERE status = 'Success'
GROUP BY day_name, day_num
ORDER BY day_num;

-- Transaction volume by day of month (salary-day spike analysis)
SELECT 
    DAY(transaction_date) AS day_of_month,
    COUNT(*) AS total_transactions,
    ROUND(AVG(amount), 2) AS avg_amount,
    ROUND(SUM(amount), 2) AS total_volume
FROM transactions
WHERE status = 'Success'
GROUP BY day_of_month
ORDER BY day_of_month;

-- Hourly transaction distribution
SELECT 
    HOUR(transaction_time) AS hour_of_day,
    COUNT(*) AS total_transactions,
    ROUND(AVG(amount), 2) AS avg_amount
FROM transactions
WHERE status = 'Success'
GROUP BY hour_of_day
ORDER BY hour_of_day;
