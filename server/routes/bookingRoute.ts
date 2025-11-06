import express from "express";
import { db } from "../db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import randomNumber from "../utils/randomNumber.js";
import { sendEmail } from "./Mailer.js"; 
import "../utils/session.d.js";
import { Seat, SeatInput } from "./types.ts";

const router = express.Router();

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

    // 1. Make sure all requested seats are still available
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

    // 2. Create the booking
    const bookingNumber = randomNumber();
    const [bookingRes] = await connection.query<ResultSetHeader>(
      `INSERT INTO bookings (bookingNumber, userId, screeningId, date, guestEmail)
       VALUES (?, ?, ?, NOW(), ?)`,
      [bookingNumber, userId, screeningId, userId ? null : guestEmail]
    );
    const bookingId = bookingRes.insertId;

    // 3. Insert seats
    const seatValues = seats.map((s: SeatInput) => [
      bookingId,
      s.seatId,
      s.ticketType,
    ]);
    await connection.query(
      "INSERT INTO bookingXSeats (bookingId, seatId, ticketTypeId) VALUES ?",
      [seatValues]
    );

    // ==========================================================
    // === 4. BYGG BEKRÄFTELSE-DATA (UPPDATERAD) ================
    // ==========================================================

    // Hämta film/salong/tid
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT m.title, s.start_time, a.name
         FROM screenings s
         JOIN movies m ON m.id = s.movie_id
         JOIN auditoriums a ON a.id = s.auditorium_id
       WHERE s.id = ?`,
      [screeningId]
    );
    const screening = rows[0];
    const formattedScreeningTime = new Date(
      screening.start_time
    )


    // Hämta biljettsammanfattning (t.ex. 2x Vuxen)
    const [ticketRows] = await connection.query<RowDataPacket[]>(
      `SELECT t.ticketType, t.price, COUNT(*) AS qty
         FROM bookingXSeats bx
         JOIN tickets t ON t.id = bx.ticketTypeId
       WHERE bx.bookingId = ?
       GROUP BY t.id`,
      [bookingId]
    );
    const totalPrice = ticketRows.reduce((sum, t) => sum + t.price * t.qty, 0);

    // NYTT: Bygg HTML-listan för biljetter
    const ticketsHtmlList = ticketRows
      .map(
        (t) =>
          `<li>${t.qty} × ${t.ticketType} (Totalt: ${t.qty * t.price} kr)</li>`
      )
      .join("");

    // NYTT: Hämta stolsnummer (t.ex. Rad 1, Plats 5)
    const [seatRows] = await connection.query<RowDataPacket[]>(
      `SELECT s.row_num, s.seat_num
         FROM bookingXSeats bx
         JOIN seats s ON s.id = bx.seatId
       WHERE bx.bookingId = ?
       ORDER BY s.row_num, s.seat_num`,
      [bookingId]
    );

    // NYTT: Bygg HTML-listan för platser
    const seatsHtmlList = seatRows
      .map((s) => `<li>Rad ${s.row_num}, Plats ${s.seat_num}</li>`)
      .join("");

    // NYTT: Hämta mottagarens e-post
    let recipientEmail: string | null = null;
    if (userId) {
      const [userRows] = await connection.query<RowDataPacket[]>(
        "SELECT email FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
      if (userRows.length > 0) {
        recipientEmail = userRows[0].email;
      }
    } else {
      recipientEmail = guestEmail;
    }

    // ==========================================================
    // === 5. SKICKA E-POST MED NYA MALLEN =======================
    // ==========================================================
    
    // Bygg den uppdaterade HTML-mallen
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Tack för din bokning!</h2>
        <p>Här är din bekräftelse för din visning hos NeoCinema.</p>
        
        <hr>
        
        <h3>Bokningsdetaljer</h3>
        <p><b>Bokningsnummer:</b> ${bookingNumber}</p>
        <p><b>Film:</b> ${screening.title}</p>
        <p><b>Salong:</b> ${screening.name}</p>
        <p><b>Tid:</b> ${formattedScreeningTime}</p>
        
        <h3>Biljetter</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          ${ticketsHtmlList}
        </ul>
        
        <h3>Platser</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          ${seatsHtmlList}
        </ul>

        <hr>
        
        <p style="font-size: 1.2em;">
          <b>Totalt pris: ${totalPrice} kr</b>
        </p>
        
        <p style="font-size: 0.9em; color: #555;">
          Vi ser fram emot att se dig på bion!
        </p>
      </div>
    `;

    if (recipientEmail) {
      await sendEmail({
        to: recipientEmail,
        subject: `Bekräftelse – ${screening.title} (Nr: ${bookingNumber})`,
        html: emailHtml,
      });
    }

    // ==========================================================
    // === 6. GENOMFÖR TRANSAKTION OCH SKICKA SVAR ============
    // ==========================================================
    
    await connection.commit();

    res.status(201).json({
      message: "Booking created",
      bookingId,
      bookingNumber,
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

/* ----------  GET /api/bookings?userId=XX  ---------- */
// (Din befintliga GET-route)
router.get("/", async (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) return res.status(400).json({ message: "userId required" });

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT b.id            AS bookingId,
              b.bookingNumber,
              b.date,
              m.title           AS movieTitle,
              s.start_time      AS screeningTime,
              a.name            AS auditoriumName,
              SUM(t.price)      AS totalPrice
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

/* ----------  GET /bookings/:id (för bekräftelsesidan)  ---------- */
// (Denna route är nu uppdaterad för att skicka 'seatNumbers' till frontend)
router.get("/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
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
       WHERE b.id = ?
       GROUP BY b.id`,
      [bookingId]
    );
    if (!rows.length) return res.status(404).json({ message: "Not found" });

    // 2. Hämta biljett-sammanfattning
    const [tickets] = await db.query<RowDataPacket[]>(
      `SELECT t.ticketType, t.price, COUNT(*) AS qty
       FROM bookingXSeats bx
       JOIN tickets t ON t.id = bx.ticketTypeId
       WHERE bx.bookingId = ?
       GROUP BY t.id`,
      [bookingId]
    );

    // 3. Hämta stolsnummer
    const [seatRows] = await db.query<RowDataPacket[]>(
      `SELECT s.row_num, s.seat_num
       FROM bookingXSeats bx
       JOIN seats s ON s.id = bx.seatId
       WHERE bx.bookingId = ?
       ORDER BY s.row_num, s.seat_num`,
      [bookingId]
    );
    const seatNumbers = seatRows.map(
      (seat) => `Rad ${seat.row_num}, Plats ${seat.seat_num}`
    );

    // 4. Bygg och skicka svar
    const booking = {
      ...rows[0],
      tickets,
      seatNumbers,
    };
    res.json(booking);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ----------  DELETE /bookings/:id  ---------- */
// (Din befintliga middleware och DELETE-route)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Du är inte inloggad" });
  }
  next();
};

router.delete("/:bookingId", requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.session.user!.id;
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [bookingRows] = await connection.query<RowDataPacket[]>(
      `SELECT
         b.userId,
         s.start_time,
         s.id as screeningIdExists
       FROM bookings b
       LEFT JOIN screenings s ON b.screeningId = s.id
       WHERE b.id = ?
       LIMIT 1`,
      [bookingId]
    );

    if (bookingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Bokningen hittades inte" });
    }

    const booking = bookingRows[0];

    if (!booking.screeningIdExists) {
      await connection.rollback();
      return res
        .status(500)
        .json({ error: "Databasfel: Bokningen är korrupt" });
    }

    if (booking.userId !== userId) {
      await connection.rollback();
      return res
        .status(403)
        .json({ error: "Du har inte behörighet att avboka detta" });
    }

    const screeningTime = new Date(booking.start_time).getTime();
    const twoHoursBefore = screeningTime - 2 * 60 * 60 * 1000;
    const now = Date.now();

    if (now > twoHoursBefore) {
      await connection.rollback();
      return res
        .status(403)
        .json({ error: "Tidsgränsen för avbokning har passerat (2 timmar)" });
    }

    await connection.query<ResultSetHeader>(
      "DELETE FROM bookingXSeats WHERE bookingId = ?",
      [bookingId]
    );

    await connection.query<ResultSetHeader>("DELETE FROM bookings WHERE id = ?", [
      bookingId,
    ]);

    await connection.commit();

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