// src/db.js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DB Connection Error:', err);
  } else {
    console.log('✅ DB Connected. Time:', res.rows[0]);
  }
  process.exit(); // Exit after test
});

export default pool;
