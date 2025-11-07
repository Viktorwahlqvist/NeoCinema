import express, { Request } from "express";
import { db } from "../db.js";
import {ResultSetHeader, RowDataPacket, PoolConnection,} from "mysql2/promise";
import randomNumber from "../utils/randomNumber.js";
import { sendEmail } from "./Mailer.js";
import { broadcastSeatUpdate } from "../services/sseRoute.js"; // SSE functions
import "../utils/session.d.js"; // Sessiion types
import { Seat, SeatInput } from "./types.js"; 
import { requireRole, ROLES } from "../utils/acl.js"; // Auth middleware
import {formatScreeningTime} from "../utils/date.js"



const router = express.Router();

// Gets all the nessary booking details for confirmation email/page
// This has to be run inside a transaction
async function getBookingDetails(
  bookingId: number,
  connection: PoolConnection
) {
  // Gets screening info (time, movie, auditorium)
  const [screeningRows] = await connection.query<RowDataPacket[]>(
    `SELECT m.title, s.start_time, a.name AS auditoriumName
       FROM bookings b
       JOIN screenings s ON b.screeningId = s.id
       JOIN movies m ON m.id = s.movie_id
       JOIN auditoriums a ON a.id = s.auditorium_id
       WHERE b.id = ?`,
    [bookingId]
  );
  const screening = screeningRows[0];

  // Gets ticket summary
  const [ticketRows] = await connection.query<RowDataPacket[]>(
    `SELECT t.ticketType, t.price, COUNT(*) AS qty
       FROM bookingXSeats bx
       JOIN tickets t ON t.id = bx.ticketTypeId
     WHERE bx.bookingId = ?
       GROUP BY t.id`,
    [bookingId]
  );
  const totalPrice = ticketRows.reduce((sum, t) => sum + t.price * t.qty, 0);

  // Gets seat numbers
  const [seatRows] = await connection.query<RowDataPacket[]>(
    `SELECT s.row_num, s.seat_num
       FROM bookingXSeats bx
       JOIN seats s ON s.id = bx.seatId
     WHERE bx.bookingId = ?
       ORDER BY s.row_num, s.seat_num`,
    [bookingId]
  );
  const seatNumbers = seatRows.map(
    (s) => `Rad ${s.row_num}, Plats ${s.seat_num}`
  );

  return { screening, ticketRows, seatNumbers, totalPrice };
}



/* ----------  POST /bookings  ---------- */
router.post("/bookings", async (req, res) => {
  const { screeningId, seats, guestEmail } = req.body;
  const userId = req.session.user?.id || null;

  if (!screeningId || !seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: "Missing screeningId or seats" });
  }
  if (!userId && !guestEmail) {
    return res
      .status(400)
      .json({ message: "guestEmail required when not logged in" });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check seat availability
    const [seatsRows] = await connection.query<Seat[] & RowDataPacket[]>(
      "SELECT * FROM seatStatusView WHERE screeningId = ?",
      [screeningId]
    );
    const available = seatsRows.filter((s) => s.seatStatus === "available");
    const allAvailable = seats.every((wanted: SeatInput) =>
      available.some((a) => a.seatId === wanted.seatId)
    );
    if (!allAvailable) {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: "One or more seats already booked" });
    }

    // Create booking
    const bookingNumber = randomNumber();
    const [bookingRes] = await connection.query<ResultSetHeader>(
      `INSERT INTO bookings (bookingNumber, userId, screeningId, date, guestEmail)
       VALUES (?, ?, ?, NOW(), ?)`,
      [bookingNumber, userId, screeningId, userId ? null : guestEmail]
    );
    const bookingId = bookingRes.insertId;
    const seatValues = seats.map((s: SeatInput) => [
      bookingId,
      s.seatId,
      s.ticketType,
    ]);
    await connection.query(
      "INSERT INTO bookingXSeats (bookingId, seatId, ticketTypeId) VALUES ?",
      [seatValues]
    );

    // Gets all email data
    const { screening, ticketRows, seatNumbers, totalPrice } =
      await getBookingDetails(bookingId, connection);

   
    const formattedScreeningTime = formatScreeningTime(screening.start_time);
    const ticketsHtmlList = ticketRows
      .map(
        (t: any) =>
          `<li>${t.qty} × ${t.ticketType} (Totalt: ${t.qty * t.price} kr)</li>`
      )
      .join("");
    const seatsHtmlList = seatNumbers.map((s) => `<li>${s}</li>`).join("");

    let recipientEmail: string | null = null;
    if (userId) {
      const [userRows] = await connection.query<RowDataPacket[]>(
        "SELECT email FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
      if (userRows.length > 0) recipientEmail = userRows[0].email;
    } else {
      recipientEmail = guestEmail;
    }
    // Build email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Tack för din bokning!</h2>
        <p>Bokningsnummer: <b>${bookingNumber}</b></p>
        <p>Film: ${screening.title}</p>
        <p>Salong: ${screening.auditoriumName}</p>
        <p>Tid: ${formattedScreeningTime}</p>
        <h3>Biljetter</h3>
        <ul style="list-style-type: none; padding-left: 0;">${ticketsHtmlList}</ul>
        <h3>Platser</h3>
        <ul style="list-style-type: none; padding-left: 0;">${seatsHtmlList}</ul>
        <hr>
        <p style="font-size: 1.2em;"><b>Totalt pris: ${totalPrice} kr</b></p>
      </div>`;

    if (recipientEmail) {
      await sendEmail({
        to: recipientEmail,
        subject: `Bekräftelse – ${screening.title} (Nr: ${bookingNumber})`,
        html: emailHtml,
      });
    }
    await connection.commit();

    // Tells SSE clients which seats are now booked
    broadcastSeatUpdate({
      seatIds: seats.map((s: SeatInput) => s.seatId),
      status: "booked",
      screeningId: Number(screeningId),
    });

    res.status(201).json({
      message: "Booking created",
      bookingId,
      bookingNumber,
    });
  } catch (e: any) {
    if (connection) await connection.rollback();
    console.error("Booking error:", e);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});

/* ----------  GET / (Hämta MINA bokningar)  ---------- */
router.get("/", requireRole([ROLES.USER, ROLES.ADMIN]), async (req, res) => {
  const userId = req.session.user!.id; 

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT b.id          AS bookingId,
              b.bookingNumber, b.date,
              m.title         AS movieTitle,
              s.start_time    AS screeningTime,
              a.name          AS auditoriumName,
              SUM(t.price)    AS totalPrice
       FROM bookings b
       JOIN screenings s ON s.id = b.screeningId
       JOIN movies m ON m.id = s.movie_id
       JOIN auditoriums a ON a.id = s.auditorium_id
       JOIN bookingXSeats bx ON bx.bookingId = b.id
       JOIN tickets t ON t.id = bx.ticketTypeId
       WHERE b.userId = ?
       GROUP BY b.id
       ORDER BY b.date DESC`,
      [userId]
    );
    res.json({ bookings: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ----------  GET /:bookingId (Bekräftelsesida)  ---------- */
// Security: Checks if user owns booking or is admin
router.get("/:bookingId", requireRole([ROLES.USER, ROLES.ADMIN]), async (req, res) => {
  const { bookingId } = req.params;
  const sessionUser = req.session.user!;

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT b.id AS bookingId, b.bookingNumber, b.date, b.userId,
             m.title AS movieTitle, s.start_time AS screeningTime, a.name AS auditoriumName,
             COALESCE(u.email, b.guestEmail) AS email,
             SUM(t.price) AS totalPrice
       FROM bookings b
       LEFT JOIN users u ON u.id = b.userId
       JOIN screenings s ON s.id = b.screeningId
       JOIN movies m ON m.id = s.movie_id
       JOIN auditoriums a ON a.id = s.auditorium_id
       JOIN bookingXSeats bx ON bx.bookingId = b.id
       JOIN tickets t ON t.id = bx.ticketTypeId
       WHERE b.id = ?
       GROUP BY b.id`,
      [bookingId]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });

    const booking = rows[0];

    // Security check: Does the user own this booking OR is admin?
    if (booking.userId !== sessionUser.id && sessionUser.role !== ROLES.ADMIN) {
      return res
        .status(403)
        .json({ error: "Du har inte behörighet att se denna bokning" });
    }
    const [tickets] = await db.query<RowDataPacket[]>(
      `SELECT t.ticketType, t.price, COUNT(*) AS qty
       FROM bookingXSeats bx JOIN tickets t ON t.id = bx.ticketTypeId
       WHERE bx.bookingId = ? GROUP BY t.id`,
      [bookingId]
    );

    const [seatRows] = await db.query<RowDataPacket[]>(
      `SELECT s.row_num, s.seat_num
       FROM bookingXSeats bx JOIN seats s ON s.id = bx.seatId
       WHERE bx.bookingId = ? ORDER BY s.row_num, s.seat_num`,
      [bookingId]
    );
    const seatNumbers = seatRows.map(
      (seat) => `Rad ${seat.row_num}, Plats ${seat.seat_num}`
    );

    // Build ans send response
    res.json({
      ...booking,
      tickets,
      seatNumbers,
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ----------  DELETE /bookings/:id  ---------- */
router.delete("/:bookingId", requireRole([ROLES.USER, ROLES.ADMIN]), async (req, res) => {
  const { bookingId } = req.params;
  const sessionUser = req.session.user!;
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [bookingRows] = await connection.query<RowDataPacket[]>(
      `SELECT
         b.userId,
         s.start_time,
         s.id as screeningId
       FROM bookings b
       JOIN screenings s ON b.screeningId = s.id
       WHERE b.id = ? LIMIT 1`,
      [bookingId]
    );

    if (bookingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Bokningen hittades inte" });
    }
    const booking = bookingRows[0];

    // SECURITY CHECK: Does the user own this booking OR is admin?
    if (booking.userId !== sessionUser.id && sessionUser.role !== ROLES.ADMIN) {
      await connection.rollback();
      return res
        .status(403)
        .json({ error: "Du har inte behörighet att avboka detta" });
    }

    // Time control: Can only cancel up to 2 hours before screening
    const screeningTime = new Date(booking.start_time).getTime();
    const twoHoursBefore = screeningTime - 2 * 60 * 60 * 1000;
    const now = Date.now();

    if (now > twoHoursBefore) {
      await connection.rollback();
      return res
        .status(403)
        .json({ error: "Tidsgränsen för avbokning har passerat (2 timmar)" });
    }

    // Get seatIds before deletion
    const [seatRows] = await connection.query<RowDataPacket[]>(
      "SELECT seatId FROM bookingXSeats WHERE bookingId = ?",
      [bookingId]
    );

    // Delete seats from bookingXSeats
    await connection.query<ResultSetHeader>(
      "DELETE FROM bookingXSeats WHERE bookingId = ?",
      [bookingId]
    );

    // Delete booking
    await connection.query<ResultSetHeader>("DELETE FROM bookings WHERE id = ?", [
      bookingId,
    ]);

    await connection.commit();

    // tell SSE client which seats freed up
    const seatIds: number[] = seatRows.map((row) => row.seatId);
    broadcastSeatUpdate({
      seatIds,
      status: "available",
      screeningId: booking.screeningId,
    });

    res.status(200).json({ message: "Bokningen har avbokats" });
  } catch (e) {
    if (connection) await connection.rollback();
    console.error("!!! OVÄNTAT SERVERFEL VID AVBOKNING:", e);
    res.status(500).json({ error: "Serverfel vid avbokning" });
  } finally {
    if (connection) connection.release();
  }
});

export default router;