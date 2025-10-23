import express from "express";
import multer from "multer";
import db from "../../config/db.js";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

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
router.post("/:assignment_id/submission", upload.array("files"), async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { student_id, content } = req.body;

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

// ----------------------
// List all submissions with files
// ----------------------
router.get("/:assignment_id", async (req, res) => {
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
// Get single student's submission with files
// ----------------------
router.get("/:assignment_id/:student_id", async (req, res) => {
  try {
    const { assignment_id, student_id } = req.params;

    const { rows: submissions } = await db.query(
      `SELECT * FROM submissions WHERE assignment_id=$1 AND student_id=$2`,
      [assignment_id, student_id]
    );

    if (!submissions.length) return res.status(404).json({ error: "Not found" });

    const submission = submissions[0];

    const { rows: files } = await db.query(
      `SELECT file_id, filename, url FROM submission_files WHERE submission_id=$1`,
      [submission.submission_id]
    );

    submission.files = files;
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a single file from a submission
router.delete("/:assignment_id/:file_id", async (req, res) => {
  try {
    const { assignment_id, file_id } = req.params;

    // Get student_id from JWT
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student_id = decoded.userid; // matches your JWT payload

    // Get submission_id for this assignment and student
    const { rows: submissionRows } = await db.query(
      `SELECT submission_id FROM submissions WHERE assignment_id=$1 AND student_id=$2`,
      [assignment_id, student_id]
    );
    if (!submissionRows.length) return res.status(404).json({ error: "Submission not found" });

    const submission_id = submissionRows[0].submission_id;

    // Get file info
    const { rows: files } = await db.query(
      `SELECT url FROM submission_files WHERE submission_id=$1 AND file_id=$2`,
      [submission_id, file_id]
    );
    if (!files.length) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(process.cwd(), "uploads", files[0].url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Delete file record
    await db.query(`DELETE FROM submission_files WHERE file_id=$1`, [file_id]);

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
