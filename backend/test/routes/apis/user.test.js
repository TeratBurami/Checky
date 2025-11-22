// test/routes/apis/user.test.js
import request from "supertest";
import express from "express";
import userRouter from "../../../routes/apis/user.js";

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

import db from "../../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("User API Routes", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/v1/user", userRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // REGISTER
  it("should register a new user", async () => {
    bcrypt.hash.mockResolvedValue("hashedPassword");
    db.query.mockResolvedValue({ rows: [{ userid: 1, firstName: "John" }] });

    const res = await request(app).post("/api/v1/user/register").send({
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

  // LOGIN
  it("should login successfully with correct credentials", async () => {
    db.query.mockResolvedValue({
      rows: [
        { userid: 1, email: "john@example.com", password: "hashed", firstname: "John", lastname: "Doe", role: "student" },
      ],
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mockToken");

    const res = await request(app).post("/api/v1/user/login").send({
      email: "john@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.msg).toBe("Login successful");
    expect(res.headers["set-cookie"][0]).toContain("mockToken");
  });

  it("should fail login with wrong credentials", async () => {
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app).post("/api/v1/user/login").send({
      email: "wrong@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("Invalid credentials");
  });

  // LOGOUT
  it("should logout successfully", async () => {
    const res = await request(app).post("/api/v1/user/logout");

    expect(res.status).toBe(200);
    expect(res.body.msg).toBe("Logout successful");
  });

  // GET all users
  it("should get all users", async () => {
    db.query.mockResolvedValue({ rows: [{ userid: 1, firstName: "John" }] });

    const res = await request(app).get("/api/v1/user");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ userid: 1, firstName: "John" }]);
  });

  // GET user by ID
  it("should get user by ID", async () => {
    db.query.mockResolvedValue({ rows: [{ userid: 1, firstName: "John" }] });

    const res = await request(app).get("/api/v1/user/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userid: 1, firstName: "John" });
  });

  it("should return 404 if user not found", async () => {
    db.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get("/api/v1/user/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("User not found");
  });
});
