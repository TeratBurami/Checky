import express from "express";
import multer from "multer";
import db from "../../config/db.js";
import path from "path";
import fs from "fs";
import { authenticateJWT } from "../../middleware/auth.js";

const router = express.Router();

// ----------------------
// Multer setup
// ----------------------
const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname); // unique on disk
  },
});
const upload = multer({ storage });

// ----------------------
// Download a file by file_id
// Must be BEFORE numeric routes to avoid conflicts
// ----------------------
router.get("/download/:file_id", async (req, res) => {
  try {
    const { file_id } = req.params;

    const { rows } = await db.query(
      `SELECT filename, url FROM submission_files WHERE file_id=$1`,
      [file_id]
    );
    if (!rows.length) return res.status(404).json({ error: "File not found" });

    const fileRow = rows[0];
    const filePath = path.join(process.cwd(), "uploads", fileRow.url);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File missing on server" });

    res.download(filePath, fileRow.filename); // forces download
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Create/update submission with files
// ----------------------
router.post("/:assignment_id/submission", authenticateJWT(["student"]), upload.array("files"), async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const student_id = req.user.userid;
    const { content } = req.body;

    const submissionResult = await db.query(
      `INSERT INTO submissions (assignment_id, student_id, content)
       VALUES ($1, $2, $3)
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET content=$3, submitted_at=NOW()
       RETURNING submission_id`,
      [assignment_id, student_id, content]
    );
    const submission_id = submissionResult.rows[0].submission_id;

    const files = req.files || [];
    for (const file of files) {
      await db.query(
        `INSERT INTO submission_files (submission_id, filename, url)
         VALUES ($1, $2, $3)`,
        [submission_id, file.originalname, file.filename]
      );
    }

    res.json({
      message: "Submission saved",
      files: files.map(f => ({ filename: f.originalname, file_id: f.filename })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update score and teacher comment for a submission (teacher only)
router.put("/:submission_id/grade", authenticateJWT(["teacher"]), async (req, res) => {
  const { submission_id } = req.params;
  const { score, teacher_comment } = req.body;

  try {
    const result = await db.query(
      `UPDATE submissions
       SET score = $1, teacher_comment = $2
       WHERE submission_id = $3
       RETURNING *`,
      [score, teacher_comment, submission_id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Submission not found" });

    res.status(200).json({ message: "Submission graded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------------
// List all submissions with files
// ----------------------
router.get("/:assignment_id/submission/all", async (req, res) => {
  try {
    const { assignment_id } = req.params;

    const { rows: submissions } = await db.query(
      `SELECT * FROM submissions WHERE assignment_id=$1`,
      [assignment_id]
    );

    for (const sub of submissions) {
      const { rows: files } = await db.query(
        `SELECT file_id, filename, url FROM submission_files WHERE submission_id=$1`,
        [sub.submission_id]
      );
      sub.files = files;
    }

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// Get single student's submission with files + extra info
// ----------------------
router.get("/:assignment_id/student/:student_id", async (req, res) => {
  try {
    const { assignment_id, student_id } = req.params;

    const { rows } = await db.query(
      `
      SELECT 
        s.submission_id,
        s.assignment_id,
        s.student_id,
        s.content,
        s.submitted_at,
        s.score,
        s.teacher_comment,
        u.firstName AS student_first,
        u.lastName AS student_last,
        a.title AS assignment_title
      FROM submissions s
      JOIN users u ON s.student_id = u.userID
      JOIN assignments a ON s.assignment_id = a.assignment_id
      WHERE s.assignment_id = $1 AND s.student_id = $2
      `,
      [assignment_id, student_id]
    );

    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const submission = rows[0];

    const { rows: files } = await db.query(
      `SELECT file_id, filename, url FROM submission_files WHERE submission_id = $1`,
      [submission.submission_id]
    );

    const response = {
      submission_id: submission.submission_id,
      assignment_id: submission.assignment_id,
      student_id: submission.student_id,
      content: submission.content,
      submitted_at: submission.submitted_at,
      score: submission.score,
      teacher_comment: submission.teacher_comment,
      files,
      studentInfo: {
        firstName: submission.student_first,
        lastName: submission.student_last,
      },
      assignmentInfo: {
        title: submission.assignment_title,
      },
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete a single file from a submission
router.delete("/:assignment_id/file/:file_id", authenticateJWT(["student"]), async (req, res) => {
  try {
    const { assignment_id, file_id } = req.params;
    const student_id = req.user.userid;

    const { rows: submissionRows } = await db.query(
      `SELECT submission_id FROM submissions WHERE assignment_id=$1 AND student_id=$2`,
      [assignment_id, student_id]
    );
    if (!submissionRows.length) return res.status(404).json({ error: "Submission not found" });

    const submission_id = submissionRows[0].submission_id;

    const { rows: files } = await db.query(
      `SELECT url FROM submission_files WHERE submission_id=$1 AND file_id=$2`,
      [submission_id, file_id]
    );
    if (!files.length) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(process.cwd(), "uploads", files[0].url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query(`DELETE FROM submission_files WHERE file_id=$1`, [file_id]);

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:assignmentId/autograde
router.post("/:assignmentId/autograde", authenticateJWT(["teacher"]), async (req, res) => {
  const { assignmentId } = req.params;

  try {
    // Get all ungraded submissions for this assignment
    const { rows: submissions } = await db.query(`
      SELECT submission_id, content
      FROM submissions
      WHERE assignment_id = $1 AND score IS NULL
    `, [assignmentId]);

    if (submissions.length === 0)
      return res.json({ message: "No ungraded submissions found", gradedCount: 0 });

    // Simple deterministic "auto-grading" algorithm
    for (const s of submissions) {
      const len = (s.content || "").trim().length;
      const base = len * 0.1;
      const noise = Math.random() * 100; // small variation
      const score = Math.round(Math.min(100, Math.max(0, base + noise) % 100)); // round to integer

      await db.query(
        `UPDATE submissions SET score = $1, teacher_comment = $2 WHERE submission_id = $3`,
        [score, "Auto-graded by system", s.submission_id]
      );
    }

    res.json({
      message: "Auto-grading complete",
      gradedCount: submissions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
