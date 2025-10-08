import { Request, Response } from "express";
import { db } from "../db.js";

// Hämta alla genrer
export const getAllGenres = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM genres");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching genres:", err);
    res.status(500).json({ error: "Failed to fetch genres" });
  }
};

// Hämta alla filmer inom en specifik genre
export const getMoviesByGenre = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [genreRows] = await db.query("SELECT * FROM genres WHERE id = ?", [id]);
    if ((genreRows as any[]).length === 0) {
      return res.status(404).json({ error: "Genre not found" });
    }

    const [movieRows] = await db.query(
      `
      SELECT m.id, m.title, m.info
      FROM movies m
      JOIN moviesXgenres mxg ON m.id = mxg.movieId
      WHERE mxg.genreId = ?
      `,
      [id]
    );

    res.json({
      genre: (genreRows as any)[0].genre,
      movies: movieRows,
    });
  } catch (err) {
    console.error("❌ Error fetching movies by genre:", err);
    res.status(500).json({ error: "Failed to fetch movies for this genre" });
  }
};
