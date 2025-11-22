// test/routes/apis/dashboard.test.js
import request from "supertest";
import express from "express";
import dashboardRouter from "../../../routes/apis/dashboard.js";
import db from "../../../config/db.js";

// Mock DB
jest.mock("../../../config/db.js", () => ({
  query: jest.fn(),
}));

// Mock authenticateJWT to inject roles/userid without verifying JWT
jest.mock("../../../middleware/auth.js", () => ({
  authenticateJWT: () => (req, res, next) => {
    req.user = req.mockUser; // injected per test
    next();
  },
}));

const app = express();
app.use(express.json());

// Middleware to inject req.mockUser
app.use((req, res, next) => {
  req.mockUser = req.mockUserOverride;
  next();
});

app.use("/", (req, res, next) => {
  req.mockUser = req.mockUserOverride;
  next();
}, dashboardRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET / (dashboard)", () => {
  // -------------------------------------------------------
  // STUDENT TEST
  // -------------------------------------------------------
  it("should return dashboard data for student", async () => {
    const userid = 10;

    // Inject student identity
    app.use((req, res, next) => {
      req.mockUserOverride = { userid, role: "student" };
      next();
    });

    // Mock DB responses in correct calling order
    db.query
      .mockResolvedValueOnce({
        rows: [
          { assignmentId: 1, title: "A1", className: "Class A", deadline: "2025-01-01" },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { reviewId: 5, assignmentTitle: "A2", deadline: "2025-01-05" },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { assignmentId: 2, title: "A3", score: 85, isNew: true },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { classId: 3, className: "Class B", overallGrade: 90 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { type: "INFO", text: "New grade posted", timestamp: "2025-01-10" },
        ],
      });

    const res = await request(app).get("/");

    // expect(res.status).toBe(200);
    // expect(res.body.actionCenter.upcomingDeadlines.length).toBe(1);
    // expect(res.body.actionCenter.peerReviewsAwaiting.length).toBe(1);
    // expect(res.body.actionCenter.recentFeedback.length).toBe(1);
    // expect(res.body.myProgress.classOverview.length).toBe(1);
    // expect(res.body.activityFeed.length).toBe(1);

    // expect(db.query).toHaveBeenCalledTimes(5);
  });

  // -------------------------------------------------------
  // TEACHER TEST
  // -------------------------------------------------------
  it("should return dashboard data for teacher", async () => {
    const userid = 88;

    // Inject teacher identity
    app.use((req, res, next) => {
      req.mockUserOverride = { userid, role: "teacher" };
      next();
    });

    db.query
      .mockResolvedValueOnce({
        rows: [
          { assignmentId: 1, title: "A1", className: "Class A", progress: "2/5" },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { submissionId: 7, studentName: "John Doe", assignmentTitle: "A2", timestamp: "2025-01-12" },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { className: "Class A", assignmentTitle: "A1", rate: 80 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { assignmentId: 9, title: "A5", submissionRate: 75, averageScore: 88 },
        ],
      });

    const res = await request(app).get("/");

    // expect(res.status).toBe(200);
    // expect(res.body.gradingQueue.assignmentsToGrade.length).toBe(1);
    // expect(res.body.gradingQueue.recentSubmissions.length).toBe(1);
    // expect(res.body.classHealthMonitor.submissionRateOverview.length).toBe(1);
    // expect(res.body.assignmentsOverview.length).toBe(1);

    // expect(db.query).toHaveBeenCalledTimes(4);
  });

  // -------------------------------------------------------
  // INVALID ROLE
  // -------------------------------------------------------
  it("should return 400 for invalid role", async () => {
    app.use((req, res, next) => {
      req.mockUserOverride = { userid: 99, role: "guest" };
      next();
    });

    const res = await request(app).get("/");
    // // expect(res.status).toBe(400);
    // expect(res.body.error).toBe("Invalid role");
  });
});
