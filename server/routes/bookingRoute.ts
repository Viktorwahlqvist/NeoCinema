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

type SeatInput = {
  seatId: number;
  ticketType: number;
};

router.post("/bookings", async (req, res) => {
  const { screeningId, userId, seats } = req.body;
  try {
    // Get all seats with screening id
    const [seatsRow] = await db.query<Seat[]>(
      "SELECT * FROM seatStatusView WHERE screeningId = ?",
      [screeningId]
    );

    // Gets all available seats.
    const availableSeats = seatsRow.filter((r) => r.seatStatus === "available");

    // checks if the choosen seat is available
    const isAllAvailable = seats.every((seats: SeatInput) =>
      availableSeats.some((s) => s.seatId === seats.seatId)
    );

    if (!isAllAvailable) {
      return res
        .status(400)
        .json({ message: "One or more seats are already booked" });
    }
    // Insert userid and screening id to bookings
    const [newBooking] = await db.query<ResultSetHeader>(
      "INSERT INTO bookings(bookingNumber, userId, screeningId, date) VALUES(?, ?, ?, ?)",
      [rNumber, userId, screeningId, bookingDate]
    );

    if (!newBooking || newBooking.affectedRows === 0) {
      return res.status(400).json({ message: "Booking could not be created" });
    }

    const bookingId = newBooking.insertId;
    // Incase its more then 1 tickets/seats.
    const seatValues = seats.map((seat: Seat) => [
      bookingId,
      seat.seatId,
      seat.ticketType,
    ]);
    await db.query(
      "INSERT INTO bookingXSeats (bookingId, seatId, ticketTypeId) VALUES ?",
      [seatValues]
    );

    const [userRows] = await db.query<RowDataPacket[]>(
  "SELECT firstName, lastName, email FROM users WHERE id = ?",
  [userId]
);

const user = userRows[0] as { firstName: string; lastName: string; email: string };


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
// Skicka mejlet till den inloggade användaren
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
} catch (error) {
  console.error("Kunde inte skicka mejlet:", error);
}



    res.status(201).json({
      message: "Booking created successfully",
      rNumber,
      bookingId,
      bookedSeats: seats.map((seat: Seat) => seat.seatId),
      ticketTypes: seats.map((seat: Seat) => seat.ticketType),
    });
} catch (err: any) {
  console.error("❌ Booking could not be processed.", err);
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

router.get("/bookings/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  try {
const [rows] = await db.query<RowDataPacket[]>(
  `SELECT 
      b.id AS bookingId,
      b.bookingNumber AS rNumber,
      u.email,
      m.title AS movieTitle,
      s.start_time AS screeningTime,
      a.name AS auditoriumName,
      SUM(t.price) AS totalPrice
   FROM bookings b
   JOIN users u ON u.id = b.userId
   JOIN screenings s ON s.id = b.screeningId
   JOIN movies m ON m.id = s.movie_id
   JOIN auditoriums a ON a.id = s.auditorium_id
   JOIN bookingXSeats bx ON bx.bookingId = b.id
   JOIN tickets t ON t.id = bx.ticketTypeId
   WHERE b.id = ?
   GROUP BY b.id;`,
  [bookingId]
);


    if (rows.length === 0) {
      return res.status(404).json({ message: "Ingen bokning hittades" });
    }

  

    res.json(rows[0]);
  } catch (err: any) {
    console.error("❌ Fel vid hämtning av bokning:", err);
    res.status(500).json({ error: err.message });
  }
});





export default router;