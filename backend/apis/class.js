import { Router } from "express";
import db from "../config/db.js";
import jwt from "jsonwebtoken";

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
// router.post("/", async (req, res) => {
//   const { name, description } = req.body;
//   try {
//     const { rows } = await db.query("INSERT INTO classes (name, description) VALUES ($1, $2)", [name, description]);
//     res.sendStatus(201);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// PUT update class info
router.put("/:classId", async (req, res) => {
    const classId = req.params.classId;
    const { name, description } = req.body;
    try {
        await db.query(
            `
      UPDATE classes SET name = $1, description = $2 WHERE classID = $3
      `,
            [name, description, classId]
        );
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// DELETE a class
router.delete("/:classId", async (req, res) => {
    const classId = req.params.classId;
    try {
        await db.query(`DELETE FROM classes WHERE classID = $1
      `, [classId]
        );
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET class by ID (still missing assignment list)
router.get("/:classId", async (req, res) => {
    const classId = req.params.classId;
    try {
        const { rows } = await db.query(
            `
      SELECT 
        c.classID, c.name, c.description, c.classCode, u.userID AS teacher_userId,
        u.firstName AS teacher_firstName, u.lastName AS teacher_lastName
        FROM classes c
        LEFT JOIN users u ON c.teacherID = u.userID
        WHERE c.classID = $1
    `,
            [classId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        const c = rows[0];
        const result = {
            classId: c.classid,
            name: c.name,
            description: c.description,
            classCode: c.classcode,
            teacher: {
                userId: c.teacher_userid,
                firstName: c.teacher_firstname,
                lastName: c.teacher_lastname,
            },
        };

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
      SELECT u.userID as "userId", u.firstName as "firstName", u.lastName as "lastName", u.role as "role"
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

router.post("/join", async (req, res) => {
    const { classCode } = req.body;

    try {
        const token = req.cookies.token;
        console.log("Token:", token);
        // printf("Token:", token);
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded:", decoded);
        const studentId = decoded.userid;

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
router.post("/:classId/invitations", async (req, res) => {
    const classId = req.params.classId;
    const { studentEmail } = req.body;
    try {
        // Find student by email
        const userResult = await db.query(
            `SELECT userID FROM users WHERE email = $1`,
            [studentEmail]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const studentId = userResult.rows[0].userid;

        // check if the student is already a member of the class
        const memberCheck = await db.query(
            `SELECT * FROM classMembers WHERE classID = $1 AND studentID = $2`,
            [classId, studentId]
        );

        if (memberCheck.rows.length > 0) {
            return res.status(400).json({ error: "Student is already a member of this class" });
        }

        // add the student to the class
        await db.query(
            `INSERT INTO classMembers (classID, studentID) VALUES ($1, $2)`,
            [classId, studentId]
        );

        res.sendStatus(201);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
