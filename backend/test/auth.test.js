import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "../middleware/auth.js";

jest.mock("jsonwebtoken");

const app = express();
app.use(express.json());

// test route
app.get("/protected", authenticateJWT(["teacher"]), (req, res) => {
  res.json({ ok: true, user: req.user });
});

describe("authenticateJWT middleware", () => {
  it("should return 401 when no token provided", async () => {
    const res = await request(app).get("/protected");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("should return 401 when token is invalid", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid");
    });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer abc");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired token");
  });

  it("should return 403 when role is insufficient", async () => {
    jwt.verify.mockReturnValue({ userid: 1, role: "student" });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer goodtoken");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden: insufficient role");
  });

  it("should allow access when role is valid", async () => {
    jwt.verify.mockReturnValue({ userid: 99, role: "teacher" });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer ok");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user.userid).toBe(99);
  });
});
