
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

// POST new 
export const createMovie = async (req: Request, res: Response) => {
  const { title, info, genres } = req.body;

  if (!title || !info || !Array.isArray(genres)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1️⃣ Lägg till filmen
    const [movieResult]: any = await connection.query(
      "INSERT INTO movies (title, info) VALUES (?, ?)",
      [title, JSON.stringify(info)]
    );

    const movieId = movieResult.insertId;

    // 2️⃣ Koppla till genres i moviesXgenres
    for (const genreId of genres) {
      await connection.query(
        "INSERT INTO moviesXgenres (movieId, genreId) VALUES (?, ?)",
        [movieId, genreId]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Movie created successfully", movieId });
  } catch (err) {
    await connection.rollback();
    console.error("❌ Error creating movie:", err);
    res.status(500).json({ error: "Failed to create movie" });
  } finally {
    connection.release();
  }
};

// PUT update 
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

// DELETE 
export const deleteMovie = async (req: Request, res: Response) => {
  try {
    await db.query("DELETE FROM movies WHERE id = ?", [req.params.id]);
    res.json({ message: "Movie deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete movie" });
  }
};




