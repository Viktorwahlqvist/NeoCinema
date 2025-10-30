import { Router } from "express";
import { db } from "../db.js";
import bcrypt from "bcrypt";
import "express-session";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

/* ----------  session type ---------- */
declare module "express-session" {
  interface SessionData {
    user?: { id: number; email: string };
  }
}

/* ----------  middleware ---------- */
function requireAuth(req: any, res: any, next: any) {
  if (!req.session.user) return res.status(401).json({ error: "Du är inte inloggad" });
  next();
}

const isString = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/* ----------  POST /users/register ---------- */
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body ?? {};
  if (!isString(email) || !isValidEmail(email)) return res.status(400).json({ error: "Ogiltig e-post" });
  if (!isString(password) || password.length < 8) return res.status(400).json({ error: "Lösenordet måste vara minst 8 tecken" });

  try {
    const [existing] = await db.query<RowDataPacket[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length) return res.status(409).json({ error: "E-postadressen används redan" });

    const hash = await bcrypt.hash(password, 12);
    const [ins] = await db.query<ResultSetHeader>(
      "INSERT INTO users (firstName, lastName, email, password) VALUES (?,?,?,?)",
      [firstName ?? null, lastName ?? null, email, hash]
    );
    const id = ins.insertId;
    req.session.user = { id, email };
    res.status(201).json({ message: "Konto skapat", user: { id, firstName, lastName, email }, loggedIn: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Serverfel" });
  }
});

/* ----------  POST /users/login ---------- */
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!isString(email) || !isString(password)) return res.status(400).json({ error: "E-post och lösenord krävs" });

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, firstName, lastName, email, password FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Fel e-post eller lösenord" });
    }
    req.session.user = { id: user.id, email: user.email };
    delete (user as any).password;
    res.json({ message: "Inloggning lyckades", user, loggedIn: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Serverfel" });
  }
});

/* ----------  POST /users/logout ---------- */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Kunde inte logga ut" });
    res.clearCookie(process.env.SESSION_COOKIE_NAME || "neocinema.sid");
    res.json({ message: "Utloggning lyckades", loggedOut: true });
  });
});

/* ----------  GET /users/me ---------- */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, firstName, lastName, email FROM users WHERE id = ? LIMIT 1",
      [req.session.user!.id]
    );
    res.json({ user: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Serverfel" });
  }
});

/* ----------  GET /users/me/bookings  (history) ---------- */
router.get("/me/bookings", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT b.id AS bookingId,
              b.bookingNumber,
              b.date,
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
        ORDER BY b.date DESC`,
      [req.session.user!.id]
    );
    res.json({ bookings: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Serverfel" });
  }
});

export default router;