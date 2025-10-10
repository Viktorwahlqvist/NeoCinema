import express from "express";
import { db } from "../db.js";
import { log, table } from "console";

const router = express.Router();

interface TableRow {
  TABLE_NAME: string;
}
let tables: TableRow[] = [];
router.get("/", async (req, res) => {
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

  if (!tables.find((t) => t.TABLE_NAME === table)) {
    return res.status(500).json({ error: "Not valid table" });
  }

  try {
    const [rows] = await db.query(`SELECT * FROM ${table}`);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch ${table}` });
  }
});



export default router;
