
import express from "express";
import dotenv from "dotenv";
import { db } from "./db.js";
import movieRoutes from "./routes/moviesRoutes.js";
import genresRoutes from "./routes/genresRoutes.js";

dotenv.config({ path: "../.env" });

const app = express();

app.use(express.json());

// Routes
app.use("/api/movies", movieRoutes);
app.use("/api/genres", genresRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
