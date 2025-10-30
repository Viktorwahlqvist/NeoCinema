import express from "express";
import { db } from "../db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import randomNumber from "../utils/randomNumber.js";
import {sendEmail} from "./Mailer.js"


const router = express.Router();

const rNumber = randomNumber();
const bookingDate = new Date();

type Seat = RowDataPacket & {
  seatId: number;
  row_num: number;
  seat_num: number;
  seatStatus: "available" | "booked";
};
import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      email: string;
    };
  }
}
type SeatInput = {
  seatId: number;
  ticketType: number;
};

router.post("/bookings", async (req, res) => {
  const { screeningId, seats } = req.body;
  const userId = req.session.user?.id ?? null; // <-- använd session om inloggad
  const tempUserId = userId || null;

  try {
    
    const rNumber = Math.floor(100000 + Math.random() * 900000); // random bookingNumber
    const bookingDate = new Date();

    // Hämta alla platser för screening
    const [seatsRow] = await db.query<RowDataPacket[]>(
      "SELECT * FROM seatStatusView WHERE screeningId = ?",
      [screeningId]
    );

    const availableSeats = seatsRow.filter((r) => r.seatStatus === "available");
    const isAllAvailable = seats.every((s: any) =>
      availableSeats.some((a) => a.seatId === s.seatId)
    );

    if (!isAllAvailable) {
      return res
        .status(400)
        .json({ message: "En eller flera stolar är redan bokade" });
    }

    
    const [newBooking] = await db.query<ResultSetHeader>(
      "INSERT INTO bookings (bookingNumber, userId, screeningId, date) VALUES (?, ?, ?, ?)",
      [rNumber, tempUserId, screeningId, bookingDate]
    );

    const bookingId = newBooking.insertId;

    
    const seatValues = seats.map((s: any) => [bookingId, s.seatId, s.ticketType]);
    await db.query(
      "INSERT INTO bookingXSeats (bookingId, seatId, ticketTypeId) VALUES ?",
      [seatValues]
    );

   
    if (userId) {
      const [userRows] = await db.query<RowDataPacket[]>(
        "SELECT firstName, lastName, email FROM users WHERE id = ?",
        [userId]
      );

      const user = userRows[0];
      const [bookingInfoRows] = await db.query<RowDataPacket[]>(
        `SELECT 
            b.bookingNumber AS rNumber,
            m.title AS movieTitle,
            s.start_time AS screeningTime,
            a.name AS auditoriumName,
            SUM(t.price) AS totalPrice
         FROM bookings b
         JOIN screenings s ON s.id = b.screeningId
         JOIN movies m ON m.id = s.movie_id
         JOIN auditoriums a ON a.id = s.auditorium_id
         JOIN bookingXSeats bx ON bx.bookingId = b.id
         JOIN tickets t ON t.id = bx.ticketTypeId
         WHERE b.id = ?
         GROUP BY b.id;`,
        [bookingId]
      );

      const bookingInfo = bookingInfoRows[0];
      try {
        await sendEmail({
          to: user.email,
          subject: `🎬 Bekräftelse på din biobokning – ${bookingInfo.movieTitle}`,
          html: `
            <h2>Tack ${user.firstName} ${user.lastName}!</h2>
            <p>Din bokning hos <b>Neocinema AB</b> är bekräftad.</p>
            <p><b>Film:</b> ${bookingInfo.movieTitle}</p>
            <p><b>Salong:</b> ${bookingInfo.auditoriumName}</p>
            <p><b>Tid:</b> ${new Date(bookingInfo.screeningTime).toLocaleString("sv-SE")}</p>
            <p><b>Totalt pris:</b> ${bookingInfo.totalPrice} kr</p>
            <p><b>Bokningsnummer:</b> ${bookingInfo.rNumber}</p>
          `
        });
      } catch (err) {
        console.error("Kunde inte skicka mejlet:", err);
      }
    }

    res.status(201).json({
      message: "Bokningen skapades!",
      rNumber,
      bookingId,
      bookedSeats: seats.map((s: any) => s.seatId),
    });
  } catch (err: any) {
    console.error("❌ Booking error:", err);
    res.status(500).json({ error: err.message });
  }
});



router.delete('/bookings/:id', async (req, res) => {
  try {
    const id = Number(req.params.id); 

    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM bookings WHERE id = ? LIMIT 1',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking was removed successfully!' });
  } catch (err: any) {
    console.error('Delete booking error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/bookings/history", async (req, res) => {
  console.log("🧠 Session data:", req.session);
  const userId = req.session.user?.id;
  

  if (!userId) {
    return res.status(401).json({ message: "Du måste vara inloggad för att se dina bokningar." });
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
          b.id AS bookingId,
          b.bookingNumber AS rNumber,
          m.title AS movieTitle,
          s.start_time AS screeningTime,
          a.name AS auditoriumName,
          SUM(t.price) AS totalPrice
       FROM bookings b
       JOIN screenings s ON s.id = b.screeningId
       JOIN movies m ON m.id = s.movie_id
       JOIN auditoriums a ON a.id = s.auditorium_id
       JOIN bookingXSeats bx ON bx.bookingId = b.id
       JOIN tickets t ON t.id = bx.ticketTypeId
       WHERE b.userId = ?
       GROUP BY b.id
       ORDER BY s.start_time DESC;`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Du har inga bokningar ännu." });
    }

    res.json(rows);
  } catch (err: any) {
    console.error("❌ Fel vid hämtning av bokningshistorik:", err);
    res.status(500).json({ error: err.message });
  }
});
export default router;