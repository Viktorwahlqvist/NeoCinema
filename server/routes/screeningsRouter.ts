import { Router } from "express";
import { db } from "../db.js";
import type { RowDataPacket } from "mysql2/promise";

export const screeningsRouter = Router();

screeningsRouter.get("/", async (_req, res, next) => {
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM movieScreenings ORDER BY start_time ASC"
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

screeningsRouter.get("/:movieId", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const sql = `
      SELECT * 
      FROM movieScreenings 
      WHERE movie_id = ? 
      ORDER BY start_time ASC 
      LIMIT ${limit}
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [req.params.movieId]);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});


