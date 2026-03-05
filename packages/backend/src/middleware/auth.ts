import type { RequestHandler } from 'express';
import { pool } from '../db/pool.js';

declare global {
  namespace Express {
    interface Request {
      userEmail?: string;
    }
  }
}

export const authMiddleware: RequestHandler = async (req, res, next) => {
  const email = req.headers['x-forwarded-email'] as string | undefined;

  if (!email) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }

  req.userEmail = email;

  // Upsert user record
  try {
    await pool.query(
      `INSERT INTO users (email, last_seen_at)
       VALUES ($1, now())
       ON CONFLICT (email)
       DO UPDATE SET last_seen_at = now()`,
      [email],
    );
  } catch (err) {
    console.error('Failed to upsert user:', err);
  }

  next();
};
