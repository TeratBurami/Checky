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

export default router;
