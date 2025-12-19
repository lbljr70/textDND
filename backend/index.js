require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'textdnd_db',
});

// ---------- ROUTES ----------

// Health check (server only)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Database health check (simple connect test)
app.get('/api/db-health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
    });
  } catch (err) {
    console.error('DB health check failed:', err);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

// ✅ Database version test (NEW)
app.get('/api/db-version', async (req, res) => {
  try {
    const result = await pool.query('SELECT version();');

    res.json({
      status: 'ok',
      database: 'connected',
      version: result.rows[0].version,
    });
  } catch (err) {
    console.error('DB version check failed:', err);

    res.status(500).json({
      status: 'error',
      message: 'Database query failed',
    });
  }
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
