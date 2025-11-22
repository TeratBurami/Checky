import request from "supertest";
import express from "express";

// Router under test
import assignmentRouter from "../../../routes/apis/assignment.js";

// Mock DB
jest.mock("../../../config/db.js", () => ({
  query: jest.fn()
}));
import db from "../../../config/db.js";

// Mock authenticateJWT
jest.mock("../../../middleware/auth.js", () => ({
  authenticateJWT: () => (req, res, next) => {
    req.user = { userid: 1, role: "teacher" };
    next();
  }
}));

const app = express();
app.use(express.json());
app.use("/api/v1/class", assignmentRouter);

describe("Assignment API", () => {
  afterEach(() => jest.clearAllMocks());

  test("POST /:classId/assignment → creates assignment", async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ rubric_id: 10 }] }) // rubric check
      .mockResolvedValueOnce({
        rows: [{
          assignmentId: 99,
          title: "Test",
          description: "Desc",
          deadline: "2025-01-01",
          rubricId: 10
        }]
      }) // insert assignment
      .mockResolvedValueOnce({
        rows: [{ studentid: 5 }, { studentid: 6 }]
      }) // classMembers
      .mockResolvedValueOnce({}); // insert notifications

    const res = await request(app)
      .post("/api/v1/class/123/assignment")
      .send({
        title: "Test",
        description: "Desc",
        deadline: "2025-01-01",
        rubricId: 10
      });

    expect(res.status).toBe(201);
    expect(res.body.assignment.assignmentId).toBe(99);
  });

  test("GET /:classId/assignment → returns assignments list", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          assignmentId: 99,
          title: "A",
          description: "D",
          deadline: "2025-01-01",
          created_at: "2025-01-01",
          rubricId: 10,
          rubricName: "R",
          criterionId: 1,
          criterionTitle: "C1",
          levelId: 1,
          levelName: "L1",
          score: 5,
          levelDescription: "OK"
        }
      ]
    });

    const res = await request(app).get("/api/v1/class/123/assignment");

    expect(res.status).toBe(200);
    expect(res.body.assignments.length).toBe(1);
  });

  test("PUT /:classId/assignment/:assignmentId → update assignment", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{
        assignmentId: 99,
        title: "Update",
        description: "Updated",
        deadline: "2025-01-02",
        rubricId: 10
      }]
    });

    const res = await request(app)
      .put("/api/v1/class/123/assignment/99")
      .send({
        title: "Update",
        description: "Updated",
        deadline: "2025-01-02",
        rubricId: 10
      });

    expect(res.status).toBe(200);
    expect(res.body.assignment.title).toBe("Update");
  });

  test("DELETE /:classId/assignment/:assignmentId → deletes assignment", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ assignmentId: 99 }]
    });

    const res = await request(app)
      .delete("/api/v1/class/123/assignment/99");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Assignment deleted successfully");
  });
});
