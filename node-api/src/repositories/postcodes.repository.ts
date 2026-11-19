import Database from "better-sqlite3";
import type { PostcodeRecord, RangeResult } from "../models/postcode";

export type StateData = Record<string, PostcodeRecord[]>;

export class PostcodesRepository {
  constructor(
    private readonly db: Database.Database,
    stateData: StateData
  ) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS postcodes (
        postcode TEXT PRIMARY KEY,
        names_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS state_postcodes (
        state TEXT NOT NULL,
        postcode TEXT NOT NULL,
        PRIMARY KEY (state, postcode),
        FOREIGN KEY (postcode) REFERENCES postcodes(postcode)
      );
    `);

    const count = (this.db.prepare("SELECT COUNT(*) AS count FROM postcodes").get() as { count: number }).count;
    if (count === 0) this.seed(stateData);
  }

  private seed(stateData: StateData): void {
    const insertPostcode = this.db.prepare(
      "INSERT OR REPLACE INTO postcodes (postcode, names_json) VALUES (?, ?)"
    );
    const insertMembership = this.db.prepare(
      "INSERT OR IGNORE INTO state_postcodes (state, postcode) VALUES (?, ?)"
    );
    const seedTransaction = this.db.transaction((data: StateData) => {
      for (const [state, records] of Object.entries(data)) {
        for (const record of records) {
          insertPostcode.run(record.postcode, JSON.stringify(record.name));
          insertMembership.run(state, record.postcode);
        }
      }
    });
    seedTransaction(stateData);
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
    return this.db.prepare(`
      SELECT p.postcode, p.names_json
      FROM postcodes p
      INNER JOIN state_postcodes s ON s.postcode = p.postcode
      WHERE s.state = ?
      ORDER BY p.postcode
    `).all(state).map((row: any) => ({
      postcode: row.postcode,
      name: JSON.parse(row.names_json) as string[]
    }));
  }

  getByRange(from: number, to: number): RangeResult {
    const start = Math.max(from, 0);
    const end = Math.min(to, 9999);
    const suburbs = start <= end
      ? this.db.prepare(
          "SELECT names_json FROM postcodes WHERE CAST(postcode AS INTEGER) BETWEEN ? AND ?"
        ).all(start, end).flatMap((row: any) => JSON.parse(row.names_json) as string[])
      : [];

    const uniqueSorted = [...new Set(suburbs)].sort();
    return {
      "suburb names:": uniqueSorted,
      "total chars": uniqueSorted.reduce((total, name) => total + name.replace(/ /g, "").length, 0)
    };
  }
}