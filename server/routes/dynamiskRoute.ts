import express from "express";
import { db } from "../db.js";

const router = express.Router();

interface TableRow {
  TABLE_NAME: string;
}
let tables: TableRow[] = [];

// Get all tables dynamic
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'fe24-5'"
    );
    tables = rows as TableRow[];
    res.json(tables);
  } catch (err) {
    console.error("Couldn't fetch tables.", err);
    res.status(500).json({ error: "Failed to fetch tables." });
  }
});

// Get all tables, include filtering and sorting
router.get("/:table", async (req, res) => {
  const { table } = req.params;
  const { sort, ...filter } = req.query;
  let params: string[] = [];
  let values: string[] = [];
  let sql: string = `SELECT * FROM ${table}`;

  // Validate that the requested table exists in the database
  if (!tables.find((t) => t.TABLE_NAME === table)) {
    return res.status(500).json({ error: "Not valid table" });
  }

  if (table === "movies") {
    sql = `SELECT 
  movies.id,
  movies.title,
  GROUP_CONCAT(genres.genre SEPARATOR ', ') as Genres,
  movies.info
  FROM movies
  LEFT JOIN moviesXgenres ON movies.id = moviesXgenres.movieId
  LEFT JOIN genres ON moviesXgenres.genreId = genres.id
  `;
    if (params) {
    }
    console.log("Movies");
  }

  // Add filters dynamically to query and values array
  Object.entries(filter).forEach(([key, value]) => {
    params.push(`${key} = ?`);
    values.push(value as string);
  });
  if (params.length > 0) {
    sql += "WHERE " + params.join(" AND ");
    if (table === "movies") {
      sql += " GROUP BY movies.id, movies.title, movies.info";
    }
  }

  // Allow the user to sort results by a column name
  if (typeof sort === "string") {
    const direction = sort.startsWith("-") ? "DESC" : "ASC";
    const column = sort.replace(/^-/, "");
    sql += ` ORDER BY ${column} ${direction}`;
  }

  try {
    console.log("SQL = ", sql);
    const [rows] = await db.query(sql, values);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch ${table}` });
  }
});

export default router;
