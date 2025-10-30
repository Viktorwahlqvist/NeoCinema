import express from "express";
import dotenv from "dotenv";
import { db } from "./db.js";
import dynamiskRoute from "./routes/dynamiskRoute.js";
import { moviesRouter } from "./routes/movies.js";
import bookingRoute from "./routes/bookingRoute.js";
import usersRoutes from "./routes/usersRoutes.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import { screeningsRouter } from "./routes/screeningsRouter.js";
import connectMySQL from "express-mysql-session";

dotenv.config({ path: "../.env" });

const app = express();
app.use(express.json());
app.use(cookieParser()); 


const MySQLStore = connectMySQL(session);
const sessionStore = new MySQLStore({}, db as any);


app.use(
  session({
    name: process.env.SESSION_COOKIE_NAME || "neocinema.sid",
    secret: process.env.SESSION_SECRET || "change-me",
    store: sessionStore, //store attached here
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: (Number(process.env.SESSION_TTL_MIN) || 60) * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", 
    },
  })
);

/* ----------  routes  ---------- */
app.use("/api/movies", moviesRouter);
app.use("/api/users", usersRoutes);
app.use("/api/booking", bookingRoute);
app.use("/api", dynamiskRoute);
app.use("/api/screenings", screeningsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});