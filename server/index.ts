
import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import connectMySQL from "express-mysql-session";
import { db } from "./db.js";
import movieRoutes from "./routes/moviesRoutes.js";
import genresRoutes from "./routes/genresRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

dotenv.config({ path: "../.env" });

const app = express();

app.use(express.json());

// --- Sessionskonfiguration ---
const MySQLStore = connectMySQL(session);
const sessionStore = new MySQLStore({}, db);

app.use(
  session({
    name: process.env.SESSION_COOKIE_NAME || "neocinema.sid",
    secret: process.env.SESSION_SECRET || "dev_secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: (Number(process.env.SESSION_TTL_MIN) || 60) * 60 * 1000, // TTL i millisekunder
      httpOnly: true,
      sameSite: "lax",
      secure: false, // ändra till true om du kör HTTPS
    },
  })
);
// Routes
app.use("/api/movies", movieRoutes);
app.use("/api/genres", genresRoutes);
app.use("/api/users", usersRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
