import { Router } from "express";
import db from "../../config/db.js";
import { authenticateJWT } from "../../middleware/auth.js";

const router = Router();

// GET all classes
router.get("/", async (req, res) => {
    try {
        const { rows } = await db.query(
            `
      SELECT c.classID as "classId", c.name, c.description, CONCAT(u.firstName, ' ', u.lastName) as teacher, COUNT(cm)::int as "memberCount"
      FROM classes c 
      LEFT JOIN users u ON c.teacherID = u.userID
      LEFT JOIN classMembers cm ON c.classID = cm.classID
      GROUP BY c.classID, u.firstName, u.lastName
      ORDER BY c.classID ASC
    `
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create a new class (stuck at non-null constraint error from db)
router.post("/", authenticateJWT(['teacher']), async (req, res) => {
    const { name, description } = req.body;

    try {
        const teacherID = req.user.userid;
        const { rows: teacherRows } = await db.query(
            "SELECT firstName, lastName FROM users WHERE userID=$1 AND role='teacher'",
            [teacherID]
        );

        if (teacherRows.length === 0)
            return res.status(404).json({ error: "Teacher not found" });

        const teacher = teacherRows[0];
        const classCode = await genUniqueClassCode(
            db,
            name,
            teacher.firstname,
            teacher.lastname
        );

        const { rows } = await db.query(
            "INSERT INTO classes (name, description, classCode, teacherID) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, description, classCode, teacherID]
        );

        res.status(201).json({
            status: res.statusCode,
            msg: "Class created successfully with id " + rows[0].classid,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/:classId", authenticateJWT(['teacher']), async (req, res) => {
    const classId = req.params.classId;
    const { name, description } = req.body;
    const teacherId = req.user.userid;

    try {
        const { rowCount } = await db.query(
            `UPDATE classes
             SET name = $1, description = $2
             WHERE classID = $3 AND teacherID = $4`,
            [name, description, classId, teacherId]
        );

        if (rowCount === 0) {
            return res.status(403).json({ error: "Forbidden: you do not teach this class or class not found" });
        }

        res.status(200).json({
            status: res.statusCode,
            msg: "Class updated successfully",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a class
router.delete("/:classId", authenticateJWT(['teacher']), async (req, res) => {
    const classId = req.params.classId;
    const teacherId = req.user.userid;

    try {
        const { rowCount } = await db.query(
            `DELETE FROM classes 
             WHERE classID = $1 AND teacherID = $2`,
            [classId, teacherId]
        );

        if (rowCount === 0) {
            return res.status(403).json({ error: "Forbidden: you do not teach this class or class not found" });
        }

        res.status(200).json({
            status: res.statusCode,
            msg: "Class deleted successfully",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET class by ID (with assignment list + role-based info)
router.get("/:classId", authenticateJWT(), async (req, res) => {
    const { classId } = req.params;
    const user = req.user;

    try {
        // Base class and assignments info
        const { rows } = await db.query(`
            SELECT 
                c.classID, c.name, c.description, c.classCode,
                u.userID AS teacher_userId, u.firstName AS teacher_firstName, u.lastName AS teacher_lastName,
                a.assignment_id, a.title AS assignment_title, a.deadline AS assignment_deadline,
                s.submission_id, s.score, s.submitted_at
            FROM classes c
            LEFT JOIN users u ON c.teacherID = u.userID
            LEFT JOIN assignments a ON c.classID = a.class_id
            LEFT JOIN submissions s ON a.assignment_id = s.assignment_id AND s.student_id = $2
            WHERE c.classID = $1
            ORDER BY a.created_at ASC
        `, [classId, user.userid]);

        if (rows.length === 0) return res.status(404).json({ error: "Class not found" });

        const first = rows[0];

        const now = new Date();
        const assignments = rows.filter(r => r.assignment_id).map(a => {
            let status;

            if (a.submission_id) {
                status = a.score !== null ? "GRADED" : "SUBMITTED";
            } else if (a.assignment_deadline && new Date(a.assignment_deadline) < now) {
                status = "OVERDUE";
            } else {
                status = "MISSING";
            }

            return {
                assignmentId: a.assignment_id,
                title: a.assignment_title,
                deadline: a.assignment_deadline,
                status,
            };
        });

        const result = {
            classId: first.classid,
            name: first.name,
            description: first.description,
            classCode: first.classcode,
            teacher: {
                userId: first.teacher_userid,
                firstName: first.teacher_firstname,
                lastName: first.teacher_lastname,
            },
            assignments,
        };

        if (user.role === "student") {
            const totalAssignments = assignments.length;

            const { rows: stats } = await db.query(`
                SELECT 
                    COUNT(s.submission_id) AS completed,
                    COALESCE(AVG(s.score), 0) AS avg_score
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.assignment_id
                WHERE a.class_id = $1 AND s.student_id = $2
            `, [classId, user.userid]);

            const completed = parseInt(stats[0].completed, 10);
            const completeness = totalAssignments > 0
                ? Math.floor((completed / totalAssignments) * 10000) / 100
                : 0;

            const avgScore = Math.floor(parseFloat(stats[0].avg_score) * 100) / 100;

            result.completeness = completeness;
            result.avgScore = avgScore;
        } else if (user.role === "teacher") {
            const { rows: memberRows } = await db.query(`
                SELECT COUNT(*) AS membersCount
                FROM classMembers
                WHERE classID = $1
            `, [classId]);

            result.membersCount = parseInt(memberRows[0].memberscount, 10);
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// GET class members
router.get("/:classId/members", async (req, res) => {
    const classId = req.params.classId;
    try {
        const { rows } = await db.query(
            `
      SELECT u.userID as "userId", u.firstName as "firstName", u.lastName as "lastName", u.email as "email"
      FROM classMembers cm
      JOIN users u ON cm.studentID = u.userID
      WHERE cm.classID = $1
    `,
            [classId]
        );

        res.json({ members: rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/join", authenticateJWT(["student"]), async (req, res) => {
    const { classCode } = req.body;

    try {
        const studentId = req.user.userid;

        // find class by code
        const classResult = await db.query(
            `SELECT classID FROM classes WHERE classCode = $1`,
            [classCode]
        );
        if (classResult.rows.length === 0)
            return res.status(404).json({ error: "Class not found" });

        const classId = classResult.rows[0].classid;

        // check if already a member
        const memberCheck = await db.query(
            `SELECT 1 FROM classMembers WHERE classID = $1 AND studentID = $2`,
            [classId, studentId]
        );
        if (memberCheck.rows.length > 0)
            return res.status(400).json({ error: "Already joined this class" });

        await db.query(
            `INSERT INTO classMembers (classID, studentID) VALUES ($1, $2)`,
            [classId, studentId]
        );

        res.status(201).json({
            status: res.statusCode,
            msg: "Joined class successfully",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add student to class with email
router.post("/:classId/invitations", authenticateJWT(["teacher"]), async (req, res) => {
    const classId = req.params.classId;
    const { studentEmail } = req.body;
    try {
        // Find student by email
        const userResult = await db.query(
            `SELECT userID, role FROM users WHERE email = $1`,
            [studentEmail]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        } else if (userResult.rows[0].role !== "student") {
            return res.status(400).json({ error: "User is not a student" });
        }

        const studentId = userResult.rows[0].userid;

        const memberCheck = await db.query(
            `SELECT * FROM classMembers WHERE classID = $1 AND studentID = $2`,
            [classId, studentId]
        );

        if (memberCheck.rows.length > 0) {
            return res.status(400).json({ error: "Student is already a member of this class" });
        }

        await db.query(
            `INSERT INTO classMembers (classID, studentID) VALUES ($1, $2)`,
            [classId, studentId]
        );

        res.status(201).json({
            status: res.statusCode,
            msg: "Student added to class with id " + classId + " successfully",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function genUniqueClassCode(db, name, teacherFirst, teacherLast) {
    const namePrefix = (name?.trim().substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')) || 'CLS';
    const teacherPrefix =
        ((teacherFirst?.[0] || '').toUpperCase() + (teacherLast?.[0] || '').toUpperCase()) || 'XX';
    let code, exists;
    do {
        const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
        code = `${namePrefix}${teacherPrefix}${randomPart}`;
        const { rowCount } = await db.query("SELECT 1 FROM classes WHERE classCode=$1", [code]);
        exists = rowCount > 0;
    } while (exists);
    return code;
}

export default router;
