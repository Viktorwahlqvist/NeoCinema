import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

async function testConnection(): Promise<void> {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log("✅ Ansluten till databasen!");
    await connection.end();
  } catch (err: any) {
    console.error("❌ Fel vid anslutning:", err.message);
  }
}

testConnection();

