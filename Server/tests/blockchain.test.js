import request from "supertest";
import createServer from "../app.js"; // server factory

let app;

beforeAll(async () => {
  app = await createServer();
});

describe("Blockchain API", () => {
  let initialCount;

  test("GET /blockchain/count should return current counter", async () => {
    const res = await request(app).get("/blockchain/count");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("count");
    initialCount = parseInt(res.body.count, 10);
  });

  test("POST /blockchain/increment should increment counter", async () => {
    const res = await request(app).post("/blockchain/increment");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // verify incremented
    const verify = await request(app).get("/blockchain/count");
    expect(parseInt(verify.body.count, 10)).toBe(initialCount + 1);
  });
});
