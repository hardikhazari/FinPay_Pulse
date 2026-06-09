const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3050;

app.use(cors());
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Hardik@123',
    database: 'finpay_pulse'
};

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );
        await connection.end();

        if (rows.length > 0) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Database error during login:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get Segments Endpoint
app.get('/api/segments', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM customer_segments');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Database error fetching segments:', error);
        res.status(500).json({ error: 'Server error fetching data' });
    }
});

// Analytics Endpoints
app.get('/api/analytics/distribution', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT segment, COUNT(*) as count FROM customer_segments GROUP BY segment');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Database error fetching distribution:', error);
        res.status(500).json({ error: 'Server error fetching data' });
    }
});

app.get('/api/analytics/revenue', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT segment, AVG(monetary) as avg_revenue FROM customer_segments GROUP BY segment');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Database error fetching revenue:', error);
        res.status(500).json({ error: 'Server error fetching data' });
    }
});

app.get('/api/transactions/:customer_id', async (req, res) => {
    try {
        const { customer_id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT transaction_id, transaction_date, transaction_type, amount, payment_method, status FROM transactions WHERE customer_id = ? ORDER BY transaction_date DESC',
            [customer_id]
        );
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Database error fetching transactions:', error);
        res.status(500).json({ error: 'Server error fetching data' });
    }
});

app.get('/api/analytics/methods', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT payment_method, COUNT(*) as count FROM transactions GROUP BY payment_method ORDER BY count DESC'
        );
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/analytics/time', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT DATE_FORMAT(transaction_date, "%Y-%m") as month, COUNT(*) as count FROM transactions WHERE transaction_date <= "2025-06-30" GROUP BY month ORDER BY month ASC'
        );
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/analytics/failure-rate', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT payment_method, 
                   SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) as failed_count,
                   COUNT(*) as total_count,
                   (SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) / COUNT(*)) * 100 as failure_rate
            FROM transactions 
            WHERE payment_method != '' 
            GROUP BY payment_method 
            ORDER BY failure_rate DESC
        `);
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/analytics/avg-spend-segment', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT c.segment, AVG(t.amount) as avg_amount
            FROM transactions t
            JOIN customer_segments c ON t.customer_id = c.customer_id
            WHERE t.status = 'Success'
            GROUP BY c.segment
            ORDER BY avg_amount DESC
        `);
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/analytics/revenue-geo', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT ip_city as city, SUM(amount) as total_revenue
            FROM transactions
            WHERE status = 'Success' AND ip_city != ''
            GROUP BY ip_city
            ORDER BY total_revenue DESC
            LIMIT 5
        `);
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/analytics/method-segment', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT c.segment, t.payment_method, COUNT(*) as tx_count
            FROM transactions t
            JOIN customer_segments c ON t.customer_id = c.customer_id
            WHERE t.payment_method != ''
            GROUP BY c.segment, t.payment_method
            ORDER BY c.segment, tx_count DESC
        `);
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/analytics/type-device', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT device_used, transaction_type, COUNT(*) as tx_count
            FROM transactions
            WHERE device_used != '' AND transaction_type != ''
            GROUP BY device_used, transaction_type
        `);
        await connection.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
