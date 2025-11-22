import express from "express";
import request from "supertest";

// Mock all sub-routers with dummy routes
jest.mock("../../routes/apis/user.js", () => {
  const r = require("express").Router();
  r.get("/", (req, res) => res.json({ ok: true }));
  return r;
});
jest.mock("../../routes/apis/class.js", () => {
  const r = require("express").Router();
  r.get("/", (req, res) => res.json({ ok: true }));
  return r;
});
jest.mock("../../routes/apis/rubric.js", () => {
  const r = require("express").Router();
  r.get("/", (req, res) => res.json({ ok: true }));
  return r;
});
jest.mock("../../routes/apis/assignment.js", () => {
  const r = require("express").Router();
  r.get("/", (req, res) => res.json({ ok: true }));
  return r;
});
jest.mock("../../routes/apis/notification.js", () => {
  const r = require("express").Router();
  r.get("/", (req, res) => res.json({ ok: true }));
  return r;
});
jest.mock("../../routes/apis/submissions.js", () => {
  const r = require("express").Router();
  r.get("/", (req, res) => res.json({ ok: true }));
  return r;
});
jest.mock("../../routes/apis/peer-reviews.js", () => {
  const r = require("express").Router();
  r.get("/", (req, res) => res.json({ ok: true }));
  return r;
});
jest.mock("../../routes/apis/dashboard.js", () => {
  const r = require("express").Router();
  r.get("/", (req, res) => res.json({ ok: true }));
  return r;
});

// import AFTER mocks
import indexRouter from "../../routes/index.js";

describe("Main API Router", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use("/", indexRouter);
  });

  it("should respond on /auth route", async () => {
    const res = await request(app).get("/auth");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("should respond on /class route", async () => {
    const res = await request(app).get("/class");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("should respond on /peer-review route", async () => {
    const res = await request(app).get("/peer-review");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("should respond on /rubric route", async () => {
    const res = await request(app).get("/rubric");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("should respond on /notifications route", async () => {
    const res = await request(app).get("/notifications");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("should respond on /dashboard route", async () => {
    const res = await request(app).get("/dashboard");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
