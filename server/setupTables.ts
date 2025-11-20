import { db } from "./db.js";

const createMoviesTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS movies (
        movie_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        duration INT NOT NULL,
        genre VARCHAR(100),
        release_date DATE
      );
    `);
    console.log("✅ Movies table created or already exists!");
  } catch (err) {
    console.error("❌ Failed to create table:", err);
  } finally {
    process.exit();
  }
};

createMoviesTable();
