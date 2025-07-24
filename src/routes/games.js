// src/routes/games.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all games
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching games');
  }
});

// Add new score
router.post('/score', async (req, res) => {
  const { user_id, game_id, score } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO scores (user_id, game_id, score) VALUES ($1, $2, $3) RETURNING *',
      [user_id, game_id, score]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding score');
  }
});

export default router;
