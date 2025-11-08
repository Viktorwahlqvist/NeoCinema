import express, { Request } from "express";
import { db } from "../db.js";
import {
  ResultSetHeader,
  RowDataPacket,
  PoolConnection,
} from "mysql2/promise";
import randomNumber from "../utils/randomNumber.js";
import { sendEmail } from "./Mailer.js";
import { broadcastSeatUpdate } from "../services/sseRoute.js";
import "../utils/session.d.js"; // Loads global session types
import { Seat, SeatInput, TicketLine } from "./types.js"; // Import central types
import { requireRole, ROLES } from "../utils/acl.js";
import { formatScreeningTime } from "../utils/date.js";

const router = express.Router();

// Define a specific type for the ticket summary query
type TicketRow = TicketLine & RowDataPacket;

/**
 * Helper function to gather all booking details (movie, tickets, seats).
 * This helps keep the main routes DRY (Don't Repeat Yourself).
 * @param connection Can be a PoolConnection (for transactions) or the base db pool.
 */
async function getBookingDetails(
  bookingId: number,
  connection: PoolConnection | typeof db
) {
  // Get screening info (movie title, time, auditorium)
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

  // Get ticket summary (e.g., 2x Adult, 1x Child)
  const [ticketRows] = await connection.query<TicketRow[]>(
    `SELECT t.ticketType, t.price, COUNT(*) AS qty
       FROM bookingXSeats bx
       JOIN tickets t ON t.id = bx.ticketTypeId
     WHERE bx.bookingId = ?
       GROUP BY t.id`,
    [bookingId]
  );
  const totalPrice = ticketRows.reduce((sum, t) => sum + t.price * t.qty, 0);

  // Get specific seat numbers
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

  return { screening, tickets: ticketRows, seatNumbers, totalPrice };
}

/*
 * POST /bookings
 * Creates a new booking for a logged-in user or a guest.
 * Runs inside a database transaction to ensure data integrity.
 */
router.post("/bookings", async (req, res) => {
  const { screeningId, seats, guestEmail } = req.body;
  const userId = req.session.user?.id || null;

  // Validation
  if (!screeningId || !seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: "Missing screeningId or seats" });
  }
  if (!userId && !guestEmail) {
    return res
      .status(400)
      .json({ message: "guestEmail required when not logged in" });
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Check if all requested seats are still available
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

    // 2. Create the main booking record
    const bookingNumber = randomNumber();
    const [bookingRes] = await connection.query<ResultSetHeader>(
      `INSERT INTO bookings (bookingNumber, userId, screeningId, date, guestEmail)
       VALUES (?, ?, ?, NOW(), ?)`,
      [bookingNumber, userId, screeningId, userId ? null : guestEmail]
    );
    const bookingId = bookingRes.insertId;

    // 3. Insert all booked seats into the pivot table
    const seatValues = seats.map((s: SeatInput) => [
      bookingId,
      s.seatId,
      s.ticketType,
    ]);
    await connection.query(
      "INSERT INTO bookingXSeats (bookingId, seatId, ticketTypeId) VALUES ?",
      [seatValues]
    );

    // 4. Get full booking details for the confirmation email
    const { screening, tickets, seatNumbers, totalPrice } =
      await getBookingDetails(bookingId, connection);

    // 5. Build and send confirmation email
    const formattedScreeningTime = formatScreeningTime(screening.start_time); // <-- BUG FIX
    const ticketsHtmlList = tickets
      .map(
        (t: TicketRow) => // <-- Improved type safety (no 'any')
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

    const publicUrl = process.env.PUBLIC_URL || "http://localhost:3000"; // Fallback för utveckling
    const logoUrl = `${publicUrl}/NeoCinema.png`;

    // --- Ny, snyggare e-postmall ---
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px; width: 100%;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <table style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #121212; color: #eaeaea; border-radius: 8px; overflow: hidden;">
                
                <tr>
                  <td style="padding: 30px 40px 10px 40px; text-align: center;">
                    <img src="${logoUrl}" alt="NeoCinema Logotyp" style="width: 200px; max-width: 90%; height: auto;">
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px 40px 40px 40px;">
                    <h2 style="color: #ffffff; margin-top: 0;">Tack för din bokning!</h2>
                    <p>Här är din bekräftelse för din visning hos NeoCinema.</p>
                    <br>
                    
                    <p style="font-size: 1.1em; margin-bottom: 5px;">Bokningsnummer:</p>
                    <p style="font-size: 2em; color: #BF00FF; margin: 0; font-weight: bold; letter-spacing: 1px;">
                      ${bookingNumber}
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #444444; margin: 30px 0;">
                    
                    <h3 style="color: #ffffff;">Bokningsdetaljer</h3>
                    <p style="margin: 5px 0;">
                      <b>Film:</b> 
                      <span style="color: #00BFFF; font-weight: bold;">${screening.title}</span>
                    </p>
                    <p style="margin: 5px 0;"><b>Salong:</b> ${screening.auditoriumName}</p>
                    <p style="margin: 5px 0;"><b>Tid:</b> ${formattedScreeningTime}</p>
                    
                    <h3 style="color: #ffffff; margin-top: 25px;">Biljetter</h3>
                    <ul style="list-style-type: none; padding-left: 10px; margin: 0;">
                      ${ticketsHtmlList}
                    </ul>
                    
                    <h3 style="color: #ffffff; margin-top: 25px;">Platser</h3>
                    <ul style="list-style-type: none; padding-left: 10px; margin: 0;">
                      ${seatsHtmlList}
                    </ul>
                    
                    <hr style="border: 0; border-top: 1px solid #444444; margin: 30px 0;">
                    
                    <p style="font-size: 1.3em; color: #ffffff; margin-bottom: 30px; text-align: left;">
                      <b>Totalt pris: ${totalPrice} kr</b>
                    </p>
                    
                    <p style="font-size: 0.9em; color: #888888; text-align: center; margin-bottom: 0;">
                      Vi ser fram emot att se dig på bion!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    if (recipientEmail) {
      await sendEmail({
        to: recipientEmail,
        subject: `Bekräftelse – ${screening.title} (Nr: ${bookingNumber})`,
        html: emailHtml,
      });
    }

    // 6. Commit the transaction
    await connection.commit();

    // 7. Notify all connected SSE clients of the seat update
    broadcastSeatUpdate({
      seatIds: seats.map((s: SeatInput) => s.seatId),
      status: "booked",
      screeningId: Number(screeningId),
    });

    res.status(201).json({
      message: "Booking created",
      bookingId: bookingId,
      bookingNumber: bookingNumber,
      seats: seats.map((s: SeatInput) => s.seatId),
    });
  } catch (e: any) {
    if (connection) await connection.rollback();
    console.error("Booking error:", e);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});

/*
 * GET /
 * Get all bookings for the *currently logged-in* user.
 * Protected: USER or ADMIN.
 */
router.get("/", requireRole([ROLES.USER, ROLES.ADMIN]), async (req, res) => {
  const userId = req.session.user!.id; // Get user ID from session, not query

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

/*
 * GET /:bookingId
 * Get a specific booking by its ID.
 * Protected: Only the USER who owns it or an ADMIN.
 */
router.get(
  "/:bookingId",
  requireRole([ROLES.USER, ROLES.ADMIN]),
  async (req, res) => {
    const { bookingId } = req.params;
    const sessionUser = req.session.user!;

    try {
      // 1. Get main booking info
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
      if (!rows.length)
        return res.status(404).json({ message: "Not found" });

      const booking = rows[0];

      // 2. Security Check: User must own the booking or be an admin
      if (
        booking.userId !== sessionUser.id &&
        sessionUser.role !== ROLES.ADMIN
      ) {
        return res
          .status(403)
          .json({ error: "Du har inte behörighet att se denna bokning" });
      }

      // 3. Get the rest of the details using the helper
      const { tickets, seatNumbers } = await getBookingDetails(
        Number(bookingId),
        db
      );

      // 4. Build and send response
      res.json({
        ...booking,
        tickets,
        seatNumbers,
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/*
 * GET /confirmation/:bookingNumber
 * Get a specific booking by its non-guessable number.
 * This is a PUBLIC route for guest and user confirmation pages.
 */
router.get("/confirmation/:bookingNumber", async (req, res) => {
  const { bookingNumber } = req.params;
  try {
    // 1. Get main booking info
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT b.id AS bookingId, b.bookingNumber, b.date,
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
       WHERE b.bookingNumber = ?
       GROUP BY b.id`,
      [bookingNumber]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Bokningen hittades inte" });

    const booking = rows[0];
    const bookingId = booking.bookingId;

    // 2. Get the rest of the details using the helper
    const { tickets, seatNumbers } = await getBookingDetails(
      bookingId,
      db
    );

    // 3. Build and send response
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

/*
 * DELETE /bookings/:id
 * Cancels (deletes) a booking.
 * Protected: Only the USER who owns it or an ADMIN.
 */
router.delete(
  "/:bookingId",
  requireRole([ROLES.USER, ROLES.ADMIN]),
  async (req, res) => {
    const { bookingId } = req.params;
    const sessionUser = req.session.user!;
    let connection;

    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // 1. Get booking info, including owner ID and screening time
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

      // 2. Security Check: User must own the booking or be an admin
      if (
        booking.userId !== sessionUser.id &&
        sessionUser.role !== ROLES.ADMIN
      ) {
        await connection.rollback();
        return res
          .status(403)
          .json({ error: "Du har inte behörighet att avboka detta" });
      }

      // 3. Time-limit Check: Cannot cancel within 2 hours of screening
      const screeningTime = new Date(booking.start_time).getTime();
      const twoHoursBefore = screeningTime - 2 * 60 * 60 * 1000;
      const now = Date.now();

      if (now > twoHoursBefore) {
        await connection.rollback();
        return res
          .status(403)
          .json({ error: "Tidsgränsen för avbokning har passerat (2 timmar)" });
      }

      // 4. Get seat IDs *before* deleting, for the SSE broadcast
      const [seatRows] = await connection.query<RowDataPacket[]>(
        "SELECT seatId FROM bookingXSeats WHERE bookingId = ?",
        [bookingId]
      );

      // 5. Delete from pivot table first (due to foreign key constraints)
      await connection.query<ResultSetHeader>(
        "DELETE FROM bookingXSeats WHERE bookingId = ?",
        [bookingId]
      );

      // 6. Delete main booking record
      await connection.query<ResultSetHeader>(
        "DELETE FROM bookings WHERE id = ?",
        [bookingId]
      );

      // 7. Commit transaction
      await connection.commit();

      // 8. Notify all connected SSE clients of the seat update
      const seatIds: number[] = seatRows.map((row) => row.seatId);
      broadcastSeatUpdate({
        seatIds,
        status: "available",
        screeningId: booking.screeningId,
      });

      res.status(200).json({ message: "Bokningen har avbokats" });
    } catch (e) {
      if (connection) await connection.rollback();
      console.error("!!! UNEXPECTED CANCELLATION ERROR:", e);
      res.status(500).json({ error: "Serverfel vid avbokning" });
    } finally {
      if (connection) connection.release();
    }
  }
);

export default router;