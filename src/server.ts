import express from "express";
import { signup } from "../server/signup";
import { login } from "../server/login";

const app = express();
app.use(express.json());

// routes
app.post("/signup", signup);
app.post("/login", login);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});