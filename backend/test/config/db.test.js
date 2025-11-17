// test/config/db.test.js
import pkg from "pg";
import db from "../../config/db.js";

jest.mock("pg", () => {
  const mClient = { connect: jest.fn(), query: jest.fn(), release: jest.fn() };
  const mPool = { connect: jest.fn(() => mClient) };
  return { Pool: jest.fn(() => mPool) };
});

describe("Database Connection", () => {
  it("should create a Pool instance and call connect", async () => {
    const { Pool } = pkg;

    // Importing db triggers Pool creation
    expect(Pool).toHaveBeenCalledTimes(1);

    const client = await db.connect();
    expect(client).toHaveProperty("connect");
  });
});
