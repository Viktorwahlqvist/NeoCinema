import { Router } from "express";
import { db } from "../db.js";
import bcrypt from "bcrypt";


const router = Router();

// Kollar efter ifall epost är i rätt format exempel: namn@gmail.se
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
// Konterlerar ifall ett värde är en sträng och inte tomt
const isString = (value: unknown) : value is string =>
  typeof value === "string" && value.trim().length > 0;

// Skapa konto och loggar in användaren direkt
router.post("/register", async (req, res) => {
  const {firstName, lastName, email, password } = req.body ?? {};

  // här
  if (!isString(email) || !isValidEmail(email)) {
    return res.status(400).json({error: "ogiltig e-postadress"});
  }

  if (!isString(password) || password.length < 8) {
    return res
    .status(400)
    .json({error: "lösenordet måste vara minst 8 tecken långt"});
  }

  // Kollar ifall eposten redan finns en användare i databasen
  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({error: "E-postadressen används redan"});
    }

    //Hasha lösenordet innan det sparar i databasen
    const hashedPassword = await bcrypt.hash(password, 12);

    //skapar en användare i databsen
   const [result] = await db.query(
      `INSERT INTO users (firstName, lastName, email, password)
       VALUES (?, ?, ?, ?)`,
      [firstName ?? null, lastName ?? null, email, hashedPassword]
    );

    const newUserId = (result as any).omsertId as number;

    //Du skapar konto sen blir du inloggad direkt genpm att skapa session
    req.session.user = { id: newUserId, email };

    //skickar tillbaka info om den nya användaren utan lösen
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
);

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  //Här säkersyälls att båda fälten, email och lösen är ifyllt
  if (!isString(email) || !isString(password)) {
    return res
      .status(400)
      .json({ error: "E-post och lösenord måste anges" });
  }

  try {
    //letar upp användare i databasen
    const [rows] = await db.query(
      "SELECT id, firstName, lastName, email, password FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    //om ingen användare hittas får du "Fel e-post eller lösenord"
    const user = Array.isArray(rows) ? (rows[0] as any) : null;
    if (!user) {
      return res.status(401).json({ error: "Fel e-post eller lösenord" });
    }


    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Fel e-post eller lösenord" });
    }

    req.session.user = { id: user.id, email: user.email };
    delete user.password;

    return res.json({
      message: "Inloggning lyckades.",
      user,
      loggedIn: true,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Ett internt serverfel uppstod" });
  }
});

router.get("/me", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Du är inte inloggad"});
  }

  const userId = req.session.user.id;

  try {
    const [rows] = await db.query(
      "SELECT id, firstName, lastName, email FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    const user = Array.isArray(rows) ? rows[0] : null;
    return res.json({user});
  } catch (error) {
    console.error("me error:", error);
    return res.status(500).json({ error: "Serverfel uppståt"});
  }
});

router.post("/logout", (req, res) => {
  if (!req.session.user) {
    return res.status(400).json({error: "Ingen användare är inloggad"});
  }
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({error: "Kunde inte logga ut"});
    }
    res.clearCookie(process.env.SESSION_COOKIE_NAME || "neocinema.sid");
    return res.json({message: "Utloggning lyckades", loggedOut: true});
  })
})
export default router;