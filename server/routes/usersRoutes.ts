import { Router } from "express";
import { db } from "../db.js";
import bcrypt from "bcrypt";

const router = Router();

// validering av e-post
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Konterlerar ifall något är en icke tom sträng
const isString = (value: unknown) : value is string =>
  typeof value === "string" && value.trim().length > 0;

// Skaoa konto och logga in (inte klart än)
router.post("/register", async (req, res) => {
  const {firstName, lastName, email, password } = req.body ?? {};
  if (!isString(email) || !isValidEmail(email)) {
    return res.status(400).json({error: "ogiltig e-postadress"});
  }

  if (!isString(password) || password.length < 8) {
    return res
    .status(400)
    .json({error: "lösenordet måste vara minst 8 tecken långt"});
  }

  // Kollar iffal det redan finns en användare
  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({error: "E-postadressen används redan"});
    }

    //Hasha lösenordet innan det sparar
    const hashedPassword = await bcrypt.hash(password, 12);

   const [result] = await db.query(
      `INSERT INTO users (firstName, lastName, email, password)
       VALUES (?, ?, ?, ?)`,
      [firstName ?? null, lastName ?? null, email, hashedPassword]
    );

    const newUserId = (result as any).omsertId as number;

    //För att spara inloggningssessionen direkt
    req.session.user = { id: newUserId, email };

    return res.status(201).json({
      message: "Ditt konto har skapats",
      user: { id: newUserId, firstName, lastName, email },
      loggedIn: true,
    })
  } catch (error) {
    console.error("Registrerings problem:", error);
    return res.status(500).json({error: "Serverfel"});
  }
}
)};

export default router;