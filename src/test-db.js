const db = require('./db');

async function testConnection() {
  try {
    const res = await db.query('SELECT NOW()');
    console.log('Connected! Server time:', res.rows[0]);
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

testConnection();
