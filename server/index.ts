import express from "express";
import dotenv from "dotenv";
import { db } from "./db.js";
import dynamiskRoute from "./routes/dynamiskRoute.js";

dotenv.config({ path: "../.env" });

const app = express();

app.use(express.json());

// Routes
app.use("/api", dynamiskRoute);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
