import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { loadStateData } from "../src/state-data";
import type { StateData } from "../src/repositories/postcodes.repository";

const fixtures: StateData = {
  NSW: [
    { postcode: "2000", name: ["Sydney", "The Rocks"] },
    { postcode: "2001", name: ["Barangaroo", "Sydney"] }
  ],
  VIC: [{ postcode: "3000", name: ["Melbourne"] }]
};

describe("Suburbia Node API with in-memory storage", () => {
  it("loads all eight bundled state datasets without an external database", () => {
    const data = loadStateData();
    expect(Object.keys(data).sort()).toEqual(["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]);
    for (const records of Object.values(data)) {
      expect(records.length).toBeGreaterThan(0);
      expect(records.every((record) => /^\\d{4}$/.test(record.postcode))).toBe(true);
    }
  });

  const setup = () => createApp(fixtures);

  it("loads bundled state data and returns it by state", async () => {
    const app = setup();
    const response = await request(app).get("/NSW");
    expect(response.status).toBe(200);
    expect(response.body.map((item: { postcode: string }) => item.postcode)).toEqual(["2000", "2001"]);
  });

  it("upserts records in memory and returns the full stored collection", async () => {
    const app = setup();
    const response = await request(app).post("/postcodes").send([
      { postcode: "2000", name: ["Sydney CBD"] },
      { postcode: "4000", name: ["Brisbane"] }
    ]);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body.find((item: { postcode: string }) => item.postcode === "2000").name).toEqual(["Sydney CBD"]);
  });

  it("deduplicates and sorts suburb names and excludes spaces from the character total", async () => {
    const app = setup();
    const response = await request(app).get("/2000/2001");
    expect(response.status).toBe(200);
    expect(response.body["suburb names:"]).toEqual(["Barangaroo", "Sydney", "The Rocks"]);
    expect(response.body["total chars"]).toBe(24);
  });

  it("does not reverse an inverted range", async () => {
    const app = setup();
    const response = await request(app).get("/2001/2000");
    expect(response.status).toBe(200);
    expect(response.body["suburb names:"]).toEqual([]);
    expect(response.body["total chars"]).toBe(0);
  });

  it("returns 404 for an unknown state", async () => {
    const app = setup();
    const response = await request(app).get("/XX");
    expect(response.status).toBe(404);
  });

  it("rejects malformed postcode records", async () => {
    const app = setup();
    const response = await request(app).post("/postcodes").send([
      { postcode: "20", name: ["Sydney"] }
    ]);
    expect(response.status).toBe(400);
  });

  it("reports that the API uses in-memory storage", async () => {
    const response = await request(setup()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.storage).toBe("in-memory");
  });
});
