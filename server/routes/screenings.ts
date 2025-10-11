import { Router } from 'express';
import { db } from '../db.js';
import type { RowDataPacket } from 'mysql2/promise';

export const screeningsRouter = Router();

/* ----------  GET /api/screenings  (lista alla kommande)  ---------- */
screeningsRouter.get('/', async (_req, res, next) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
  `SELECT * FROM screening_info WHERE startTime > NOW() ORDER BY startTime`,
);
    res.json(rows);
  } catch (e) { next(e); }
});

/* ----------  GET /api/screenings/:id  (enskild visning)  ---------- */
screeningsRouter.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM screening_info WHERE screeningId = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Screening not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});