import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import Database from "better-sqlite3";
import { createApp } from "../src/app";

describe("Suburbia Node API", () => {
  let db: Database.Database;
  let app: ReturnType<typeof createApp>;

  afterEach(() => db?.close());

  const setup = () => {
    db = new Database(":memory:");
    app = createApp(db);
  };

  it("stores postcode records and returns them", async () => {
    setup();
    const response = await request(app).post("/postcodes").send([
      { postcode: "2000", name: ["Sydney"] },
      { postcode: "3000", name: ["Melbourne", "CBD"] }
    ]);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toEqual({ postcode: "2000", name: ["Sydney"] });
  });

  it("returns records for an Australian state", async () => {
    setup();
    await request(app).post("/postcodes").send([
      { postcode: "2000", name: ["Sydney"] },
      { postcode: "3000", name: ["Melbourne"] }
    ]);
    const response = await request(app).get("/NSW");
    expect(response.status).toBe(200);
    expect(response.body.map((item: { postcode: string }) => item.postcode)).toEqual(["2000"]);
  });

  it("sorts suburbs and calculates the combined character count for a range", async () => {
    setup();
    await request(app).post("/postcodes").send([
      { postcode: "2000", name: ["Sydney", "The Rocks"] },
      { postcode: "2001", name: ["Barangaroo"] }
    ]);
    const response = await request(app).get("/2000/2001");
    expect(response.status).toBe(200);
    expect(response.body["suburb names:"]).toEqual(["Barangaroo", "Sydney", "The Rocks"]);
    expect(response.body["total chars"]).toBe(25);
  });

  it("rejects malformed postcode records", async () => {
    setup();
    const response = await request(app).post("/postcodes").send([
      { postcode: "20", name: ["Sydney"] }
    ]);
    expect(response.status).toBe(400);
  });
});