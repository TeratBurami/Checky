import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import bodyParser from "body-parser";

const { Pool } = pkg;
dotenv.config();

const app = express();
app.use(bodyParser.json());

// ---------------- DATABASE CONNECTION ----------------
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

// ---------------- ROUTES ----------------

// GET all users
app.get("/users", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by id
app.get("/users/:id", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE userID = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE user
app.post("/users", async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO users (firstName, lastName, email, password, role) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [first_name, last_name, email, password, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user
app.put("/users/:id", async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;
  try {
    const result = await db.query(
      "UPDATE users SET firstName=$1, lastName=$2, email=$3, password=$4, role=$5 WHERE userID=$6 RETURNING *",
      [first_name, last_name, email, password, role, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
app.delete("/users/:id", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM users WHERE userID=$1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- START SERVER ----------------
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
