// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('ws');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

wss.on('connection', (ws) => {
  console.log('Client connected');
});

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
};

app.post('/api/orders', async (req, res) => {
  const { items, status, customer_name } = req.body;
  const timePlaced = new Date();
  try {
    const result = await pool.query(
      'INSERT INTO orders (items, status, customer_name, time_placed) VALUES ($1, $2, $3, $4) RETURNING *',
      [items, status, customer_name, timePlaced]
    );
    const order = result.rows[0];
    broadcast(order);
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY time_placed DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
