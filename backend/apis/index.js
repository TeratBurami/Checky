import { Router } from "express";
import usersApi from "./user.js";

const router = Router();

router.use("/auth", usersApi);

export default router;
