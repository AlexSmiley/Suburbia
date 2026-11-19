import Database from "better-sqlite3";
import type { PostcodeRecord, RangeResult } from "../models/postcode";

const STATE_RANGES: Record<string, Array<[number, number]>> = {
  ACT: [[200, 299], [2600, 2618], [2900, 2920]],
  NSW: [[1000, 2599], [2619, 2899], [2921, 2999]],
  NT: [[800, 999]],
  QLD: [[4000, 4999], [9000, 9999]],
  SA: [[5000, 5999]],
  TAS: [[7000, 7999]],
  VIC: [[3000, 3999], [8000, 8999]],
  WA: [[6000, 6999]]
};

export class PostcodesRepository {
  constructor(private readonly db: Database.Database) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS postcodes (
        postcode TEXT PRIMARY KEY,
        names_json TEXT NOT NULL
      )
    `);
  }

  saveAll(records: PostcodeRecord[]): PostcodeRecord[] {
    const upsert = this.db.prepare(
      "INSERT INTO postcodes (postcode, names_json) VALUES (?, ?) ON CONFLICT(postcode) DO UPDATE SET names_json = excluded.names_json"
    );
    const transaction = this.db.transaction((items: PostcodeRecord[]) => {
      for (const item of items) upsert.run(item.postcode, JSON.stringify(item.name));
    });
    transaction(records);
    return this.getAll();
  }

  getAll(): PostcodeRecord[] {
    return this.db.prepare(
      "SELECT postcode, names_json FROM postcodes ORDER BY postcode"
    ).all().map((row: any) => ({
      postcode: row.postcode,
      name: JSON.parse(row.names_json) as string[]
    }));
  }

  getByState(state: string): PostcodeRecord[] {
    const ranges = STATE_RANGES[state.toUpperCase()];
    if (!ranges) return [];
    return this.getAll().filter(({ postcode }) => {
      const value = Number(postcode);
      return ranges.some(([start, end]) => value >= start && value <= end);
    });
  }

  getByRange(from: number, to: number): RangeResult {
    const low = Math.min(from, to);
    const high = Math.max(from, to);
    const suburbs = this.db.prepare(
      "SELECT names_json FROM postcodes WHERE CAST(postcode AS INTEGER) BETWEEN ? AND ?"
    ).all(low, high).flatMap((row: any) => JSON.parse(row.names_json) as string[]);
    suburbs.sort((a, b) => a.localeCompare(b));
    return {
      "suburb names:": suburbs,
      "total chars": suburbs.reduce((total, name) => total + name.length, 0)
    };
  }
}