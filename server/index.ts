import express from "express";
import dotenv from "dotenv";
import { db } from "./db.js";
import dynamiskRoute from "./routes/dynamiskRoute.js";
import { router as seatsRouter } from "./routes/seatsAuditorium.js";
import { moviesRouter } from './routes/movies.js';
import { screeningsRouter } from './routes/screenings.js';
import pricesRouter from './routes/prices.js';


dotenv.config({ path: "../.env" });

const app = express();

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(express.json());


// Routes
app.use('/api/movies', moviesRouter); 
app.use('/api/screenings', screeningsRouter);
app.use("/api", seatsRouter);
app.use("/api", dynamiskRoute);
app.use('/api/bookings', pricesRouter)

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
