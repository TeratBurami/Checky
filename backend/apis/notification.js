import { Router } from "express";
import db from "../config/db.js";
import jwt from "jsonwebtoken";

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
router.get("/", async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: "Unauthorized" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userid;
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