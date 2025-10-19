import { Router } from "express";
import db from "../config/db.js";
const router = Router();

// GET all classes
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM classes");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new class (stuck at non-null constraint error from db)
// router.post("/", async (req, res) => {
//   const { name, description } = req.body;
//   try {
//     const { rows } = await db.query("INSERT INTO classes (name, description) VALUES ($1, $2)", [name, description]);
//     res.sendStatus(201);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

export default router;
