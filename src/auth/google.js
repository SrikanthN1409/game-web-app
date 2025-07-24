import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if (result.rows.length === 0) {
        result = await pool.query(
          'INSERT INTO users (google_id, name, email) VALUES ($1, $2, $3) RETURNING *',
          [profile.id, profile.displayName, email]
        );
      }

      return done(null, result.rows[0]);
    } catch (err) {
      return done(err, null);
    }
  }
));
