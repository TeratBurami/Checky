import { Router } from "express";
import db from "../../config/db.js";
import { authenticateJWT } from "../../middleware/auth.js";

const router = Router();

// POST create new assignment
router.post("/:classId/assignment", authenticateJWT(["teacher"]), async (req, res) => {
  const { classId } = req.params;
  const { title, description, deadline, rubricId } = req.body;

  try {
    const teacherId = req.user.userid;

    const rubricCheck = await db.query(
      "SELECT rubric_id FROM rubrics WHERE rubric_id = $1 AND teacherID = $2",
      [rubricId, teacherId]
    );

    if (rubricCheck.rows.length === 0)
      return res.status(404).json({ error: "Rubric not found or not owned by teacher" });

    // Insert assignment
    const { rows } = await db.query(
      `INSERT INTO assignments (class_id, title, description, deadline, rubric_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING assignment_id AS "assignmentId", title, description, deadline, rubric_id AS "rubricId"`,
      [classId, title, description, deadline, rubricId]
    );

    const assignment = rows[0];

    const { rows: students } = await db.query(
      "SELECT studentID FROM classMembers WHERE classID = $1",
      [classId]
    );
    if (students.length > 0) {
      const notifications = students.map((s) => [
        s.studentid,
        "NEW_ASSIGNMENT",
        `New assignment '${title}' has been posted.`,
        `/class/${classId}/assignments/${assignment.assignmentId}`,
      ]);

      const values = notifications
        .map(
          (_, i) =>
            `($${i * 4 + 1}, $${i * 4 + 2}::notification_type, $${i * 4 + 3}, $${i * 4 + 4})`
        )
        .join(", ");

      const flatValues = notifications.flat();
      await db.query(
        `INSERT INTO notifications (user_id, type, message, link) VALUES ${values}`,
        flatValues
      );
    }

    res.status(201).json({ assignment: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all assignments for class including rubric structure
router.get("/:classId/assignment", async (req, res) => {
  const { classId } = req.params;

  try {
    const { rows } = await db.query(
      `
      SELECT 
        a.assignment_id AS "assignmentId",
        a.title,
        a.description,
        a.deadline,
        a.created_at,
        r.rubric_id AS "rubricId",
        r.name AS "rubricName",
        rc.criterion_id AS "criterionId",
        rc.title AS "criterionTitle",
        rl.level_id AS "levelId",
        rl.level_name AS "levelName",
        rl.score,
        rl.description AS "levelDescription"
      FROM assignments a
      LEFT JOIN rubrics r ON a.rubric_id = r.rubric_id
      LEFT JOIN rubric_criteria rc ON r.rubric_id = rc.rubric_id
      LEFT JOIN rubric_levels rl ON rc.criterion_id = rl.criterion_id
      WHERE a.class_id = $1
      ORDER BY a.assignment_id, rc.criterion_id, rl.level_id
      `,
      [classId]
    );

    // Grouping data
    const assignmentsMap = {};

    for (const row of rows) {
      if (!assignmentsMap[row.assignmentId]) {
        assignmentsMap[row.assignmentId] = {
          assignmentId: row.assignmentId,
          title: row.title,
          description: row.description,
          deadline: row.deadline,
          createdAt: row.created_at,
          rubric: row.rubricId
            ? { rubricId: row.rubricId, name: row.rubricName, criteria: [] }
            : null,
        };
      }

      const assignment = assignmentsMap[row.assignmentId];
      if (assignment.rubric && row.criterionId) {
        let criterion = assignment.rubric.criteria.find(
          (c) => c.criterionId === row.criterionId
        );
        if (!criterion) {
          criterion = {
            criterionId: row.criterionId,
            title: row.criterionTitle,
            levels: [],
          };
          assignment.rubric.criteria.push(criterion);
        }

        if (row.levelId) {
          criterion.levels.push({
            levelId: row.levelId,
            levelName: row.levelName,
            score: row.score,
            description: row.levelDescription,
          });
        }
      }
    }

    res.json({ assignments: Object.values(assignmentsMap) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE assignment (only teacher who owns the class)
router.put("/:classId/assignment/:assignmentId", authenticateJWT(['teacher']), async (req, res) => {
  const { classId, assignmentId } = req.params;
  const { title, description, deadline, rubricId } = req.body;
  const teacherId = req.user.userid;

  try {
    const result = await db.query(
      `UPDATE assignments a
       SET title=$1, description=$2, deadline=$3, rubric_id=$4
       FROM classes c
       WHERE a.assignment_id=$5 AND a.class_id=$6 AND c.classID=$6 AND c.teacherID=$7
       RETURNING a.assignment_id AS "assignmentId", a.title, a.description, a.deadline, a.rubric_id AS "rubricId"`,
      [title, description, deadline, rubricId, assignmentId, classId, teacherId]
    );

    if (result.rows.length === 0)
      return res.status(403).json({ error: "Forbidden: you do not teach this class or assignment not found" });

    res.json({ assignment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE assignment (only teacher who owns the class)
router.delete("/:classId/assignment/:assignmentId", authenticateJWT(['teacher']), async (req, res) => {
  const { classId, assignmentId } = req.params;
  const teacherId = req.user.userid;

  try {
    const result = await db.query(
      `DELETE FROM assignments a
       USING classes c
       WHERE a.assignment_id=$1 AND a.class_id=$2 AND c.classID=$2 AND c.teacherID=$3
       RETURNING a.assignment_id AS "assignmentId"`,
      [assignmentId, classId, teacherId]
    );

    if (result.rows.length === 0)
      return res.status(403).json({ error: "Forbidden: you do not teach this class or assignment not found" });

    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET assignment detail (role-based)
router.get("/:classId/assignment/:assignmentId", authenticateJWT(['student', 'teacher']), async (req, res) => {
  const { classId, assignmentId } = req.params;
  const { role, userid } = req.user;

  try {
    // 1. Base assignment info
    const { rows: assignmentRows } = await db.query(
      `SELECT a.assignment_id AS "assignmentId",
              a.title, a.description, a.deadline, a.rubric_id AS "rubricId"
       FROM assignments a
       WHERE a.assignment_id = $1 AND a.class_id = $2`,
      [assignmentId, classId]
    );
    if (assignmentRows.length === 0)
      return res.status(404).json({ error: "Assignment not found" });

    const assignment = assignmentRows[0];

    // ---------- STUDENT ----------
    if (role === 'student') {
      // Rubric info with criteria + levels
      const rubricRes = await db.query(
        `SELECT r.rubric_id AS "rubricId", r.name,
          json_agg(
            json_build_object(
              'title', c.title,
              'levels', (
                SELECT json_agg(json_build_object(
                  'level', l.level_name,
                  'score', l.score,
                  'description', l.description
                ))
                FROM rubric_levels l
                WHERE l.criterion_id = c.criterion_id
              )
            )
          ) AS criteria
         FROM rubrics r
         JOIN rubric_criteria c ON c.rubric_id = r.rubric_id
         WHERE r.rubric_id = $1
         GROUP BY r.rubric_id, r.name`,
        [assignment.rubricId]
      );

      const rubric = rubricRes.rows[0] || null;

      // Student submission
      const submissionRes = await db.query(
        `SELECT s.submission_id AS "submissionId",
                s.content,
                COALESCE(json_agg(json_build_object('filename', f.filename, 'url', f.url))
                  FILTER (WHERE f.file_id IS NOT NULL), '[]'::json) AS "attachment",
                s.submitted_at AS "submittedAt",
                s.score,
                s.teacher_comment AS "teacherComment",
                COALESCE(
                  json_agg(
                    json_build_object(
                      'reviewerName', concat(u.firstname, ' ', u.lastname),
                      'comment', pr.comments
                    )
                  ) FILTER (WHERE pr.review_id IS NOT NULL),
                  '[]'::json
                ) AS "peerReviewsReceived"
         FROM submissions s
         LEFT JOIN submission_files f ON f.submission_id = s.submission_id
         LEFT JOIN peer_reviews pr ON s.submission_id = pr.submission_id
         LEFT JOIN users u ON pr.reviewer_id = u.userid
         WHERE s.assignment_id = $1 AND s.student_id = $2
         GROUP BY s.submission_id`,
        [assignmentId, userid]
      );

      assignment.rubric = rubric;
      assignment.mySubmission = submissionRes.rows[0] || null;
      return res.json(assignment);
    }

    // ---------- TEACHER ----------
    if (role === 'teacher') {
      const submissionsRes = await db.query(
        `SELECT s.submission_id AS "submissionId",
                json_build_object(
                  'studentId', u.userid,
                  'firstName', u.firstname,
                  'lastName', u.lastname
                ) AS "studentInfo",
                s.content,
                COALESCE(json_agg(json_build_object('filename', f.filename, 'url', f.url))
                  FILTER (WHERE f.file_id IS NOT NULL), '[]'::json) AS "attachment",
                s.submitted_at AS "submittedAt",
                s.score,
                s.teacher_comment AS "teacherComment"
         FROM submissions s
         JOIN users u ON s.student_id = u.userid
         LEFT JOIN submission_files f ON f.submission_id = s.submission_id
         WHERE s.assignment_id = $1
         GROUP BY s.submission_id, u.userid, u.firstname, u.lastname
         ORDER BY s.submitted_at ASC`,
        [assignmentId]
      );

      assignment.submissions = submissionsRes.rows;
      return res.json(assignment);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;