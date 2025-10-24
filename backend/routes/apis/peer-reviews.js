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

export default router;
