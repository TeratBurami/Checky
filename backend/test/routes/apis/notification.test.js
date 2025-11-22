import request from "supertest";
import express from "express";
import { authenticateJWT } from "../../../middleware/auth.js";

jest.mock("../../../config/db.js", () => ({
  query: jest.fn(),
}));

jest.mock('../../../middleware/auth.js', () => ({
  authenticateJWT: jest.fn((roles = []) => (req, res, next) => {
    req.user = { userid: 1, role: "student" };
    next();
  }),
}));

import notificationRoutes from "../../../routes/apis/notification.js";
import db from "../../../config/db.js";

const app = express();
app.use(express.json());
app.use("/api/notifications", notificationRoutes);

describe("Notification Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/notifications/admin/all", () => {
    it("should return all notifications", async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            notificationId: 1,
            userId: 1,
            type: "NEW_ASSIGNMENT",
            message: "Test message",
            link: "/",
            isRead: false,
            createdAt: new Date(),
          }
        ],
      });

      const res = await request(app).get("/api/notifications/admin/all");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].type).toBe("NEW_ASSIGNMENT");
    });

    it("should return 500 on db error", async () => {
      db.query.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/api/notifications/admin/all");

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("DB error");
    });
  });

  describe("GET /api/notifications/", () => {
    it("should return notifications for a user", async () => {
      authenticateJWT.mockImplementationOnce(() => (req, res, next) => {
        req.user = { userid: 1, role: "student" };
        next();
      });

      db.query.mockImplementationOnce((query, params) => {
        const allRows = [
        { notificationId: 2, userId: 1, type: "NEW_ASSIGNMENT", message: "User message", link: "/", isRead: false, createdAt: new Date() },
        { notificationId: 3, userId: 2, type: "NEW_ASSIGNMENT", message: "Another message", link: "/", isRead: true, createdAt: new Date() },
        { notificationId: 4, userId: 1, type: "GRADE_POSTED", message: "Grade posted", link: "/", isRead: true, createdAt: new Date() },
      ];
      return { rows: allRows.filter(r => r.userId === params[0]) };
      });

      const res = await request(app).get("/api/notifications/");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].message).toBe("User message");
    });

    it("should return 500 on db error", async () => {
      db.query.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/api/notifications/");

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("DB error");
    });
  });
});
