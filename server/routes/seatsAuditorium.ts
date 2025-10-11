// src/routes/seatsAuditorium.ts
import { Router } from "express";
import { db } from "../db.js";          // your existing pool
import type { Seat, AuditoriumShape, SeatPutBody } from "./types.js";
import type { RowDataPacket } from 'mysql2/promise';

export const router = Router();

/* ----------  GET /auditoriums  ---------- */
router.get("/auditoriums", async (_req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, seat_shape AS seatShape FROM auditorium"
    );
    res.json(rows as AuditoriumShape[]);
  } catch (e) { next(e); }
});

/* ----------  GET /auditoriums/:id/seats  ---------- */
router.get("/auditoriums/:id/seats", async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT auditorium_id   AS auditoriumId,
              auditorium_name AS auditoriumName,
              row_num         AS rowNum,
              seat_num        AS seatNum,
              status,
              updated_at      AS updatedAt
       FROM   v_seat_map
       WHERE  auditorium_id = ?
       ORDER  BY row_num, seat_num`,
      [req.params.id]
    );
    res.json(rows as Seat[]);
  } catch (e) { next(e); }
});

/* ----------  PUT /auditoriums/:id/seats  ---------- */
router.put("/auditoriums/:id/seats", async (req, res, next) => {
  try {
    const auditoriumId = Number(req.params.id);
    const { row, seat, action }: SeatPutBody = req.body;

    if (!row || !seat || !["reserve", "release"].includes(action))
      return res.status(400).json({ error: "Bad payload" });

    const status = action === "reserve" ? "taken" : "available";

    await db.execute(
      `INSERT INTO seat (auditorium_id, row_num, seat_num, status)
       VALUES (:aud, :row, :seat, :status)
       ON DUPLICATE KEY UPDATE
           status     = :status,
           updated_at = CURRENT_TIMESTAMP`,
      { aud: auditoriumId, row, seat, status }
    );

   const [rows] = await db.execute<RowDataPacket[]>(
  `SELECT auditorium_id   AS auditoriumId,
          auditorium_name AS auditoriumName,
          row_num         AS rowNum,
          seat_num        AS seatNum,
          status,
          updated_at      AS updatedAt
   FROM   v_seat_map
   WHERE  auditorium_id = :aud
     AND  row_num  = :row
     AND  seat_num = :seat`,
  { aud: auditoriumId, row, seat }
);

const updated = rows[0] as Seat;
res.json(updated);

    res.json(updated as Seat);
  } catch (e) { next(e); }
});