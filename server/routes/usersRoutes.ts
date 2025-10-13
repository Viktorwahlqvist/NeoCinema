import { Router } from "express";
import { db } from "../db.js";
import bcrypt from "bcrypt";
import { signToken } from "../auth/jwt.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function assertString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body ?? {};

  if (!assertString(email) || !isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!assertString(password) || password.length < 8 || password.length > 72) {
    return res.status(400).json({ error: "Password must be 8–72 chars" });
  }

   try {
    const [rows] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (Array.isArray(rows) && rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      `INSERT INTO users (firstName, lastName, email, password)
       VALUES (?, ?, ?, ?)`,
      [firstName ?? null, lastName ?? null, email, hash]
    );

    const insertId = (result as any).insertId as number;

    const token = signToken({ sub: insertId, email });
    return res.status(201).json({
      user: { id: insertId, firstName: firstName ?? null, lastName: lastName ?? null, email },
      token,
    });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!assertString(email) || !assertString(password)) {
    return res.status(400).json({error: "Email and password are required"});
  }

  try {
    const [rows] = await db.query(
      "SELECT id, firstName, lastName, email, password FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = Array.isArray(rows) ? (rows[0] as any) : null;
    if (!user) return res.status(401).json({error: "invalid credentials"});

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({Error: "invalid credentials"});

    const token = signToken({sub: user.id, email: user.email});

    delete user.password;
    return res.json({user, token});
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({error: "Server error"})
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const { sub } = (req as any).user as { sub: number };
  try {

    const[rows] = await db.query(
      "SELECT id, firstName, lastName, email FROM users WHERE id = ? LIMIT 1",
      [sub]
    );
    const user = Array.isArray(rows) ? rows[0] : null;
    return res.json({ user });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({error: "Server error"})
  }
});

export default router;
