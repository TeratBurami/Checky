import request from "supertest";
import express from "express";
import router from "../../../routes/apis/peer-reviews.js";
import db from "../../../config/db.js";

// ------------------------------------------------------
// MOCK DB
// ------------------------------------------------------
jest.mock("../../../config/db.js", () => ({
  connect: jest.fn(),
  query: jest.fn()
}));

// ------------------------------------------------------
// MOCK AUTH MIDDLEWARE
// ------------------------------------------------------
jest.mock("../../../middleware/auth.js", () => ({
  authenticateJWT:
    (role) =>
    (req, res, next) => {
      req.user = { userid: 99, role };
      next();
    }
}));

// ------------------------------------------------------
// EXPRESS TEST APP
// ------------------------------------------------------
const app = express();
app.use(express.json());
app.use("/peer-review", router);

// helpers
const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

db.connect.mockResolvedValue(mockClient);

beforeEach(() => {
  jest.clearAllMocks();
  mockClient.query.mockReset();
});

// ------------------------------------------------------
// TEST SUITE
// ------------------------------------------------------
describe("Peer Review Routes", () => {
  // -----------------------------
  // POST /peer-review/
  // -----------------------------
  it("POST / → assigns peer review", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rows: [{ class_id: 10 }]
      }) // submission exists
      .mockResolvedValueOnce({
        rows: [{}]
      }) // reviewer in class
      .mockResolvedValueOnce({
        rows: [
          {
            review_id: 1,
            submission_id: 2,
            reviewer_id: 3,
            status: "PENDING"
          }
        ]
      }) // insert review
      .mockResolvedValueOnce({}) // insert notification
      .mockResolvedValueOnce({}); // COMMIT

    const res = await request(app)
      .post("/peer-review/")
      .send({
        submission_id: 2,
        reviewer_id: 3,
        review_deadline: "2025-12-30"
      });

    expect(res.status).toBe(201);
    expect(res.body.review.review_id).toBe(1);
  });

  // -----------------------------
  // GET /peer-review/ (student)
  // -----------------------------
  it("GET / → returns reviews for logged-in student", async () => {
    db.query.mockResolvedValue({
      rows: [{ review_id: 1 }, { review_id: 2 }]
    });

    const res = await request(app).get("/peer-review/");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  // -----------------------------
  // GET /peer-review/admin/all
  // -----------------------------
  it("GET /admin/all → returns all peer reviews", async () => {
    db.query.mockResolvedValue({ rows: [{ id: 1 }] });

    const res = await request(app).get("/peer-review/admin/all");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  // -----------------------------
  // PUT /peer-review/:review_id
  // -----------------------------
  it("PUT /:id → updates review + generates notification", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({
        rows: [{ reviewer_id: 99 }] // ownership check
      })
      .mockResolvedValueOnce({
        rows: [{ student_notified_id: 888 }] // update + notify
      })
      .mockResolvedValueOnce({}); // COMMIT

    const res = await request(app)
      .put("/peer-review/5")
      .send({ comments: "Good job" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("COMPLETED");
  });

  // -----------------------------
  // GET /peer-review/:review_id (full detail)
  // -----------------------------
  it("GET /:id → returns full peer review details", async () => {
    db.query
      .mockResolvedValueOnce({
        rows: [
          {
            reviewId: 1,
            assignment: { rubricId: 10 },
            submission: {},
            class: {},
            reviewer: {},
            student: {}
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          {
            rubricId: 10,
            name: "Rubric Test",
            criteria: []
          }
        ]
      });

    const res = await request(app).get("/peer-review/1");

    expect(res.status).toBe(200);
    expect(res.body.reviewId).toBe(1);
    expect(res.body.assignment.rubric.rubricId).toBe(10);
  });

  // -----------------------------
  // GET /peer-review/:id → not found
  // -----------------------------
  it("GET /:id → returns 404 if review missing", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/peer-review/99");

    expect(res.status).toBe(404);
  });
});
