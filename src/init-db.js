// src/init-db.js
const db = require('./db');

async function init() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_hits (
        id SERIAL PRIMARY KEY,
        count INTEGER DEFAULT 0
      );
    `);

    await db.query(`
      INSERT INTO site_hits (count)
      SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM site_hits);
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option CHAR(1) NOT NULL,
        category TEXT NOT NULL,
        source TEXT DEFAULT 'ai',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ All tables created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1);
  }
}

init();
