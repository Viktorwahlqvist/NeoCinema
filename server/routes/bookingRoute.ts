import express, { Request } from "express";
import { db } from "../db.js";
import {ResultSetHeader, RowDataPacket,  PoolConnection,} from "mysql2/promise";
import crypto from 'crypto';
import randomNumber from "../utils/randomNumber.js";
import { sendEmail } from "./Mailer.js";
import { broadcastSeatUpdate } from "../services/sseRoute.js";
import "../utils/session.d.js"; // load global session types
import { Seat, SeatInput, TicketLine } from "./types.js"; 
import { requireRole, ROLES } from "../utils/acl.js";
import { formatScreeningTime } from "../utils/date.js"; 
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const router = express.Router();
type TicketRow = TicketLine & RowDataPacket;

// function to get all booking details
async function getBookingDetails(
  bookingId: number,
  connection: PoolConnection | typeof db
) {
  
 // gets movie time etc
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
  const ticketSql = `
    SELECT t.ticketType, t.price, COUNT(*) AS qty
    FROM bookingXSeats bx
    JOIN tickets t ON t.id = bx.ticketTypeId
    WHERE bx.bookingId = ?  -- <-- VI KONTROLLERAR OM DETTA FINNS
    GROUP BY t.id
  `;
  const [ticketRows] = await connection.query<TicketRow[]>(ticketSql, [bookingId]);
  const totalPrice = ticketRows.reduce((sum, t) => sum + t.price * t.qty, 0);

  // gets specifik chairs
  const seatSql = `
    SELECT s.row_num, s.seat_num
    FROM bookingXSeats bx
    JOIN seats s ON s.id = bx.seatId
    WHERE bx.bookingId = ?  -- <-- VI KONTROLLERAR OM DETTA FINNS
    ORDER BY s.row_num, s.seat_num
  `;

  const [seatRows] = await connection.query<RowDataPacket[]>(seatSql, [bookingId]);
  const seatNumbers = seatRows.map(
    (s) => `Rad ${s.row_num}, Plats ${s.seat_num}`
  );

  return { screening, tickets: ticketRows, seatNumbers, totalPrice };
}

/*
 * POST /bookings
 */
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
      .json({ message: "Guest email required when not logged in" });
  }

  let connection: PoolConnection | undefined;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check availability
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

    // Generate Tokens & QR Code
    // Retrieve screening info to calculate expiration
    const [screeningRows] = await connection.query<RowDataPacket[]>(
      `SELECT start_time FROM screenings WHERE id = ?`,
      [screeningId]
    );
    const screeningStartTime = new Date(screeningRows[0].start_time);
    
    // Token expires 2 hours before the movie starts
    const expires = new Date(screeningStartTime.getTime() - 2 * 60 * 60 * 1000);
    const token = crypto.randomBytes(32).toString("hex");
    const bookingNumber = randomNumber();

    // Generate QR Code Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(bookingNumber, {
      color: { dark: "#000000", light: "#ffffff" },
      width: 200,
      margin: 1,
    });

    // Load logo from disk
    let logoBuffer: Buffer | null = null;
    try {
      const logoPath = path.join(process.cwd(), "public", "NeoCinema.png");
      logoBuffer = fs.readFileSync(logoPath);
    } catch (err) {
      console.warn("Could not load email logo:", err);
    }

    // Insert Booking
    const [bookingRes] = await connection.query<ResultSetHeader>(
      `INSERT INTO bookings (bookingNumber, userId, screeningId, date, guestEmail, cancellation_token, cancellation_token_expires)
       VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
      [
        bookingNumber,
        userId,
        screeningId,
        userId ? null : guestEmail,
        token,
        expires,
      ]
    );
    const bookingId = bookingRes.insertId;

    // 4. Insert Seats
    const seatValues = seats.map((s: SeatInput) => [
      bookingId,
      s.seatId,
      s.ticketType,
    ]);
    await connection.query(
      "INSERT INTO bookingXSeats (bookingId, seatId, ticketTypeId) VALUES ?",
      [seatValues]
    );

    // Get Details for Email
    const { screening, tickets, seatNumbers, totalPrice } =
      await getBookingDetails(bookingId, connection);

    // Construct Email
    const formattedScreeningTime = formatScreeningTime(screening.start_time);
    const ticketsHtmlList = tickets
      .map(
        (t: TicketRow) =>
          `<li style="margin-bottom: 5px;">${t.qty} × ${t.ticketType} (Totalt: ${t.qty * t.price} kr)</li>`
      )
      .join("");
    const seatsHtmlList = seatNumbers
      .map((s) => `<li style="margin-bottom: 5px;">${s}</li>`)
      .join("");

    // Determine recipient
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

    const publicUrl = process.env.PUBLIC_URL || "http://localhost:3000";
    const cancelUrl = `${publicUrl}/avboka/${token}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px; width: 100%;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <table style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #121212; color: #eaeaea; border-radius: 8px; overflow: hidden; border: 2px solid #00BFFF;">
                <tr>
                  <td style="padding: 30px 40px 10px 40px; text-align: center;">
                    <img src="cid:logo" alt="NeoCinema" style="width: 200px; max-width: 90%; height: auto;">
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px 40px 40px;">
                    <h2 style="color: #ffffff; margin-top: 0; text-align: center;">Tack för din bokning!</h2>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                      <tr>
                        <td valign="top" width="60%" style="padding-right: 15px;">
                           <p style="font-size: 1em; margin-bottom: 5px; margin-top: 0; color: #aaa;">Bokningsnummer:</p>
                           <p style="font-size: 1.4em; color: #BF00FF; margin: 0 0 20px 0; font-weight: bold; letter-spacing: 1px;">${bookingNumber}</p>
                           <p style="margin: 5px 0;"><b>Film:</b> <span style="color: #00BFFF;">${screening.title}</span></p>
                           <p style="margin: 5px 0;"><b>Salong:</b> ${screening.auditoriumName}</p>
                           <p style="margin: 5px 0;"><b>Tid:</b> ${formattedScreeningTime}</p>
                        </td>
                        <td valign="top" width="40%" style="text-align: center;">
                          <div style="background: #ffffff; padding: 10px; border-radius: 8px; display: inline-block;">
                            <img src="cid:qrcode" alt="QR Kod" style="width: 100%; max-width: 150px; height: auto; display: block;">
                          </div>
                          <p style="font-size: 0.8em; color: #aaa; margin-top: 5px;">Skanna vid entrén</p>
                        </td>
                      </tr>
                    </table>
                    <hr style="border: 0; border-top: 2px solid #00BFFF; margin: 30px 0;">
                    <h3 style="color: #ffffff;">Biljetter</h3>
                    <ul style="list-style-type: none; padding-left: 10px; margin: 0;">${ticketsHtmlList}</ul>
                    <h3 style="color: #ffffff; margin-top: 25px;">Platser</h3>
                    <ul style="list-style-type: none; padding-left: 10px; margin: 0;">${seatsHtmlList}</ul>
                    <hr style="border: 0; border-top: 2px solid #00BFFF; margin: 30px 0;">
                    <p style="font-size: 1.3em; color: #ffffff; margin-bottom: 30px;"><b>Totalt pris: ${totalPrice} kr</b></p>
                    <p style="text-align: center; margin: 20px 0;">
                      <a href="${cancelUrl}" style="color: #FF5555; text-decoration: underline;">Avboka din bokning (Länken är gilltig max 2 timmar innan filmen börjar)</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>`;

    if (recipientEmail) {
      const base64Data = qrCodeDataUrl.split(";base64,").pop();
      const attachments: any[] = [
        {
          filename: "qrcode.png",
          content: base64Data,
          encoding: "base64",
          cid: "qrcode",
        },
      ];

      if (logoBuffer) {
        attachments.push({
          filename: "NeoCinema.png",
          content: logoBuffer,
          cid: "logo",
        });
      }

      await sendEmail({
        to: recipientEmail,
        subject: `Bekräftelse – ${screening.title} (Nr: ${bookingNumber})`,
        html: emailHtml,
        attachments: attachments,
      });
    }

    // Commit & Broadcast
    await connection.commit();
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
 * GET /confirmation/:bookingNumber
 * Get a specific booking by its non-guessable number.
 * This is a PUBLIC route for guest and user confirmation pages.
 */
router.get("/confirmation/:bookingNumber", async (req, res) => {
  const { bookingNumber } = req.params;
  try {
    // 1. Hämta huvud-information
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
    const { tickets, seatNumbers } = await getBookingDetails(
      bookingId,
      db
    );

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

      if (
        booking.userId !== sessionUser.id &&
        sessionUser.role !== ROLES.ADMIN
      ) {
        await connection.rollback();
        return res
          .status(403)
          .json({ error: "Du har inte behörighet att avboka detta" });
      }

      // Time controll (two hours maximum)
      const screeningTime = new Date(booking.start_time).getTime();
      const twoHoursBefore = screeningTime - 2 * 60 * 60 * 1000;
      const now = Date.now();

      if (now > twoHoursBefore) {
        await connection.rollback();
        return res
          .status(403)
          .json({ error: "Tidsgränsen för avbokning har passerat (2 timmar)" });
      }

      // Get seatIds before deleting them
      const [seatRows] = await connection.query<RowDataPacket[]>(
        "SELECT seatId FROM bookingXSeats WHERE bookingId = ?",
        [bookingId]
      );

      await connection.query<ResultSetHeader>(
        "DELETE FROM bookingXSeats WHERE bookingId = ?",
        [bookingId]
      );

      // Delete booking
      await connection.query<ResultSetHeader>(
        "DELETE FROM bookings WHERE id = ?",
        [bookingId]
      );

      await connection.commit();

      // Message SSE client
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
  }
);

/*
 * GET /cancel-details/:token
 * Securely gets booking details for a cancellation page. Public.
 */
router.get("/cancel-details/:token", async (req, res) => {
  const { token } = req.params;
  
  // Find a booking with a VALID (non-expired) token
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT b.id, m.title, s.start_time
     FROM bookings b
     JOIN screenings s ON b.screeningId = s.id
     JOIN movies m ON m.id = s.movie_id
     WHERE b.cancellation_token = ? AND b.cancellation_token_expires > NOW()`,
    [token]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Länken är ogiltig eller har gått ut." });
  }
  
  // Return only non-sensitive info
  res.json({
    movieTitle: rows[0].title,
    screeningTime: rows[0].start_time,
  });
});

/*
 * POST /cancel
 * Performs the actual cancellation via a token. Public.
 */
router.post("/cancel", async (req, res) => {
  const { token } = req.body; // Receive token in body for extra security
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [bookingRows] = await connection.query<RowDataPacket[]>(
      `SELECT b.id, s.id as screeningId
       FROM bookings b
       JOIN screenings s ON b.screeningId = s.id
       WHERE b.cancellation_token = ? AND b.cancellation_token_expires > NOW()
       LIMIT 1 FOR UPDATE`, // Lock the row to prevent race conditions
      [token]
    );

    if (bookingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Länken är ogiltig eller har redan använts." });
    }
    
    const { id: bookingId, screeningId } = bookingRows[0];

    // Get seatIds BEFORE deletion (for SSE)
    const [seatRows] = await connection.query<RowDataPacket[]>(
      "SELECT seatId FROM bookingXSeats WHERE bookingId = ?",
      [bookingId]
    );

    // Delete related seats and the booking itself
    await connection.query("DELETE FROM bookingXSeats WHERE bookingId = ?", [bookingId]);
    await connection.query("DELETE FROM bookings WHERE id = ?", [bookingId]);
    
    await connection.commit();
    
    // Broadcast seat availability
    const seatIds: number[] = seatRows.map((row) => row.seatId);
    broadcastSeatUpdate({
      seatIds,
      status: "available",
      screeningId: screeningId,
    });

    res.status(200).json({ message: "Bokningen är avbokad." });
  } catch (e) {
    if (connection) await connection.rollback();
    console.error("Error cancelling with token:", e);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});

export default router;