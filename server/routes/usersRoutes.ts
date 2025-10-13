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
router.post("/register", async (requestAnimationFrame, res) => {
  const {fistName, lastName, email, password } = requestAnimationFrame.body ?? {};
  if (!isString(email) || !isValidEmail(email)) {
    return res.status(400).json({error: "ogiltig e-postadress"});
  }

  if (!isString(password) || password.length < 8) {
    return res
    .status(400)
    .json({error: "lösenordet måste vara minst 8 tecken långt"});
  }

})