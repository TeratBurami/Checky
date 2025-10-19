import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;
const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

try {
  await db.connect();
  console.log("PostgreSQL connected");
} catch (err) {
  console.error("PostgreSQL connection error:", err);
  process.exit(1);
}

export default db;
