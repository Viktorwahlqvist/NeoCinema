
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db.js";
import movieRoutes from "./routes/moviesRoutes.js";

dotenv.config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/movies", movieRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
