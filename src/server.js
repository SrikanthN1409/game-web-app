// src/server.js
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import './auth/google.js';// ✅ This runs the strategy setup without expecting an export
import pool from './db.js'; // Ensure db.js is ESM compatible
import gameRoutes from './routes/games.js'; // Make sure this file is also ESM

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// DB Connection Check
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('DB Error:', err);
  } else {
    console.log('DB Connected. Time:', res.rows[0]);
  }
});

// Middlewares
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Google Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    successRedirect: '/dashboard'
  })
);

// Middleware to protect dashboard
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

// Routes
app.get('/dashboard', ensureAuth, (req, res) => {
  res.send(`<h2>Welcome ${req.user.name}!</h2><p><a href="/logout">Logout</a></p>`);
});

app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
}); 

app.use('/api/games', gameRoutes);
app.get('/', (req, res) => {
  res.send('<h1>🎮 Welcome to the Games Web App</h1><p>Visit <a href="/api/games">/api/games</a> to test the API.</p>');
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
