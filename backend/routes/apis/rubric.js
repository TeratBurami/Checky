import { Router } from "express";
import db from "../../config/db.js";
import jwt from "jsonwebtoken";

const router = Router();

// ---------- Helper ----------
const verifyToken = (req) => {
  const token = req.cookies.token;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userid;
};

// ---------- Shared Query ----------
const RUBRIC_QUERY = `
SELECT r.rubric_id AS "rubricId", r.name, r.created_at,
json_agg(
  json_build_object(
    'criterionId', rc.criterion_id,
    'title', rc.title,
    'levels', (
      SELECT json_agg(
        json_build_object(
          'levelId', rl.level_id,
          'level', rl.level_name,
          'score', rl.score,
          'description', rl.description
        )
      )
      FROM rubric_levels rl
      WHERE rl.criterion_id = rc.criterion_id
    )
  )
) AS criteria
FROM rubrics r
LEFT JOIN rubric_criteria rc ON r.rubric_id = rc.rubric_id
`;

// ---------- Routes ----------

// Admin: get all rubrics
router.get("/admin", async (_, res) => {
  try {
    const { rows } = await db.query(`${RUBRIC_QUERY} GROUP BY r.rubric_id`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher: get own rubrics
router.get("/", async (req, res) => {
  try {
    const teacherId = verifyToken(req);
    const { rows } = await db.query(
      `${RUBRIC_QUERY} WHERE r.teacherID = $1 GROUP BY r.rubric_id`,
      [teacherId]
    );
    res.json(rows);
  } catch (err) {
    res.status(err.message === "Unauthorized" ? 401 : 500).json({ error: err.message });
  }
});

// Create rubric with criteria and levels
router.post("/", async (req, res) => {
  const { rubric } = req.body;
  if (!rubric?.name || !Array.isArray(rubric.criteria))
    return res.status(400).json({ error: "Invalid request body" });

  try {
    const teacherId = verifyToken(req);
    await db.query("BEGIN");

    const { rows: [rubricRow] } = await db.query(
      `INSERT INTO rubrics (name, teacherID) VALUES ($1, $2) RETURNING rubric_id, name`,
      [rubric.name, teacherId]
    );
    const rubricId = rubricRow.rubric_id;

    const createdCriteria = [];

    for (const criterion of rubric.criteria) {
      if (!criterion.title || !Array.isArray(criterion.levels)) continue;

      const { rows: [critRow] } = await db.query(
        `INSERT INTO rubric_criteria (rubric_id, title)
         VALUES ($1, $2) RETURNING criterion_id, title`,
        [rubricId, criterion.title]
      );

      const levels = criterion.levels.filter(l => l.level && l.score != null);
      if (levels.length) {
        const values = levels.map(
          (l, i) =>
            `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`
        ).join(",");
        const params = [
          critRow.criterion_id,
          ...levels.flatMap(l => [l.level, l.score, l.description || null])
        ];
        const { rows: levelRows } = await db.query(
          `INSERT INTO rubric_levels (criterion_id, level_name, score, description)
           VALUES ${values}
           RETURNING level_id, level_name AS level, score, description`,
          params
        );
        createdCriteria.push({
          criterionId: critRow.criterion_id,
          title: critRow.title,
          levels: levelRows
        });
      }
    }

    await db.query("COMMIT");
    res.status(201).json({ rubric: { ...rubricRow, criteria: createdCriteria } });
  } catch (err) {
    await db.query("ROLLBACK");
    const code = err.message === "Unauthorized" ? 401 : 500;
    res.status(code).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const teacherId = verifyToken(req);
    const { rows } = await db.query(
      `${RUBRIC_QUERY}
       WHERE r.rubric_id = $1 AND r.teacherID = $2
       GROUP BY r.rubric_id`,
      [id, teacherId]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Rubric not found" });

    res.json(rows[0]);
  } catch (err) {
    res
      .status(err.message === "Unauthorized" ? 401 : 500)
      .json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { rubric } = req.body;

  if (!rubric?.name || !Array.isArray(rubric.criteria))
    return res.status(400).json({ error: "Invalid request body" });

  try {
    const teacherId = verifyToken(req);
    await db.query("BEGIN");

    // Verify rubric ownership
    const { rows: checkRows } = await db.query(
      `SELECT rubric_id FROM rubrics WHERE rubric_id = $1 AND teacherID = $2`,
      [id, teacherId]
    );
    if (checkRows.length === 0)
      throw new Error("Rubric not found or not owned by user");

    // Update rubric name
    await db.query(`UPDATE rubrics SET name = $1 WHERE rubric_id = $2`, [
      rubric.name,
      id,
    ]);

    // Remove old criteria & levels to simplify updates
    await db.query(
      `DELETE FROM rubric_levels WHERE criterion_id IN (
         SELECT criterion_id FROM rubric_criteria WHERE rubric_id = $1
       )`,
      [id]
    );
    await db.query(`DELETE FROM rubric_criteria WHERE rubric_id = $1`, [id]);

    // Recreate criteria and levels
    const createdCriteria = [];

    for (const criterion of rubric.criteria) {
      if (!criterion.title || !Array.isArray(criterion.levels)) continue;

      const {
        rows: [critRow],
      } = await db.query(
        `INSERT INTO rubric_criteria (rubric_id, title)
         VALUES ($1, $2) RETURNING criterion_id, title`,
        [id, criterion.title]
      );

      const levels = criterion.levels.filter(
        (l) => l.level && l.score != null
      );
      if (levels.length) {
        const values = levels
          .map(
            (_, i) =>
              `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`
          )
          .join(",");
        const params = [
          critRow.criterion_id,
          ...levels.flatMap((l) => [l.level, l.score, l.description || null]),
        ];
        const { rows: levelRows } = await db.query(
          `INSERT INTO rubric_levels (criterion_id, level_name, score, description)
           VALUES ${values}
           RETURNING level_id, level_name AS level, score, description`,
          params
        );
        createdCriteria.push({
          criterionId: critRow.criterion_id,
          title: critRow.title,
          levels: levelRows,
        });
      }
    }

    await db.query("COMMIT");
    res.json({
      message: "Rubric updated successfully",
      rubric: { rubricId: id, name: rubric.name, criteria: createdCriteria },
    });
  } catch (err) {
    await db.query("ROLLBACK");
    const code =
      err.message === "Unauthorized"
        ? 401
        : err.message.includes("not found")
        ? 404
        : 500;
    res.status(code).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const teacherId = verifyToken(req);
    await db.query("BEGIN");

    // Verify ownership
    const { rows: checkRows } = await db.query(
      `SELECT rubric_id FROM rubrics WHERE rubric_id = $1 AND teacherID = $2`,
      [id, teacherId]
    );
    if (checkRows.length === 0)
      throw new Error("Rubric not found or not owned by user");

    // Delete levels → criteria → rubric
    await db.query(
      `DELETE FROM rubric_levels WHERE criterion_id IN (
         SELECT criterion_id FROM rubric_criteria WHERE rubric_id = $1
       )`,
      [id]
    );
    await db.query(`DELETE FROM rubric_criteria WHERE rubric_id = $1`, [id]);
    await db.query(`DELETE FROM rubrics WHERE rubric_id = $1`, [id]);

    await db.query("COMMIT");
    res.json({ message: "Rubric deleted successfully" });
  } catch (err) {
    await db.query("ROLLBACK");
    res
      .status(err.message === "Unauthorized" ? 401 : 500)
      .json({ error: err.message });
  }
});


export default router;
