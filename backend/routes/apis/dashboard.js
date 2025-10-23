import { Router } from "express";
import db from "../../config/db.js";
import { authenticateJWT } from "../../middleware/auth.js";

const router = Router();

router.get("/", authenticateJWT(["student", "teacher"]), async (req, res) => {
  try {
    const { userid, role } = req.user;

    if (role === "student") {
      const { rows: upcomingDeadlines } = await db.query(
        `SELECT a.assignment_id AS "assignmentId", a.title, c.name AS "className", a.deadline
         FROM assignments a
         JOIN classes c ON a.class_id = c.classid
         JOIN classmembers cm ON c.classid = cm.classid
         WHERE cm.studentid = $1 AND a.deadline > NOW()
         ORDER BY a.deadline ASC LIMIT 5`,
        [userid]
      );

      const { rows: peerReviewsAwaiting } = await db.query(
        `SELECT pr.review_id AS "reviewId", a.title AS "assignmentTitle", pr.review_deadline AS "deadline"
         FROM peer_reviews pr
         JOIN submissions s ON pr.submission_id = s.submission_id
         JOIN assignments a ON s.assignment_id = a.assignment_id
         WHERE pr.reviewer_id = $1 AND pr.status = 'PENDING'
         ORDER BY pr.review_deadline ASC LIMIT 5`,
        [userid]
      );

      const { rows: recentFeedback } = await db.query(
        `SELECT a.assignment_id AS "assignmentId", a.title, s.score, s.submitted_at > NOW() - INTERVAL '3 days' AS "isNew"
         FROM submissions s
         JOIN assignments a ON s.assignment_id = a.assignment_id
         WHERE s.student_id = $1 AND s.score IS NOT NULL
         ORDER BY s.submitted_at DESC LIMIT 5`,
        [userid]
      );

      const { rows: classOverview } = await db.query(
        `SELECT c.classid AS "classId", c.name AS "className",
                ROUND(AVG(s.score)::numeric, 2) AS "overallGrade"
         FROM submissions s
         JOIN assignments a ON s.assignment_id = a.assignment_id
         JOIN classes c ON a.class_id = c.classid
         WHERE s.student_id = $1 AND s.score IS NOT NULL
         GROUP BY c.classid, c.name`,
        [userid]
      );

      const { rows: activityFeed } = await db.query(
        `SELECT type, message AS text, created_at AS timestamp
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 10`,
        [userid]
      );

      return res.json({
        actionCenter: { upcomingDeadlines, peerReviewsAwaiting, recentFeedback },
        myProgress: {
          skillPerformanceTrend: [],
          classOverview,
        },
        activityFeed,
      });
    }

    if (role === "teacher") {
      const { rows: assignmentsToGrade } = await db.query(
        `SELECT a.assignment_id AS "assignmentId", a.title, c.name AS "className",
                CONCAT(COUNT(s.score), '/', COUNT(*)) AS "progress"
         FROM assignments a
         JOIN classes c ON a.class_id = c.classid
         LEFT JOIN submissions s ON a.assignment_id = s.assignment_id
         WHERE c.teacherid = $1
         GROUP BY a.assignment_id, a.title, c.name
         HAVING COUNT(s.score) < COUNT(*)
         ORDER BY a.created_at DESC LIMIT 5`,
        [userid]
      );

      const { rows: recentSubmissions } = await db.query(
        `SELECT s.submission_id AS "submissionId",
                u.firstname || ' ' || u.lastname AS "studentName",
                a.title AS "assignmentTitle",
                s.submitted_at AS "timestamp"
         FROM submissions s
         JOIN users u ON s.student_id = u.userid
         JOIN assignments a ON s.assignment_id = a.assignment_id
         JOIN classes c ON a.class_id = c.classid
         WHERE c.teacherid = $1
         ORDER BY s.submitted_at DESC LIMIT 5`,
        [userid]
      );

      const { rows: submissionRateOverview } = await db.query(
        `SELECT c.name AS "className", a.title AS "assignmentTitle",
                ROUND(100.0 * COUNT(s.submission_id) / NULLIF(COUNT(cm.studentid),0),2) AS "rate"
         FROM assignments a
         JOIN classes c ON a.class_id = c.classid
         JOIN classmembers cm ON c.classid = cm.classid
         LEFT JOIN submissions s ON a.assignment_id = s.assignment_id AND s.student_id = cm.studentid
         WHERE c.teacherid = $1
         GROUP BY c.name, a.title`,
        [userid]
      );

      const { rows: assignmentsOverview } = await db.query(
        `SELECT a.assignment_id AS "assignmentId", a.title,
                ROUND(100.0 * COUNT(s.submission_id) / NULLIF(COUNT(cm.studentid),0),2) AS "submissionRate",
                ROUND(AVG(s.score)::numeric,2) AS "averageScore"
         FROM assignments a
         JOIN classes c ON a.class_id = c.classid
         JOIN classmembers cm ON c.classid = cm.classid
         LEFT JOIN submissions s ON a.assignment_id = s.assignment_id AND s.student_id = cm.studentid
         WHERE c.teacherid = $1
         GROUP BY a.assignment_id, a.title`,
        [userid]
      );

      return res.json({
        gradingQueue: { assignmentsToGrade, recentSubmissions },
        classHealthMonitor: {
          atRiskStudents: [],
          submissionRateOverview,
        },
        assignmentsOverview,
      });
    }

    res.status(400).json({ error: "Invalid role" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
