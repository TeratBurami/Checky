import { Router } from "express";
import db from "../../config/db.js";
import { authenticateJWT } from "../../middleware/auth.js";

const router = Router();

// Get all notification in database (for testing purposes)
router.get("/admin/all", async (req, res) => {
    try {
        const { rows } = await db.query(
            `
                SELECT
                    notification_id AS "notificationId",
                    user_id AS "userId",
                    type,
                    message,
                    link,
                    is_read AS "isRead",
                    created_at AS "createdAt"
                FROM notifications
                ORDER BY created_at DESC
            `
        );
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all notifications for a user
router.get("/", authenticateJWT("student", "teacher"), async (req, res) => {
    try {
        const userId = req.user.userid;
        const { rows } = await db.query(
            `
                SELECT 
                    notification_id AS "notificationId",
                    type,
                    message,
                    link,
                    is_read AS "isRead",
                    created_at AS "createdAt"
                FROM notifications
                WHERE user_id = $1
                ORDER BY created_at DESC
            `,
            [userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;