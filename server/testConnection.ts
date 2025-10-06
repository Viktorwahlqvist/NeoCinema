// server/testConnection.ts
import { db } from "./db.js";


async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("✅ MySQL funkar!");

    const [rows] = await connection.execute("SELECT NOW() AS currentTime;");
    console.log("Server time:", (rows as any)[0].currentTime);

    connection.release();
  } catch (error) {
    console.error("❌ Funkar inte:", error);
  } finally {
    process.exit(); 
  }
}

testConnection();
