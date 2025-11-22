// test/classes.test.js
import request from "supertest";
import express from "express";

// 1️⃣ Mock DB
jest.mock("../../../config/db.js", () => ({
  query: jest.fn(),
}));

// 2️⃣ Mock auth
jest.mock("../../../middleware/auth.js", () => ({
  authenticateJWT: jest.fn((roles = []) => (req, res, next) => {
    req.user = {
      userid: 1,
      role: roles[0] || "student"
    };
    next();
  }),
}));

// 3️⃣ Import routes AFTER mocks
import classRoutes from "../../../routes/apis/class.js";
import db from "../../../config/db.js";

const app = express();
app.use(express.json());
app.use("/api/classes", classRoutes);

// Reset mocks
afterEach(() => {
  jest.clearAllMocks();
});

describe("Class Routes", () => {

  // ------------------------------------------------------------
  // GET /admin/all/classes
  // ------------------------------------------------------------
  describe("GET /api/classes/admin/all/classes", () => {
    it("should return all classes", async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { classId: 1, name: "Math", description: "Basic", teacher: "John Doe", memberCount: 10 },
        ],
      });

      const res = await request(app).get("/api/classes/admin/all/classes");
      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe("Math");
    });

    it("should return 500 on DB error", async () => {
      db.query.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/api/classes/admin/all/classes");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("DB error");
    });
  });

  // ------------------------------------------------------------
  // GET /
  // ------------------------------------------------------------
  describe("GET /api/classes/", () => {
    it("should return classes for teacher", async () => {
      // mock teacher role
      require("../../../middleware/auth.js").authenticateJWT.mockImplementationOnce(() => {
        return (req, res, next) => {
          req.user = { userid: 1, role: "teacher" };
          next();
        };
      });

      db.query.mockResolvedValueOnce({
        rows: [{ classId: 1, name: "Sci", description: "Science", memberCount: 5 }],
      });

      const res = await request(app).get("/api/classes/");
      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe("Sci");
    });

    it("should return classes for student", async () => {
      require("../../../middleware/auth.js").authenticateJWT.mockImplementationOnce(() => {
        return (req, res, next) => {
          req.user = { userid: 1, role: "student" };
          next();
        };
      });

      db.query.mockResolvedValueOnce({
        rows: [{ classId: 2, name: "Eng", description: "English", memberCount: 20 }],
      });

      const res = await request(app).get("/api/classes/");
      expect(res.status).toBe(200);
      expect(res.body[0].classId).toBe(2);
    });

    it("should return 500 on DB error", async () => {
      db.query.mockRejectedValueOnce(new Error("DB error"));
      const res = await request(app).get("/api/classes/");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("DB error");
    });
  });

  // ------------------------------------------------------------
  // POST /  (teacher only)
  // ------------------------------------------------------------
  describe("POST /api/classes/", () => {
    it("should create class successfully", async () => {
      // teacher role
      require("../../../middleware/auth.js").authenticateJWT.mockImplementationOnce(() => {
        return (req, res, next) => {
          req.user = { userid: 10, role: "teacher" };
          next();
        };
      });

      db.query
        .mockResolvedValueOnce({ rows: [{ firstname: "John", lastname: "Doe" }] }) // teacher exists
        .mockResolvedValueOnce({ rowCount: 0 }) // class code check
        .mockResolvedValueOnce({ rows: [{ classid: 3 }] }); // insert

      const res = await request(app).post("/api/classes/").send({
        name: "Biology",
        description: "Bio desc",
      });

      expect(res.status).toBe(201);
      expect(res.body.msg).toContain("Class created successfully");
    });

    it("should return 404 when teacher not found", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post("/api/classes/").send({
        name: "Bio",
        description: "desc",
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Teacher not found");
    });
  });

  // ------------------------------------------------------------
  // PUT /:classId
  // ------------------------------------------------------------
  describe("PUT /api/classes/:classId", () => {
    it("should update class", async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .put("/api/classes/1")
        .send({ name: "New", description: "Updated" });

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe("Class updated successfully");
    });

    it("should return 403 if teacher does not own class", async () => {
      db.query.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app)
        .put("/api/classes/1")
        .send({ name: "x", description: "y" });

      expect(res.status).toBe(403);
    });
  });

  // ------------------------------------------------------------
  // DELETE /:classId
  // ------------------------------------------------------------
  describe("DELETE /api/classes/:classId", () => {
    it("should delete class", async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app).delete("/api/classes/1");
      expect(res.status).toBe(200);
      expect(res.body.msg).toBe("Class deleted successfully");
    });

    it("should return 403 if teacher does not own class", async () => {
      db.query.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app).delete("/api/classes/999");
      expect(res.status).toBe(403);
    });
  });

  // ------------------------------------------------------------
  // GET /:classId
  // ------------------------------------------------------------
  describe("GET /api/classes/:classId", () => {
    it("should return class details", async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            {
              classid: 1,
              name: "Math",
              description: "desc",
              classcode: "ABC",
              teacher_userid: 1,
              teacher_firstname: "John",
              teacher_lastname: "Doe",
              assignment_id: null,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ memberscount: "5" }] });

      const res = await request(app).get("/api/classes/1");

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Math");
    });
  });

  // ------------------------------------------------------------
  // GET /:classId/members
  // ------------------------------------------------------------
  describe("GET /api/classes/:classId/members", () => {
    it("should return members", async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { userId: 1, firstName: "A", lastName: "B", email: "a@b.com" },
        ],
      });

      const res = await request(app).get("/api/classes/10/members");

      expect(res.status).toBe(200);
      expect(res.body.members.length).toBe(1);
    });
  });

  // ------------------------------------------------------------
  // POST /join
  // ------------------------------------------------------------
  describe("POST /api/classes/join", () => {
    it("should join class", async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ classid: 5 }] }) // get class
        .mockResolvedValueOnce({ rows: [] }) // not a member
        .mockResolvedValueOnce({});          // insert

      const res = await request(app)
        .post("/api/classes/join")
        .send({ classCode: "ABC123" });

      expect(res.status).toBe(201);
      expect(res.body.msg).toBe("Joined class successfully");
    });

    it("should return 404 when class not found", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/api/classes/join")
        .send({ classCode: "NOTFOUND" });

      expect(res.status).toBe(404);
    });
  });

  // ------------------------------------------------------------
  // POST /:classId/invitations
  // ------------------------------------------------------------
  describe("POST /api/classes/:classId/invitations", () => {
    it("should add student", async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ userid: 2, role: "student" }] }) // find user
        .mockResolvedValueOnce({ rows: [] }) // not member
        .mockResolvedValueOnce({}); // insert

      const res = await request(app)
        .post("/api/classes/1/invitations")
        .send({ studentEmail: "x@y.com" });

      expect(res.status).toBe(201);
    });

    it("should return 404 when student not found", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/api/classes/1/invitations")
        .send({ studentEmail: "none@none.com" });

      expect(res.status).toBe(404);
    });
  });
});
