// test/routes/apis/user.test.js
import request from "supertest";
import express from "express";

import db from "../../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "../../../middleware/auth.js";

// Mock db, bcrypt, jwt
jest.mock("../../../config/db.js", () => ({
  query: jest.fn(),
}));
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));
jest.mock('../../../middleware/auth.js', () => ({
  authenticateJWT: jest.fn((roles = []) => (req, res, next) => {
    req.user = { userid: 1, role: "student" };
    next();
  }),
}));

import userRouter from "../../../routes/apis/user.js";

describe("User API Routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/v1/auth", userRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // REGISTER
  it("should register a new user", async () => {
    bcrypt.hash.mockResolvedValue("hashedPassword");
    db.query.mockResolvedValue({ rows: [{ userid: 1, firstName: "John" }] });

    const res = await request(app).post("/api/v1/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      role: "student",
    });

    expect(res.status).toBe(201);
    expect(res.body.msg).toBe("Register Successfully");
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(db.query).toHaveBeenCalled();
  });

  // REGISTER failure
  it("should handle registration errors", async () => {
    bcrypt.hash.mockRejectedValue(new Error("Hashing error"));

    const res = await request(app).post("/api/v1/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@gmail.com",
      password: "password123",
      role: "student",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Hashing error");
  });

  // Example Test for Missing Email (Expected 400)
  it("should reject registration if email is missing", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      firstName: "Jane",
      password: "password123" // Email field is deliberately omitted
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("All fields are required"); // Or similar message
  });

  // Example Test for Invalid Email Format (Expected 400)
  it("should reject registration if email is invalid (missing @)", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      firstName: "Jane",
      lastName: "Doe",
      email: "invalidemail.com",
      password: "password123",
      role: "student"
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid email format");
  });

  // LOGIN
  it("should login successfully with correct credentials", async () => {
    db.query.mockResolvedValue({
      rows: [
        { userid: 1, email: "john@example.com", password: "hashed", firstname: "John", lastname: "Doe", role: "student" },
      ],
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mockToken");

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.msg).toBe("Login successful");
    expect(res.headers["set-cookie"][0]).toContain("mockToken");
  });

  // Invalid Credentials - User Not Found
  it("should fail login with wrong credentials", async () => {
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "wrong@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("Invalid credentials");
  });

  // Invalid Credentials - Password Mismatch
  it("should fail login with incorrect password", async () => {
    db.query.mockResolvedValue({
      rows: [
        { userid: 1, email: "jane.doe@gmail.com", password: "hashedPassword", firstname: "Jane", lastname: "Doe", role: "student" },
      ],
    });
    bcrypt.compare.mockResolvedValue(false);
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "jane.doe@gmail.com",
      password: "wrongPassword",
    });
    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("Invalid credentials");
  });

  // Login error handling
  it("should handle login errors", async () => {
    db.query.mockRejectedValue(new Error("DB error"));
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "jane.doe@gmail.com",
      password: "password123",
    });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB error");
  });

  // LOGOUT
  it("should logout successfully", async () => {
    const res = await request(app).post("/api/v1/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body.msg).toBe("Logout successful");
  });

  // GET all users
  it("should get all users", async () => {
    db.query.mockResolvedValue({ rows: [{ userid: 1, firstName: "John" }] });

    const res = await request(app).get("/api/v1/auth");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ userid: 1, firstName: "John" }]);
  });

  // GET all uesr error handling
  it("should handle get users errors", async () => {
    db.query.mockRejectedValue(new Error("DB error"));
    const res = await request(app).get("/api/v1/auth");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB error");
  });

  // GET user by ID
  it("should get user by ID", async () => {
    db.query.mockResolvedValue({ rows: [{ userid: 1, firstName: "John" }] });

    const res = await request(app).get("/api/v1/auth/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userid: 1, firstName: "John" });
  });

  // GET user by ID not found
  it("should return 404 if user not found", async () => {
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get("/api/v1/auth/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  // GET user by ID error handling
  it("should handle get user by ID errors", async () => {
    db.query.mockRejectedValue(new Error("DB error"));
    const res = await request(app).get("/api/v1/auth/1");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB error");
  });

  // UPDATE user
  it("should update user info successfully", async () => {
    let user = { userid: 1, firstName: "Jane", lastName: "Doe", email: "joe@gmail.com" };

    authenticateJWT.mockImplementation(() => (req, res, next) => {
      req.user = { userid: 1, role: "student" };
      next();
    });

    db.query.mockImplementation(async (query, params) => {
      user = { ...user, firstName: params[0], lastName: params[1], email: params[2], password: params[3] };
      return { rows: [user] };
    });

    const res = await request(app)
      .put("/api/v1/auth/1")
      .send({ firstName: "Jane", lastName: "Do Not Doe", email: "joe@gmail.com", password: "newpass" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ firstName: "Jane", lastName: "Do Not Doe", email: "joe@gmail.com", password: "newpass", userid: 1 });
  });


  it("should return 403 if updating another user's info", async () => {
    authenticateJWT.mockImplementation(() => (req, res, next) => {
      req.user = { userid: 1, role: "student" };
      next();
    });

    const res = await request(app).put("/api/v1/auth/2").send({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@gmail.com",
      password: "newpassword",
    });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden: can only update your own account");
  });


  it("should return 404 if user to update not found", async () => {
    // Mock authenticateJWT to set req.user.userid to 1
    authenticateJWT.mockImplementation(() => (req, res, next) => {
      req.user = { userid: 1 };
      next();
    });
    db.query.mockResolvedValue({ rows: [] }); // User not found
    const res = await request(app).put("/api/v1/auth/1").send({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@gmail.com",
      password: "newpassword",
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  // UPDATE user error handling
  it("should handle update user errors", async () => {
    // Mock authenticateJWT to set req.user.userid to 1
    authenticateJWT.mockImplementation(() => (req, res, next) => {
      req.user = { userid: 1 };
      next();
    });
    db.query.mockRejectedValue(new Error("DB error"));
    const res = await request(app).put("/api/v1/auth/1").send({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@gmail.com",
      password: "newpassword",
    });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB error");
  });

  // DELETE user
  it("should delete user successfully", async () => {
    db.query.mockResolvedValue({ rows: [{ userid: 1, firstName: "John" }] });
    const res = await request(app).delete("/api/v1/auth/1");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");
  });

  // DELETE user not found
  it("should return 404 if user to delete not found", async () => {
    db.query.mockResolvedValue({ rows: [] });
    const res = await request(app).delete("/api/v1/auth/999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  // DELETE user error handling
  it("should handle delete user errors", async () => {
    db.query.mockRejectedValue(new Error("DB error"));
    const res = await request(app).delete("/api/v1/auth/1");
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB error");
  });


});
