import { Router } from "express";
import db from "../../config/db.js";
import { authenticateJWT } from "../../middleware/auth.js";

const router = Router();

// POST create a new peer review and notify the reviewer
router.post("/", authenticateJWT("teacher"), async (req, res) => {
    const client = await db.connect();
    try {
        await client.query("BEGIN");

        const { submission_id, reviewer_id, review_deadline } = req.body;
        const teacher_id = req.user.userid;

        // Check submission exists and belongs to a class the teacher owns
        const { rows: submissionRows } = await client.query(
            `SELECT s.submission_id, s.student_id, a.class_id
             FROM submissions s
             JOIN assignments a ON a.assignment_id = s.assignment_id
             JOIN classes c ON c.classID = a.class_id
             WHERE s.submission_id = $1 AND c.teacherID = $2`,
            [submission_id, teacher_id]
        );

        if (submissionRows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Submission not found or not allowed" });
        }

        const class_id = submissionRows[0].class_id;

        // Check reviewer is in class
        const { rows: memberRows } = await client.query(
            `SELECT * FROM classMembers
             WHERE classID = $1 AND studentID = $2`,
            [class_id, reviewer_id]
        );

        if (memberRows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(403).json({ error: "Reviewer not enrolled in class" });
        }

        // Insert peer review
        const { rows: reviewRows } = await client.query(
            `INSERT INTO peer_reviews (submission_id, reviewer_id, review_deadline)
             VALUES ($1, $2, $3)
             RETURNING review_id, submission_id, reviewer_id, status, created_at`,
            [submission_id, reviewer_id, review_deadline]
        );

        const review = reviewRows[0];

        // Create notification for reviewer
        await client.query(
            `INSERT INTO notifications (user_id, type, message, link)
            SELECT $1, 'PEER_REVIEW_ASSIGNED', 
            CONCAT('You have been assigned a peer review for submission ID: ', $2::TEXT), 
            '/submission/' || $2::TEXT || '/review'
            `,
            [reviewer_id, submission_id]
        );

        await client.query("COMMIT");
        res.status(201).json({ message: "Peer review assigned", review });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});


//GET all peer reviews that belong to User
router.get("/", authenticateJWT("student"), async (req, res) => {
    try {
        const student_id = req.user.userid;
        const { rows } = await db.query(
            `
                SELECT * FROM peer_reviews
                WHERE reviewer_id = $1
                ORDER BY created_at DESC
            `,
            [student_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all peer reviews in database (for testing purposes)
router.get("/admin/all", async (req, res) => {
    try {
        const { rows } = await db.query(
            `
                SELECT * FROM peer_reviews
                ORDER BY created_at DESC
            `
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Submit comment in peer review AND generate NEW_COMMENT notification
router.put("/:review_id", authenticateJWT("student"), async (req, res) => {
    const client = await db.connect();
    try {
        await client.query("BEGIN");

        const { review_id } = req.params;
        const { comments } = req.body;
        const userId = req.user.userid;

        // Check if the user is the assigned reviewer
        const { rows: checkRows } = await client.query(
            "SELECT reviewer_id FROM peer_reviews WHERE review_id = $1",
            [review_id]
        );

        if (checkRows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Peer review not found" });
        }

        if (checkRows[0].reviewer_id !== userId) {
            await client.query("ROLLBACK");
            return res.status(403).json({ error: "You are not authorized to review this submission" });
        }

        // Update review (without updated_at)
        const { rows } = await client.query(
            `
            WITH updated_review AS (
                UPDATE peer_reviews
                SET comments = $1, status = 'COMPLETED'
                WHERE review_id = $2
                RETURNING submission_id, reviewer_id
            ),
            submission_details AS (
                SELECT
                    ur.submission_id,
                    ur.reviewer_id,
                    s.student_id,
                    a.title AS assignment_title,
                    u.firstName AS r_fn,
                    u.lastName AS r_ln
                FROM updated_review ur
                JOIN submissions s ON s.submission_id = ur.submission_id
                JOIN assignments a ON a.assignment_id = s.assignment_id
                JOIN users u ON u.userID = ur.reviewer_id
            ),
            notification_data AS (
                SELECT 
                    student_id,
                    CONCAT(r_fn, ' ', r_ln) AS reviewer_name,
                    assignment_title,
                    submission_id
                FROM submission_details
            )
            INSERT INTO notifications (user_id, type, message, link)
            SELECT
                nd.student_id,
                'NEW_COMMENT',
                CONCAT(nd.reviewer_name, ' left a comment on your peer review for assignment: ', nd.assignment_title, '.'),
                CONCAT('/submission/', nd.submission_id, '/review')
            FROM notification_data nd
            RETURNING user_id AS student_notified_id;
            `,
            [comments, review_id]
        );

        await client.query("COMMIT");
        res.json({
            review_id,
            status: "COMPLETED",
            message: "Review completed and student notified."
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error updating peer review and generating notification:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// GET: Full peer review details including class, assignment, submission, users, and rubric
router.get("/:review_id", authenticateJWT(["student", "teacher"]), async (req, res) => {
  const { review_id } = req.params;

  try {
    // Base info join
    const { rows } = await db.query(
      `
      SELECT 
        pr.review_id AS "reviewId",
        pr.comments,
        pr.status,
        pr.review_deadline AS "reviewDeadline",
        pr.created_at AS "createdAt",

        -- Reviewer info
        json_build_object(
          'userId', reviewer.userID,
          'firstName', reviewer.firstName,
          'lastName', reviewer.lastName,
          'email', reviewer.email,
          'role', reviewer.role
        ) AS reviewer,

        -- Student info
        json_build_object(
          'userId', student.userID,
          'firstName', student.firstName,
          'lastName', student.lastName,
          'email', student.email,
          'role', student.role
        ) AS student,

        -- Class info
        json_build_object(
          'classId', c.classID,
          'name', c.name,
          'description', c.description,
          'classCode', c.classCode,
          'teacher', json_build_object(
            'userId', teacher.userID,
            'firstName', teacher.firstName,
            'lastName', teacher.lastName,
            'email', teacher.email
          )
        ) AS class,

        -- Assignment info
        json_build_object(
          'assignmentId', a.assignment_id,
          'title', a.title,
          'description', a.description,
          'deadline', a.deadline,
          'createdAt', a.created_at,
          'rubricId', a.rubric_id
        ) AS assignment,

        -- Submission info
        json_build_object(
          'submissionId', s.submission_id,
          'content', s.content,
          'submittedAt', s.submitted_at,
          'score', s.score,
          'teacherComment', s.teacher_comment,
          'files', COALESCE(
            json_agg(
              json_build_object('fileId', f.file_id, 'filename', f.filename, 'url', f.url)
            ) FILTER (WHERE f.file_id IS NOT NULL), '[]'::json
          )
        ) AS submission

      FROM peer_reviews pr
      JOIN submissions s ON pr.submission_id = s.submission_id
      JOIN assignments a ON s.assignment_id = a.assignment_id
      JOIN classes c ON a.class_id = c.classID
      JOIN users teacher ON c.teacherID = teacher.userID
      JOIN users reviewer ON pr.reviewer_id = reviewer.userID
      JOIN users student ON s.student_id = student.userID
      LEFT JOIN submission_files f ON f.submission_id = s.submission_id
      WHERE pr.review_id = $1
      GROUP BY pr.review_id, reviewer.userID, student.userID, a.assignment_id, s.submission_id, c.classID, teacher.userID
      `,
      [review_id]
    );

    if (!rows.length) return res.status(404).json({ error: "Peer review not found" });
    const base = rows[0];

    // Fetch rubric if the assignment has one
    let rubric = null;
    const rubricId = base.assignment.rubricId;

    if (rubricId) {
      const { rows: rubricRows } = await db.query(
        `
        SELECT 
          r.rubric_id AS "rubricId",
          r.name,
          json_agg(
            json_build_object(
              'criterionId', c.criterion_id,
              'title', c.title,
              'levels', (
                SELECT json_agg(
                  json_build_object(
                    'levelId', l.level_id,
                    'levelName', l.level_name,
                    'score', l.score,
                    'description', l.description
                  )
                )
                FROM rubric_levels l
                WHERE l.criterion_id = c.criterion_id
              )
            )
          ) AS criteria
        FROM rubrics r
        JOIN rubric_criteria c ON r.rubric_id = c.rubric_id
        WHERE r.rubric_id = $1
        GROUP BY r.rubric_id, r.name
        `,
        [rubricId]
      );
      rubric = rubricRows[0] || null;
    }

    base.assignment.rubric = rubric;
    res.json(base);
  } catch (err) {
    console.error("Error fetching full peer review details:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
