import { Router } from "express";
import usersApi from "./user.js";
import classesApi from "./class.js";

const router = Router();

router.use("/auth", usersApi);
router.use("/class", classesApi);

export default router;
