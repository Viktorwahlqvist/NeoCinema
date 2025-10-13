import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { db } from "./db";

interface LoginBody {
  email: string;
  password: string;
}

export async function login(req: Request<{}, {}, LoginBody>, res: Response): Promise<void> {
  const { email, password } = req.body;

    // validate the request body
    
  if (!email || !password) {
    res.status(400).send("Email and password are required");
    return;
  }
    // fetch the user from the database

  try {
    const [rows] = await db.execute(
      `SELECT id, password FROM users WHERE email = ?`,
      [email]
    );

    const users = rows as { id: number; password: string }[];

    if (users.length === 0) {
      res.status(401).send("Invalid email or password");
      return;
    }

    const user = users[0];

    // compare the password
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).send("Invalid email or password");
      return;
    }

    res.send("Login successful");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Error logging in");
  }
}