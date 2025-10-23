import { Router } from "express";
import db from "../../config/db.js";
import jwt from "jsonwebtoken";

const router = Router();

//GET all peer reviews that belong to User
router.get("/", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: "Unauthorized" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const student_id = decoded.userid;
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

// PUT sent comment in peer review AND generate a NEW_COMMENT notification
router.put("/:review_id", async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN'); 

        const { review_id } = req.params;
        const { comments } = req.body;
        const { rows } = await client.query(
            `
            WITH updated_review AS (
                UPDATE peer_reviews
                SET comments = $1, status = 'COMPLETED', updated_at = NOW()
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
                nd.reviewer_name || ' left a comment on your peer review for assignment: ' || nd.assignment_title || '.',
                '/submission/' || nd.submission_id || '/review'
            FROM notification_data nd
            RETURNING user_id AS student_notified_id; -- Return a dummy row to know if anything ran
            `,
            [comments, review_id]
        );
        

        if (rows.length === 0) {
            // Check if review was even found before assuming notification failed
            const { rows: checkRows } = await client.query('SELECT review_id FROM peer_reviews WHERE review_id = $1', [review_id]);
            if (checkRows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: "Peer review not found" });
            }
            // If rows.length === 0 but checkRows.length > 0, something went wrong with notification insertion
            console.warn(`Review ID ${review_id} updated, but notification failed to insert.`);
        }


        await client.query('COMMIT'); 
        res.json({ review_id: review_id, status: 'COMPLETED', message: "Review completed and student notified." });
        
    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error("Error updating peer review and generating notification:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release(); 
    }
});

export default router;