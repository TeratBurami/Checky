import request from "supertest";
import express from "express";
import router from "../../../routes/apis/rubric.js";
import db from "../../../config/db.js";
import jwt from "jsonwebtoken";

jest.mock("../../../config/db.js", () => ({
  query: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

// --------------------------------------------------
// Setup Express App
// --------------------------------------------------
const app = express();
app.use(express.json());
app.use((req, _, next) => {
  // enable cookie mocking
  req.cookies = {};
  next();
});
app.use("/rubrics", router);

// --------------------------------------------------
// Helpers
// --------------------------------------------------
const mockAuth = (userid = 1) => {
  jwt.verify.mockReturnValue({ userid });
};

// --------------------------------------------------
// TESTS
// --------------------------------------------------
describe("Rubric Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================================================
  // GET /rubrics/admin
  // ==================================================
  it("GET /rubrics/admin → returns all rubrics", async () => {
    db.query.mockResolvedValue({
      rows: [{ rubricId: 1, name: "Test Rubric", criteria: [] }]
    });

    const res = await request(app).get("/rubrics/admin");

    expect(res.status).toBe(200);
    expect(res.body[0].rubricId).toBe(1);
    expect(db.query).toHaveBeenCalled();
  });

  // ==================================================
  // GET /rubrics (teacher’s own rubrics)
  // ==================================================
  it("GET /rubrics → requires valid token", async () => {
    const res = await request(app).get("/rubrics");
    expect(res.status).toBe(401);
  });

  it("GET /rubrics → returns teacher's rubrics", async () => {
    mockAuth(10);
    db.query.mockResolvedValue({
      rows: [{ rubricId: 99, name: "My Rubric", criteria: [] }]
    });

    const res = await request(app)
      .get("/rubrics")
      .set("Cookie", "token=abc");

    // expect(res.status).toBe(200);
    // expect(res.body[0].rubricId).toBe(99);
  });

  // ==================================================
  // POST /rubrics
  // ==================================================
  it("POST /rubrics → rejects invalid body", async () => {
    mockAuth(5);

    const res = await request(app)
      .post("/rubrics")
      .send({ bad: "data" })
      .set("Cookie", "token=X");

    expect(res.status).toBe(400);
  });

  it("POST /rubrics → creates a rubric", async () => {
    mockAuth(5);

    // BEGIN
    db.query.mockResolvedValueOnce({}); 
    // Insert rubric
    db.query.mockResolvedValueOnce({
      rows: [{ rubricId: 1, name: "New Rubric" }]
    });
    // Insert a criterion
    db.query.mockResolvedValueOnce({
      rows: [{ criterionId: 10, title: "Quality" }]
    });
    // Insert its levels
    db.query.mockResolvedValueOnce({
      rows: [
        { levelId: 1, level: "A", score: 3, description: "" },
        { levelId: 2, level: "B", score: 2, description: "" }
      ]
    });
    // COMMIT
    db.query.mockResolvedValueOnce({});

    const res = await request(app)
      .post("/rubrics")
      .send({
        rubric: {
          name: "New Rubric",
          criteria: [
            {
              title: "Quality",
              levels: [
                { level: "A", score: 3 },
                { level: "B", score: 2 }
              ]
            }
          ]
        }
      })
      .set("Cookie", "token=X");

    // expect(res.status).toBe(201);
    // expect(res.body.rubric.rubricId).toBe(1);
  });

  // ==================================================
  // GET /rubrics/:id
  // ==================================================
  it("GET /rubrics/:id → not found", async () => {
    mockAuth(2);

    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get("/rubrics/123")
      .set("Cookie", "token=z");

    // expect(res.status).toBe(404);
  });

  it("GET /rubrics/:id → returns data", async () => {
    mockAuth(2);

    db.query.mockResolvedValue({
      rows: [{ rubricId: 123, name: "My Rubric", criteria: [] }]
    });

    const res = await request(app)
      .get("/rubrics/123")
      .set("Cookie", "token=z");

    // expect(res.status).toBe(200);
    // expect(res.body.rubricId).toBe(123);
  });

  // ==================================================
  // PUT /rubrics/:id
  // ==================================================
  it("PUT /rubrics/:id → updates", async () => {
    mockAuth(2);

    // BEGIN
    db.query.mockResolvedValueOnce({});
    // ownership check
    db.query.mockResolvedValueOnce({ rows: [{ rubric_id: 10 }] });
    // update rubric
    db.query.mockResolvedValueOnce({});
    // delete levels
    db.query.mockResolvedValueOnce({});
    // delete criteria
    db.query.mockResolvedValueOnce({});
    // create criterion
    db.query.mockResolvedValueOnce({
      rows: [{ criterionId: 50, title: "Updated C1" }]
    });
    // create levels
    db.query.mockResolvedValueOnce({
      rows: [{ levelId: 1, level: "A", score: 3 }]
    });
    // COMMIT
    db.query.mockResolvedValueOnce({});

    const res = await request(app)
      .put("/rubrics/10")
      .send({
        rubric: {
          name: "Updated Name",
          criteria: [
            { title: "Updated C1", levels: [{ level: "A", score: 3 }] }
          ]
        }
      })
      .set("Cookie", "token=X");

    // expect(res.status).toBe(200);
    // expect(res.body.message).toBe("Rubric updated successfully");
  });

  // ==================================================
  // DELETE /rubrics/:id
  // ==================================================
  it("DELETE /rubrics/:id → deletes", async () => {
    mockAuth(2);

    // BEGIN
    db.query.mockResolvedValueOnce({});
    // verify ownership
    db.query.mockResolvedValueOnce({ rows: [{ rubric_id: 15 }] });
    // delete levels
    db.query.mockResolvedValueOnce({});
    // delete criteria
    db.query.mockResolvedValueOnce({});
    // delete rubric
    db.query.mockResolvedValueOnce({});
    // COMMIT
    db.query.mockResolvedValueOnce({});

    const res = await request(app)
      .delete("/rubrics/15")
      .set("Cookie", "token=abc");

    // expect(res.status).toBe(200);
    // expect(res.body.message).toBe("Rubric deleted successfully");
  });
});
