import express from "express";
import dotenv from "dotenv";
import { db } from "./db.js";
import dynamiskRoute from "./routes/dynamiskRoute.js";
// import { router as seatsRouter } from "./routes/seatsAuditorium.js";
import { moviesRouter } from "./routes/movies.js";
import bookingRoute from "./routes/bookingRoute.js";
import usersRoutes from "./routes/usersRoutes.js";
import session from "express-session";
import connectMySQL from "express-mysql-session";
// import { setupSSEEndpoint, broadcastSeatUpdate } from "./utils/sseManager.js";
// import { getSeatsFromDB } from "./routes/seatsAuditorium.js"; 
dotenv.config({ path: "../.env" });

const app = express();
app.use(express.json());

const MySQLStore = connectMySQL(session);
const sessionStore = new MySQLStore({}, db as any);




app.use(
  session({
    name: process.env.SESSION_COOKIE_NAME || "neocinema.sid",
    secret: process.env.SESSION_SECRET || "dev_secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: (Number(process.env.SESSION_TTL_MIN) || 60) * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

// Setup SSE endpoint
// setupSSEEndpoint(app, getSeatsFromDB);

// Routes
app.use("/api/movies", moviesRouter);
app.use("/api/users", usersRoutes);
app.use("/api", bookingRoute);
// app.use("/api", getSeatsFromDB);
app.use("/api", dynamiskRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
