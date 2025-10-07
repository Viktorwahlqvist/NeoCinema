
import { Request, Response } from "express";
import { db } from "../db.js";

// GET all movies
export const getMovies = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM movies");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
};

// GET one movie
export const getMovieById = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query("SELECT * FROM movies WHERE movie_id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Movie not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movie" });
  }
};

// POST new movie
export const createMovie = async (req: Request, res: Response) => {
  const { title, duration, genre, release_date } = req.body;
  try {
    const [result]: any = await db.query(
      "INSERT INTO movies (title, duration, genre, release_date) VALUES (?, ?, ?, ?)",
      [title, duration, genre, release_date]
    );
    res.status(201).json({ id: result.insertId, title, duration, genre, release_date });
  } catch (err) {
    console.error(err);  // <-- Lägg till denna för detaljerad fel-logg
    res.status(500).json({ error: "Failed to create movie" });
  }
};

// PUT update movie
export const updateMovie = async (req: Request, res: Response) => {
  const { title, duration, genre, release_date } = req.body;
  try {
    await db.query(
      "UPDATE movies SET title=?, duration=?, genre=?, release_date=? WHERE movie_id=?",
      [title, duration, genre, release_date, req.params.id]
    );
    res.json({ message: "Movie updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update movie" });
  }
};

// DELETE movie
export const deleteMovie = async (req: Request, res: Response) => {
  try {
    await db.query("DELETE FROM movies WHERE movie_id = ?", [req.params.id]);
    res.json({ message: "Movie deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete movie" });
  }
};
