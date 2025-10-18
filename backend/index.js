import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// ---------------- DATABASE CONNECTION ----------------
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Test connection
try {
  await db.connect();
  console.log("MySQL connected");
} catch (err) {
  console.error("MySQL connection error:", err);
  process.exit(1);
}

// ---------------- ROUTES ----------------

// GET all users
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by id
app.get("/users/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE user
app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );
    const [newUser] = await db.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
    res.status(201).json(newUser[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user
app.put("/users/:id", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    await db.query(
      "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?",
      [name, email, password, req.params.id]
    );
    const [updatedUser] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    res.json(updatedUser[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
app.delete("/users/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- START SERVER ----------------
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
