import { Router } from "express";
import usersApi from "./user.js";
import classesApi from "./class.js";
import rubricApi from "./rubric.js";
import assignmentApi from "./assignment.js";

const router = Router();

router.use("/auth", usersApi);
router.use("/class", classesApi);
router.use("/rubric", rubricApi);
router.use("/class", assignmentApi)

export default router;
