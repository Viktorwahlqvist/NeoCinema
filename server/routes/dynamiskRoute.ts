import express from "express";
import { db } from "../db.js";
import sqlBuilder from "../utils/sqlBuilder.js";

const router = express.Router();

interface TableRow {
  TABLE_NAME: string;
  TABLE_TYPE: string;
}
let tables: TableRow[] = [];

// Get all tables dynamic
router.get("/", async (req, res, next) => {
  if (req.path === "/seats-sse") return next();
  try {
    const [rows] = await db.query(
      "SELECT table_name, table_type FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'fe24-5'"
    );
    tables = rows as TableRow[];
    res.json(tables);
  } catch (err) {
    console.error("Couldn't fetch tables.", err);
    res.status(500).json({ error: "Failed to fetch tables." });
  }
});

router.get("/:table", async (req, res) => {
  const { table } = req.params;
  const { sort, limit, offset, ...filter } = req.query;

  if (!tables.find((t) => t.TABLE_NAME === table)) {
    return res.status(500).json({ error: "Not valid table" });
  }

  const { sql, values } = sqlBuilder(
    table,
    filter,
    sort as string,
    limit as string,
    offset as string
  );

  try {
    console.log("SQL =", sql, "VALUES =", values);
    const flatValues = Array.isArray(values) ? values.flat() : values;
    const [rows] = await db.query(sql, flatValues);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Dynamic route error:", err);
    res.status(500).json({ error: `Failed to fetch ${table}` });
  }
});

export default router;
