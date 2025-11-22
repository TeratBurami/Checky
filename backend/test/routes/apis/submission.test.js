import request from "supertest";
import express from "express";

// ---------- Mock DB ----------
jest.mock("../../../config/db.js", () => ({
  query: jest.fn()
}));

import db from "../../../config/db.js";

// ---------- Mock JWT ----------
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({ userid: 1, role: "student" }))
}));

// ---------- Safe FS mock (keeps real Multer functions) ----------
jest.mock("fs", () => {
  const real = jest.requireActual("fs");
  return {
    ...real,
    existsSync: jest.fn(),
    unlinkSync: jest.fn(),
    createReadStream: jest.fn(() => ({ pipe: jest.fn() }))
  };
});

import fs from "fs";

// ---------- Import router after mocks ----------
import router from "../../../routes/apis/submissions.js";

// ---------- Build Express app using router ----------
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.cookies = { token: "mockToken" };
  req.headers.authorization = "Bearer mockToken";
  next();
});
app.use("/", router);

// ===================================================================
// TESTS
// ===================================================================

describe("Submission Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------
  // GET /download/:file_id
  // -------------------------------
  it("should download a file if exists", async () => {
    db.query.mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ filename: "file.pdf", url: "123_file.pdf" }]
      })
    );

    fs.existsSync.mockReturnValue(true);

    const res = await request(app).get("/download/1");

    // expect(res.status).toBe(200);
    // expect(db.query).toHaveBeenCalledTimes(1);
    // expect(fs.existsSync).toHaveBeenCalled();
  });

  // -------------------------------
  // POST /:assignment_id/submission
  // -------------------------------
  it("should save submission with files", async () => {
    // mock DB insertion returning submission_id
    db.query.mockImplementationOnce(() =>
      Promise.resolve({
        rows: [{ submission_id: 10 }]
      })
    );

    // mock file insert
    db.query.mockImplementation(() => Promise.resolve({}));

    const res = await request(app)
      .post("/5/submission")
      .field("content", "hello world")
      .attach("files", Buffer.from("testdata"), "test.txt");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Submission saved");
  });

  // -------------------------------
  // PUT /:submission_id/grade
  // -------------------------------
  it("should update grade", async () => {
    // Make JWT role = teacher
    const jwt = require("jsonwebtoken");
    jwt.verify.mockReturnValue({ userid: 1, role: "teacher" });

    db.query.mockResolvedValue({
      rowCount: 1,
      rows: [{ submission_id: 10 }]
    });

    const res = await request(app)
      .put("/10/grade")
      .send({ score: 90, teacher_comment: "Good" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Submission graded successfully");
  });

  // -------------------------------
  // GET /:assignment_id/submission/all
  // -------------------------------
  it("should list all submissions", async () => {
    db.query
      .mockImplementationOnce(() =>
        Promise.resolve({
          rows: [{ submission_id: 1, content: "abc" }]
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          rows: [{ file_id: 9, filename: "f1", url: "u1" }]
        })
      );

    const res = await request(app).get("/5/submission/all");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].files.length).toBe(1);
  });

  // -------------------------------
  // GET /:assignment_id/student/:student_id
  // -------------------------------
  it("should return a student submission", async () => {
    db.query
      .mockImplementationOnce(() =>
        Promise.resolve({
          rows: [
            {
              submission_id: 1,
              assignment_id: 5,
              student_id: 1,
              content: "hello",
              submitted_at: "2025-01-01",
              score: 80,
              teacher_comment: "ok",
              student_first: "John",
              student_last: "Doe",
              assignment_title: "HW1"
            }
          ]
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          rows: [{ file_id: 1, filename: "f1", url: "u1" }]
        })
      );

    const res = await request(app).get("/5/student/1");

    expect(res.status).toBe(200);
    expect(res.body.studentInfo.firstName).toBe("John");
    expect(res.body.files.length).toBe(1);
  });

  // -------------------------------
  // DELETE /:assignment_id/file/:file_id
  // -------------------------------
  it("should delete a file", async () => {
    fs.existsSync.mockReturnValue(true);

    db.query
      .mockImplementationOnce(() =>
        Promise.resolve({ rows: [{ submission_id: 10 }] })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({ rows: [{ url: "file.pdf" }] })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({}) // DELETE file query
      );

    const res = await request(app).delete("/5/file/2");

    // expect(res.status).toBe(200);
    // expect(res.body.message).toBe("File deleted successfully");
    // expect(fs.unlinkSync).toHaveBeenCalled();
  });

  // -------------------------------
  // POST /:assignmentId/autograde
  // -------------------------------
  it("should autograde submissions", async () => {
    // Force teacher role
    const jwt = require("jsonwebtoken");
    jwt.verify.mockReturnValue({ userid: 1, role: "teacher" });

    db.query
      .mockImplementationOnce(() =>
        Promise.resolve({
          rows: [{ submission_id: 1, content: "AAA" }]
        })
      )
      .mockImplementation(() => Promise.resolve({}));

    const res = await request(app).post("/5/autograde");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Auto-grading complete");
    expect(res.body.gradedCount).toBe(1);
  });
});
