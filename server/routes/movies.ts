import { Router } from "express";
import { db } from "../db.js";
import {
  ResultSetHeader,
  RowDataPacket,
  PoolConnection,
} from "mysql2/promise";
import { requireRole, ROLES } from "../utils/acl.js"; 

const router = Router();

// get routes are public
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
         m.id, m.title, m.info,
         GROUP_CONCAT(g.name) AS genres
       FROM movies m
       LEFT JOIN movie_genres mg ON m.id = mg.movieId
       LEFT JOIN genres g ON mg.genreId = g.id
       GROUP BY m.id
       ORDER BY m.id DESC`
    );

    // map rows to include genres as an array
    const movies = rows.map((movie) => ({
      id: movie.id,
      title: movie.title,
      info: movie.info, 
      genres: movie.genres ? movie.genres.split(",") : [], // convert to array
    }));
    res.json(movies);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Serverfel" });
  }
});

// gets movie by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 
         m.id, m.title, m.info,
         GROUP_CONCAT(g.name) AS genres
       FROM movies m
       LEFT JOIN movie_genres mg ON m.id = mg.movieId
       LEFT JOIN genres g ON mg.genreId = g.id
       WHERE m.id = ?
       GROUP BY m.id`,
      [id]
    );

    if (rows.length === 0 || !rows[0].id) {
      return res.status(404).json({ error: "Filmen hittades inte" });
    }

    const movie = rows[0];
    res.json({
      id: movie.id,
      title: movie.title,
      info: movie.info,
      genres: movie.genres ? movie.genres.split(",") : [],
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Serverfel" });
  }
});



// logic to link genres to a movie
async function linkGenresToMovie(
  connection: PoolConnection,
  movieId: number,
  genreNames: string[]
) {
  if (genreNames.length === 0) return; // no genres to link

 
  //makes sure that all genres exist in the 'genres' table
  const genrePlaceholders = genreNames.map((name) => [name]);
  await connection.query("INSERT IGNORE INTO genres (name) VALUES ?", [
    genrePlaceholders,
  ]);

  const [genreRows] = await connection.query<RowDataPacket[]>(
    "SELECT id FROM genres WHERE name IN (?)",
    [genreNames]
  );
  const genreIds = genreRows.map((row) => row.id);

  // links genres to the movie
  const linkValues = genreIds.map((genreId) => [movieId, genreId]);
  await connection.query(
    "INSERT INTO movie_genres (movieId, genreId) VALUES ?",
    [linkValues]
  );
}

// POST /api/movies
// creates a new movie, protected route for ADMIN only
router.post("/", requireRole([ROLES.ADMIN]), async (req, res) => {
  const { title, info, genres } = req.body;

  // A check for all required fields
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Filmtitel (title) saknas eller är felaktig" });
  }
  if (!info || typeof info !== "object") {
    return res.status(400).json({ error: "Information (info) saknas eller är felaktig" });
  }
  if (!genres || !Array.isArray(genres) || genres.length === 0) {
    return res.status(400).json({ error: "Genrer (genres) saknas eller är felaktig" });
  }

  const { actors, ageLimit, director, duration, description } = info;
  if (!actors || !Array.isArray(actors) || actors.length === 0) {
    return res.status(400).json({ error: "Skådespelare (info.actors) saknas" });
  }
  if (typeof ageLimit !== "number") {
    return res.status(400).json({ error: "Åldersgräns (info.ageLimit) saknas" });
  }
  if (!director || typeof director !== "string") {
    return res.status(400).json({ error: "Regissör (info.director) saknas" });
  }
  if (typeof duration !== "number") {
    return res.status(400).json({ error: "Filmlängd (info.duration) saknas" });
  }
  if (!description || typeof description !== "string") {
    return res.status(400).json({ error: "Beskrivning (info.description) saknas" });
  }
 

  let connection: PoolConnection | undefined;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction(); 

    // we stringify the 'info' object to store it in a JSON column
    const [result] = await connection.query<ResultSetHeader>(
      "INSERT INTO movies (title, info) VALUES (?, ?)",
      [title, JSON.stringify(info)]
    );
    const movieId = result.insertId;

    // link genres to the new movie
    await linkGenresToMovie(connection, movieId, genres);
    await connection.commit();

    res.status(201).json({
      message: "Film skapad",
      movieId: movieId,
      ...req.body,
    });
  } catch (e) {
    if (connection) await connection.rollback(); // rollback on error
    console.error(e);
    res.status(500).json({ error: "Serverfel vid skapande av film" });
  } finally {
    if (connection) connection.release(); 
  }
});

// Put only for admin use
router.put("/:id", requireRole([ROLES.ADMIN]), async (req, res) => {
  const { id } = req.params;
  const { title, info, genres } = req.body;

  
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Filmtitel (title) saknas eller är felaktig" });
  }
  if (!info || typeof info !== "object") {
    return res.status(400).json({ error: "Information (info) saknas eller är felaktig" });
  }
  if (!genres || !Array.isArray(genres) || genres.length === 0) {
    return res.status(400).json({ error: "Genrer (genres) saknas eller är felaktig" });
  }


  let connection: PoolConnection | undefined;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    
    const [result] = await connection.query<ResultSetHeader>(
      "UPDATE movies SET title = ?, info = ? WHERE id = ?",
      [title, JSON.stringify(info), id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Filmen hittades inte, kunde inte uppdatera" });
    }

    await connection.query("DELETE FROM movie_genres WHERE movieId = ?", [id]);
    await linkGenresToMovie(connection, Number(id), genres);
    await connection.commit();

    res.status(200).json({ message: "Film uppdaterad", ...req.body });
  } catch (e) {
    if (connection) await connection.rollback();
    console.error(e);
    res.status(500).json({ error: "Serverfel vid uppdatering av film" });
  } finally {
    if (connection) connection.release();
  }
});

// DELETE /api/movies/:id
// deletes a movie, protected route for ADMIN only
router.delete("/:id", requireRole([ROLES.ADMIN]), async (req, res) => {
  const { id } = req.params;
  let connection: PoolConnection | undefined;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // delete associated genres first
    await connection.query("DELETE FROM movie_genres WHERE movieId = ?", [id]);

    const [result] = await connection.query<ResultSetHeader>(
      "DELETE FROM movies WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Filmen hittades inte, kunde inte raderas" });
    }

    await connection.commit();
    res.status(200).json({ message: "Film raderad" });
  } catch (e: any) {
    if (connection) await connection.rollback();
    console.error(e);
    // checks if foreign key constraint fails
    if (e.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        error: "Kan inte radera filmen, den har aktiva visningar kopplade till sig. Radera visningarna först."
      });
    }
    res.status(500).json({ error: "Serverfel vid radering av film" });
  } finally {
    if (connection) connection.release();
  }
});

export { router as moviesRouter };