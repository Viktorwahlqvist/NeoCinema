import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { db } from "./db";

interface SignupBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function signup(req: Request<{}, {}, SignupBody>, res: Response): Promise<void> {
  const { firstName, lastName, email, password } = req.body;

    // validate the request body

  if (!firstName || !lastName || !email || !password) {
    res.status(400).send("All fields are required");
    return;
  }

  try {

        // hash the password

    const hashedPassword = await bcrypt.hash(password, 12);

        // add the new user in the database

    const [result] = await db.execute(
      `INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword]
    );

    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send("Error registering user");
  }
}