// src/routes/movies.ts
import { Router } from 'express';
import { db } from '../db.js';
import type { RowDataPacket } from 'mysql2/promise';

export const moviesRouter = Router();

/* ----------  GET /movies  (lista alla, optional genre-filter)  ---------- */
moviesRouter.get('/', async (req, res, next) => {
  try {
    const { genre } = req.query;              // ?genre=Action
    let sql = `
      SELECT m.id,
             m.title,
             m.info,
             JSON_ARRAYAGG(g.name) AS genres
      FROM movies m
      JOIN movies_genres mg ON mg.movie_id = m.id
      JOIN genres g ON g.id = mg.genre_id
    `;
    const values: string[] = [];

    if (genre) {
      sql += ` WHERE g.name = ?`;
      values.push(genre as string);
    }
    sql += ` GROUP BY m.id ORDER BY m.title`;

    const [rows] = await db.execute<RowDataPacket[]>(sql, values);
    res.json(rows);
  } catch (e) { next(e); }
});

/* ----------  GET /movies/:id  (enskild film)  ---------- */
moviesRouter.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT m.id,
              m.title,
              m.info,
              JSON_ARRAYAGG(g.name) AS genres
       FROM movies m
       JOIN movies_genres mg ON mg.movie_id = m.id
       JOIN genres g ON g.id = mg.genre_id
       WHERE m.id = ?
       GROUP BY m.id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Film finns inte' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});