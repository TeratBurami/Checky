// test/index.test.js
import request from "supertest";
import expressApp from "../server.js";

// Mock the database connection so tests don't actually connect
jest.mock("../config/db.js", () => ({
  connect: jest.fn().mockResolvedValue(true)
}));

describe("Server", () => {
  it("should respond on a dummy route", async () => {
    // Create a temporary test route for testing
    expressApp.get("/api/v1/test", (req, res) => {
      res.status(200).json({ ok: true });
    });

    const res = await request(expressApp).get("/api/v1/test");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("should return 404 for unknown routes", async () => {
    const res = await request(expressApp).get("/unknown-route");
    expect(res.status).toBe(404);
  });
});
