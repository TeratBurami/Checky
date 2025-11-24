import { Router } from "express";
import usersApi from "./apis/user.js";
import classesApi from "./apis/class.js";
import rubricApi from "./apis/rubric.js";
import assignmentApi from "./apis/assignment.js";
import notificationApi from "./apis/notification.js";
import submissionsApi from "./apis/submissions.js";
import peerReviewsApi from "./apis/peer-reviews.js";
import dashboardApi from "./apis/dashboard.js";

const router = Router();

router.use("/auth", usersApi);
router.use("/class", classesApi);
router.use("/class", assignmentApi);
router.use("/class", submissionsApi);
router.use("/peer-review", peerReviewsApi);
router.use("/rubric", rubricApi);
router.use("/notifications", notificationApi);
router.use("/dashboard", dashboardApi);

//test1

export default router;
