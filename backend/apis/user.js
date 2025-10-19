import { Router } from "express";
import db from "../config/db.js";
const router = Router();

// CREATE user
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO users (firstName, lastName, email, password, role) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [firstName, lastName, email, password, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by id
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE userID = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user
router.put("/:id", async (req, res) => {
  const { fisrtName, lastName, email, password, role } = req.body;
  try {
    const result = await db.query(
      "UPDATE users SET firstName=$1, lastName=$2, email=$3, password=$4, role=$5 WHERE userID=$6 RETURNING *",
      [fisrtName, lastName, email, password, role, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM users WHERE userID=$1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
