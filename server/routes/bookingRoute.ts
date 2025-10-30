import express from "express";
import { db } from "../db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import randomNumber from "../utils/randomNumber.js";
import { sendEmail } from "./Mailer.js";



const router = express.Router();

/* ----------  tiny helper  ---------- */
type Seat = RowDataPacket & {
  seatId: number;
  row_num: number;
  seat_num: number;
  seatStatus: "available" | "booked";
};

type SeatInput = { seatId: number; ticketType: number };

/* ----------  POST /bookings  ---------- */
// router.post("/bookings", async (req, res) => {
//   const { screeningId, seats, guestEmail } = req.body;
//   const userId = req.session.user?.id || null;      // <-- from session now

//   if (!screeningId || !seats || !Array.isArray(seats) || seats.length === 0) {
//     return res.status(400).json({ message: "Missing screeningId or seats" });
//   }

//   // If user is logged in we ignore guestEmail, otherwise guestEmail is required
//   if (!userId && !guestEmail) {
//     return res.status(400).json({ message: "guestEmail required when not logged in" });
//   }

//   try {
//     // 1. Make sure all requested seats are still available
//     const [seatsRows] = await db.query<Seat[]>(
//       "SELECT * FROM seatStatusView WHERE screeningId = ?",
//       [screeningId]
//     );
//     const available = seatsRows.filter((s) => s.seatStatus === "available");
//     const allAvailable = seats.every((wanted: SeatInput) =>
//       available.some((a) => a.seatId === wanted.seatId)
//     );
//     if (!allAvailable) {
//       return res.status(400).json({ message: "One or more seats already booked" });
//     }

//     // 2. Create the booking
//     const bookingNumber = randomNumber();
//     const [bookingRes] = await db.query<ResultSetHeader>(
//       `INSERT INTO bookings (bookingNumber, userId, screeningId, date, guestEmail)
//        VALUES (?, ?, ?, NOW(), ?)`,
//       [bookingNumber, userId, screeningId, userId ? null : guestEmail]
//     );
//     const bookingId = bookingRes.insertId;

//     // 3. Insert seats
//     const seatValues = seats.map((s: SeatInput) => [bookingId, s.seatId, s.ticketType]);
//     await db.query(
//       "INSERT INTO bookingXSeats (bookingId, seatId, ticketTypeId) VALUES ?",
//       [seatValues]
//     );

//     // 4. Build confirmation email
//     const [rows] = await db.query<RowDataPacket[]>(
//       `SELECT m.title, s.start_time, a.name
//          FROM screenings s
//          JOIN movies m ON m.id = s.movie_id
//          JOIN auditoriums a ON a.id = s.auditorium_id
//         WHERE s.id = ?`,
//       [screeningId]
//     );
//     const screening = rows[0];

//     const [ticketRows] = await db.query<RowDataPacket[]>(
//       `SELECT t.ticketType, t.price, COUNT(*) AS qty
//          FROM bookingXSeats bx
//          JOIN tickets t ON t.id = bx.ticketTypeId
//         WHERE bx.bookingId = ?
//         GROUP BY t.id`,
//       [bookingId]
//     );
//     const totalPrice = ticketRows.reduce((sum, t) => sum + t.price * t.qty, 0);

//     const emailHtml = `
//       <h2>Tack för din bokning!</h2>
//       <p><b>Film:</b> ${screening.title}</p>
//       <p><b>Salong:</b> ${screening.name}</p>
//       <p><b>Tid:</b> ${new Date(screening.start_time).toLocaleString("sv-SE")}</p>
//       <p><b>Bokningsnummer:</b> ${bookingNumber}</p>
//       <p><b>Totalt pris:</b> ${totalPrice} kr</p>
//     `;
    
//     const [userRows] = await db.query<RowDataPacket[]>(
//   "SELECT firstName, lastName, email FROM users WHERE id = ? LIMIT 1",
//     [userId]
//   );
//   const user = userRows[0] as { firstName: string; lastName: string; email: string };
//   const recipient = user.email;   // <-- now ok

//     if (recipient) {
//       await sendEmail({
//         to: recipient,
//         subject: `Bekräftelse – ${screening.title}`,
//         html: emailHtml,
//       });
//     }

//     res.status(201).json({
//       message: "Booking created",
//       bookingId,
//       bookingNumber,
//       seats: seats.map((s: SeatInput) => s.seatId),
//     });
//   } catch (e: any) {
//     console.error("Booking error:", e);
//     res.status(500).json({ error: "Server error" });
//   }
// });
router.post("/bookings", async (req, res) => {
  const { screeningId, seats, guestEmail } = req.body;
  const userId = req.session.user?.id || null;

  // ... (din validering för screeningId, seats, guestEmail är bra) ...
  if (!screeningId || !seats || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: "Missing screeningId or seats" });
  }
  if (!userId && !guestEmail) {
    return res.status(400).json({ message: "guestEmail required when not logged in" });
  }

  
  let connection;
  try {
    connection = await db.getConnection(); 
    await connection.beginTransaction(); 

   
    const [seatsRows] = await connection.query<Seat[]>(
      "SELECT * FROM seatStatusView WHERE screeningId = ?",
      [screeningId]
    );
    
    const available = seatsRows.filter((s) => s.seatStatus === "available");
    const allAvailable = seats.every((wanted: SeatInput) =>
      available.some((a) => a.seatId === wanted.seatId)
    );
    if (!allAvailable) {
      await connection.rollback(); 
      return res.status(400).json({ message: "One or more seats already booked" });
    }


    
    const bookingNumber = randomNumber();
    const [bookingRes] = await connection.query<ResultSetHeader>( 
      `INSERT INTO bookings (bookingNumber, userId, screeningId, date, guestEmail)
       VALUES (?, ?, ?, NOW(), ?)`,
      [bookingNumber, userId, screeningId, userId ? null : guestEmail]
    );
    const bookingId = bookingRes.insertId;

  
    const seatValues = seats.map((s: SeatInput) => [bookingId, s.seatId, s.ticketType]);
    await connection.query( // 'connection.query'
      "INSERT INTO bookingXSeats (bookingId, seatId, ticketTypeId) VALUES ?",
      [seatValues]
    );

   
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT m.title, s.start_time, a.name
         FROM screenings s
         JOIN movies m ON m.id = s.movie_id
         JOIN auditoriums a ON a.id = s.auditorium_id
        WHERE s.id = ?`,
      [screeningId]
    );
    const screening = rows[0];
    const [ticketRows] = await connection.query<RowDataPacket[]>(
      `SELECT t.ticketType, t.price, COUNT(*) AS qty
         FROM bookingXSeats bx
         JOIN tickets t ON t.id = bx.ticketTypeId
        WHERE bx.bookingId = ?
        GROUP BY t.id`,
      [bookingId]
    );
    const totalPrice = ticketRows.reduce((sum: number, t: any) => sum + t.price * t.qty, 0);
    const emailHtml = `
      <h2>Tack för din bokning!</h2>
      <p><b>Film:</b> ${screening.title}</p>
      <p><b>Salong:</b> ${screening.name}</p>
      <p><b>Tid:</b> ${new Date(screening.start_time).toLocaleString("sv-SE")}</p>
      <p><b>Bokningsnummer:</b> ${bookingNumber}</p>
      <p><b>Totalt pris:</b> ${totalPrice} kr</p>
    `;

    
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
    
   
    if (recipientEmail) {
      await sendEmail({
        to: recipientEmail,
        subject: `Bekräftelse – ${screening.title}`,
        html: emailHtml,
      });
    }

    
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
router.get("/", async (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) return res.status(400).json({ message: "userId required" });

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT b.id               AS bookingId,
              b.bookingNumber,
              b.date,
              m.title            AS movieTitle,
              s.start_time       AS screeningTime,
              a.name             AS auditoriumName,
              SUM(t.price)       AS totalPrice
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


/* ----------  GET /bookings/:id  ---------- */
router.get("/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  try {
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

    const [tickets] = await db.query<RowDataPacket[]>(
      `SELECT t.ticketType, t.price, COUNT(*) AS qty
         FROM bookingXSeats bx
         JOIN tickets t ON t.id = bx.ticketTypeId
        WHERE bx.bookingId = ?
        GROUP BY t.id`,
      [bookingId]
    );
    const booking = { ...rows[0], tickets };
    res.json(booking);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ----------  DELETE /bookings/:id  ---------- */
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Du är inte inloggad" });
  }
  next();
};



router.delete("/:bookingId", requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.session.user!.id; // Vi vet att användaren finns pga requireAuth
  let connection;



  try {
    
    connection = await db.getConnection(); 
    await connection.beginTransaction(); 


    console.log(`== Kör SQL: ... LEFT JOIN ... WHERE b.id = ${bookingId}`);
    
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

    console.log("== Databasfråga resultat (bookingRows):", bookingRows);

    // 2. KONTROLL: Finns bokningen överhuvudtaget?
    if (bookingRows.length === 0) {
      await connection.rollback();
      console.log("!!! HITTADE INTE BOKNINGEN -> SKICKAR 404 !!!");
      return res.status(404).json({ error: "Bokningen hittades inte" });
    }
    
    const booking = bookingRows[0];

    
    if (!booking.screeningIdExists) {
      await connection.rollback();
      console.log("!!! DATABASFEL: 'screeningIdExists' är NULL -> SKICKAR 500 !!!");
      // Detta är ett serverfel, inte användarens fel.
      return res.status(500).json({ error: "Databasfel: Bokningen är korrupt och kan inte raderas." });
    }

    
    if (booking.userId !== userId) {
      await connection.rollback();
      console.log(`!!! SÄKERHETSFEL: Användare ${userId} äger inte bokning ${bookingId} -> SKICKAR 403 !!!`);
      return res.status(403).json({ error: "Du har inte behörighet att avboka detta" });
    }

    // 5. TIDSKONTROLL: Är det mer än 2 timmar kvar?
    const screeningTime = new Date(booking.start_time).getTime();
    const twoHoursBefore = screeningTime - (2 * 60 * 60 * 1000); // 2 timmar i ms
    const now = Date.now();

    if (now > twoHoursBefore) {
      await connection.rollback();
      console.log(`!!! TIDSGRÄNS UPPNÅDD: ${now} är efter ${twoHoursBefore} -> SKICKAR 403 !!!`);
      return res.status(403).json({ error: "Tidsgränsen för avbokning har passerat (2 timmar)" });
    }

    
    
    // Steg 6a: Ta bort kopplingarna i 'bookingXSeats'
    // Detta gör att din `seatStatusView` automatiskt ser platserna som lediga!
    console.log(`== RADERAR från bookingXSeats WHERE bookingId = ${bookingId}`);
    await connection.query<ResultSetHeader>(
      "DELETE FROM bookingXSeats WHERE bookingId = ?",
      [bookingId]
    );

    // Steg 6b: Ta bort själva bokningen
    console.log(`== RADERAR från bookings WHERE id = ${bookingId}`);
    await connection.query<ResultSetHeader>(
      "DELETE FROM bookings WHERE id = ?",
      [bookingId]
    );

    
    await connection.commit();
    
    console.log("== AVBOKNING LYCKADES! -> SKICKAR 200 ==");
    res.status(200).json({ message: "Bokningen har avbokats" });

  } catch (e) {
    // Något gick fel, ångra allt!
    if (connection) await connection.rollback();
    console.error("!!! OVÄNTAT SERVERFEL VID AVBOKNING:", e);
    res.status(500).json({ error: "Serverfel vid avbokning" });
  } finally {
    // Släpp anslutningen tillbaka till poolen oavsett vad
    if (connection) connection.release();
  }
});

export default router;