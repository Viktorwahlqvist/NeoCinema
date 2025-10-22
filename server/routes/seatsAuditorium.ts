
import { Router } from "express";
import { db } from "../db.js";          
import type { Seat, auditoriumsShape, SeatPutBody } from "./types.js";
import type { RowDataPacket } from 'mysql2/promise';

export const router = Router();


router.get("/auditoriums", async (_req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, seat_shape AS seatShape FROM auditoriums"
    );
    res.json(rows as auditoriumsShape[]);
  } catch (e) { next(e); }
});



router.get("/auditoriums/:id/seats", async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT auditorium_id   AS auditoriumId,
              auditorium_name AS auditoriumName,
              row_num         AS rowNum,
              seat_num        AS seatNum,
              status,
              updated_at      AS updatedAt
       FROM   seatMap
       WHERE  auditorium_id = ?
       ORDER  BY row_num, seat_num`,
      [req.params.id]
    );
    res.json(rows as Seat[]);
  } catch (e) { next(e); }
});

router.put("/auditoriums/:id/seats", async (req, res, next) => {
  try {
    const auditoriumsId = Number(req.params.id);
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
  { aud: auditoriumsId, row, seat, status }
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
  { aud: auditoriumsId, row, seat }
);

const updated = rows[0] as Seat;
return res.json(updated);

  } catch (e) { next(e); }
});