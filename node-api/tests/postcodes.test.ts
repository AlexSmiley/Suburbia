import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import Database from "better-sqlite3";
import { createApp } from "../src/app";
import type { StateData } from "../src/repositories/postcodes.repository";

const fixtures: StateData = {
  NSW: [
    { postcode: "2000", name: ["Sydney", "The Rocks"] },
    { postcode: "2001", name: ["Barangaroo", "Sydney"] }
  ],
  VIC: [{ postcode: "3000", name: ["Melbourne"] }]
};

describe("Suburbia Node API", () => {
  let db: Database.Database;
  let app: ReturnType<typeof createApp>;

  afterEach(() => db?.close());

  const setup = () => {
    db = new Database(":memory:");
    app = createApp(db, fixtures);
  };

  it("seeds the bundled state data and returns it by state", async () => {
    setup();
    const response = await request(app).get("/NSW");
    expect(response.status).toBe(200);
    expect(response.body.map((item: { postcode: string }) => item.postcode)).toEqual(["2000", "2001"]);
  });

  it("upserts records and returns the full stored collection", async () => {
    setup();
    const response = await request(app).post("/postcodes").send([
      { postcode: "2000", name: ["Sydney CBD"] },
      { postcode: "4000", name: ["Brisbane"] }
    ]);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body.find((item: { postcode: string }) => item.postcode === "2000").name).toEqual(["Sydney CBD"]);
  });

  it("deduplicates and sorts suburb names and excludes spaces from the character total", async () => {
    setup();
    const response = await request(app).get("/2000/2001");
    expect(response.status).toBe(200);
    expect(response.body["suburb names:"]).toEqual(["Barangaroo", "Sydney", "The Rocks"]);
    expect(response.body["total chars"]).toBe(24);
  });

  it("does not reverse an inverted range", async () => {
    setup();
    const response = await request(app).get("/2001/2000");
    expect(response.status).toBe(200);
    expect(response.body["suburb names:"]).toEqual([]);
    expect(response.body["total chars"]).toBe(0);
  });

  it("returns 404 for an unknown state", async () => {
    setup();
    const response = await request(app).get("/XX");
    expect(response.status).toBe(404);
  });

  it("rejects malformed postcode records", async () => {
    setup();
    const response = await request(app).post("/postcodes").send([
      { postcode: "20", name: ["Sydney"] }
    ]);
    expect(response.status).toBe(400);
  });
});