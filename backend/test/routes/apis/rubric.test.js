import request from "supertest";
import express from "express";
import router from "../../../routes/apis/rubric.js";
import db from "../../../config/db.js";
import jwt from "jsonwebtoken";

jest.mock("../../../config/db.js", () => ({
  query: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

// --------------------------------------------------
// Setup Express App
// --------------------------------------------------
const app = express();
app.use(express.json());

// simple cookie parser for tests
app.use((req, _, next) => {
  const header = req.headers.cookie || "";
  const cookies = {};

  header.split(";").forEach((part) => {
    const [key, value] = part.trim().split("=");
    if (key) cookies[key] = value;
  });

  req.cookies = cookies;
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

  // TC1 (Logic coverage – successful admin fetch):
  // Verifies that GET /rubrics/admin returns all rubrics when the DB query succeeds.
  it("GET /rubrics/admin → returns all rubrics", async () => {
    db.query.mockResolvedValue({
      rows: [{ rubricId: 1, name: "Test Rubric", criteria: [] }],
    });

    const res = await request(app).get("/rubrics/admin");

    expect(res.status).toBe(200);
    expect(res.body[0].rubricId).toBe(1);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  // TC2 (Logic coverage – missing token):
  // Ensures GET /rubrics requires a valid JWT cookie and responds 401 when no token is provided.
  it("GET /rubrics → requires valid token", async () => {
    const res = await request(app).get("/rubrics");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  // TC3 (ISP – valid teacher, normal flow):
  // Checks that a valid teacher token receives their own rubrics list.
  it("GET /rubrics → returns teacher's rubrics", async () => {
    mockAuth(10);
    db.query.mockResolvedValue({
      rows: [{ rubricId: 99, name: "My Rubric", criteria: [] }],
    });

    const res = await request(app)
        .get("/rubrics")
        .set("Cookie", "token=abc");

    expect(res.status).toBe(200);
    expect(res.body[0].rubricId).toBe(99);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  // TC4 (ISP – invalid request body):
  // Sends a malformed rubric payload and expects the route to reject it with 400.
  it("POST /rubrics → rejects invalid body", async () => {
    mockAuth(5);

    const res = await request(app)
        .post("/rubrics")
        .send({ bad: "data" })
        .set("Cookie", "token=X");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid request body" });
  });

  // TC5 (Graph/logic coverage – happy path create):
  // Simulates a full successful rubric creation (BEGIN → INSERTs → COMMIT) without error.
  it("POST /rubrics → creates a rubric", async () => {
    mockAuth(5);

    // BEGIN
    db.query.mockResolvedValueOnce({});
    // Insert rubric
    db.query.mockResolvedValueOnce({
      rows: [{ rubricId: 1, name: "New Rubric" }],
    });
    // Insert a criterion
    db.query.mockResolvedValueOnce({
      rows: [{ criterionId: 10, title: "Quality" }],
    });
    // Insert its levels
    db.query.mockResolvedValueOnce({
      rows: [
        { levelId: 1, level: "A", score: 3, description: "" },
        { levelId: 2, level: "B", score: 2, description: "" },
      ],
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
                  { level: "B", score: 2 },
                ],
              },
            ],
          },
        })
        .set("Cookie", "token=X");

    expect(res.status).toBe(201);
    expect(res.body.rubric.rubricId).toBe(1);
  });

  // TC6 (ISP – rubric not found by ID):
  // Uses a valid token but an ID that does not exist and expects a 404 response.
  it("GET /rubrics/:id → not found", async () => {
    mockAuth(2);

    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
        .get("/rubrics/123")
        .set("Cookie", "token=z");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Rubric not found" });
  });

  // TC7 (ISP – successful fetch by ID):
  // Ensures GET /rubrics/:id returns rubric data for a valid teacher and existing rubric.
  it("GET /rubrics/:id → returns data", async () => {
    mockAuth(2);

    db.query.mockResolvedValue({
      rows: [{ rubricId: 123, name: "My Rubric", criteria: [] }],
    });

    const res = await request(app)
        .get("/rubrics/123")
        .set("Cookie", "token=z");

    expect(res.status).toBe(200);
    expect(res.body.rubricId).toBe(123);
  });

  // TC8 (Graph/logic coverage – successful update):
  // Covers the normal update path: ownership check passes, rubric & criteria are updated and committed.
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
      rows: [{ criterionId: 50, title: "Updated C1" }],
    });
    // create levels
    db.query.mockResolvedValueOnce({
      rows: [{ levelId: 1, level: "A", score: 3 }],
    });
    // COMMIT
    db.query.mockResolvedValueOnce({});

    const res = await request(app)
        .put("/rubrics/10")
        .send({
          rubric: {
            name: "Updated Name",
            criteria: [
              { title: "Updated C1", levels: [{ level: "A", score: 3 }] },
            ],
          },
        })
        .set("Cookie", "token=X");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Rubric updated successfully");
  });

  // TC9 (Graph/logic coverage – successful delete):
  // Verifies that a teacher can delete an owned rubric and all related criteria/levels.
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

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Rubric deleted successfully");
  });

  // TC10 (Logic coverage – POST DB failure → 500):
  // With a valid token but failing DB, POST /rubrics should rollback and return 500.
  it("POST /rubrics → returns 500 when DB fails", async () => {
    mockAuth(5); // jwt.verify → { userid: 5 }

    db.query
        .mockRejectedValueOnce(new Error("DB failed")) // first query fails
        .mockResolvedValueOnce({}); // ROLLBACK in catch

    const res = await request(app)
        .post("/rubrics")
        .send({
          rubric: {
            name: "New Rubric",
            criteria: [],
          },
        })
        .set("Cookie", "token=X");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "DB failed" });
  });

  // TC11 (Logic coverage – unauthorized GET by ID):
  // No cookie token causes verifyToken to throw and the route returns 401.
  it("GET /rubrics/:id → returns 401 when unauthorized", async () => {
    const res = await request(app).get("/rubrics/123"); // no Cookie

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  // TC12 (Logic coverage – admin DB failure → 500):
  // Forces the admin list query to fail and expects GET /rubrics/admin to return 500.
  it("GET /rubrics/admin → returns 500 when DB fails", async () => {
    db.query.mockRejectedValueOnce(new Error("DB failed"));

    const res = await request(app).get("/rubrics/admin");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "DB failed" });
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  // TC13 (Logic coverage – PUT DB error → 500):
  // Valid token, but DB throws a different error -> should map to 500.
  it("PUT /rubrics/:id → returns 500 when DB fails", async () => {
    mockAuth(2);

    db.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error("DB failed")) // crashes on some query
        .mockResolvedValueOnce({}); // ROLLBACK in catch

    const res = await request(app)
        .put("/rubrics/10")
        .send({
          rubric: {
            name: "Updated",
            criteria: [],
          },
        })
        .set("Cookie", "token=X");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "DB failed" });
  });

  // TC14 (Logic coverage – verifyToken no cookie):
  // Tests the helper verifyToken indirectly by calling GET /rubrics with no cookie and expecting 401.
  it("verifyToken → returns 401 when no cookie token", async () => {
    const res = await request(app).get("/rubrics"); // no cookie

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  // TC15 (Logic coverage – verifyToken success branch):
  // Mocks jwt.verify to return a teacher id and ensures GET /rubrics returns their rubrics.
  it("verifyToken → decodes token and returns rubrics", async () => {
    jwt.verify.mockReturnValue({ userid: 123 });

    db.query.mockResolvedValueOnce({
      rows: [{ rubricId: 1, name: "Rubric A" }],
    });

    const res = await request(app)
        .get("/rubrics")
        .set("Cookie", "token=valid");

    expect(res.status).toBe(200);
    expect(res.body[0].rubricId).toBe(1);
  });

  // TC16 (ISP – invalid PUT body → 400):
  // When rubric is missing name / criteria array, the route should return 400 without touching DB.
  it("PUT /rubrics/:id → returns 400 for invalid body", async () => {
    mockAuth(2);

    const res = await request(app)
        .put("/rubrics/10")
        .send({ bad: "data" }) // no rubric.name, no rubric.criteria
        .set("Cookie", "token=X");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid request body" });
    expect(db.query).not.toHaveBeenCalled();
  });

  // TC17 (Logic coverage – PUT unauthorized → 401):
  // No token on PUT /rubrics/:id triggers verifyToken error and leads to a 401 from the catch block.
  it("PUT /rubrics/:id → returns 401 when unauthorized", async () => {
    db.query.mockResolvedValueOnce({}); // for ROLLBACK in catch

    const res = await request(app)
        .put("/rubrics/10")
        .send({
          rubric: {
            name: "Updated",
            criteria: [],
          },
        }); // no Cookie

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(db.query).toHaveBeenCalledTimes(1); // only ROLLBACK
  });

  // TC18 (Logic coverage – PUT rubric not owned → 404):
  // Valid token but no ownership row -> error contains "not found" -> 404.
  it("PUT /rubrics/:id → returns 404 when rubric not found/owned", async () => {
    mockAuth(2);

    db.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // ownership check → length === 0
        .mockResolvedValueOnce({}); // ROLLBACK in catch

    const res = await request(app)
        .put("/rubrics/10")
        .send({
          rubric: {
            name: "Updated",
            criteria: [], // still valid shape
          },
        })
        .set("Cookie", "token=X");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "Rubric not found or not owned by user",
    });
  });
});
