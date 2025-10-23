import { Router } from "express";
import db from "../../config/db.js";
import { authenticateJWT } from "../../middleware/auth.js";

const router = Router();

router.get("/", authenticateJWT("student", "teacher"), async (req, res) => {
});


export default router;