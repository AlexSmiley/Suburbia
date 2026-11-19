import type { Client } from "@libsql/client";
import type { PostcodeRecord, RangeResult } from "../models/postcode";

export type StateData = Record<string, PostcodeRecord[]>;

const INSERT_CHUNK_SIZE = 400;

export class PostcodesRepository {
  private initialization?: Promise<void>;

  constructor(private readonly db: Client) {}

  initialize(stateData: StateData): Promise<void> {
    this.initialization ??= this.initializeOnce(stateData);
    return this.initialization;
  }

  private async initializeOnce(stateData: StateData): Promise<void> {
    await this.db.executeMultiple(`
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

    const result = await this.db.execute("SELECT COUNT(*) AS count FROM postcodes");
    const count = Number(result.rows[0]?.count ?? 0);
    if (count > 0) return;

    const recordsByPostcode = new Map<string, PostcodeRecord>();
    const memberships: Array<{ state: string; postcode: string }> = [];
    for (const [state, records] of Object.entries(stateData)) {
      for (const record of records) {
        recordsByPostcode.set(record.postcode, record);
        memberships.push({ state, postcode: record.postcode });
      }
    }

    const records = [...recordsByPostcode.values()];
    const statements: Array<{ sql: string; args: Array<string | number> }> = [];

    for (let offset = 0; offset < records.length; offset += INSERT_CHUNK_SIZE) {
      const chunk = records.slice(offset, offset + INSERT_CHUNK_SIZE);
      const values = chunk.map(() => "(?, ?)").join(", ");
      statements.push({
        sql: `INSERT INTO postcodes (postcode, names_json) VALUES ${values}
          ON CONFLICT(postcode) DO UPDATE SET names_json = excluded.names_json`,
        args: chunk.flatMap((record) => [record.postcode, JSON.stringify(record.name)])
      });
    }

    for (let offset = 0; offset < memberships.length; offset += INSERT_CHUNK_SIZE) {
      const chunk = memberships.slice(offset, offset + INSERT_CHUNK_SIZE);
      const values = chunk.map(() => "(?, ?)").join(", ");
      statements.push({
        sql: `INSERT OR IGNORE INTO state_postcodes (state, postcode) VALUES ${values}`,
        args: chunk.flatMap((membership) => [membership.state, membership.postcode])
      });
    }

    if (statements.length > 0) await this.db.batch(statements, "write");
  }

  async saveAll(records: PostcodeRecord[]): Promise<PostcodeRecord[]> {
    const statements: Array<{ sql: string; args: Array<string | number> }> = [];
    for (let offset = 0; offset < records.length; offset += INSERT_CHUNK_SIZE) {
      const chunk = records.slice(offset, offset + INSERT_CHUNK_SIZE);
      const values = chunk.map(() => "(?, ?)").join(", ");
      statements.push({
        sql: `INSERT INTO postcodes (postcode, names_json) VALUES ${values}
          ON CONFLICT(postcode) DO UPDATE SET names_json = excluded.names_json`,
        args: chunk.flatMap((record) => [record.postcode, JSON.stringify(record.name)])
      });
    }
    if (statements.length > 0) await this.db.batch(statements, "write");
    return this.getAll();
  }

  async getAll(): Promise<PostcodeRecord[]> {
    const result = await this.db.execute(
      "SELECT postcode, names_json FROM postcodes ORDER BY postcode"
    );
    return result.rows.map((row) => ({
      postcode: String(row.postcode),
      name: JSON.parse(String(row.names_json)) as string[]
    }));
  }

  async getByState(state: string): Promise<PostcodeRecord[]> {
    const result = await this.db.execute({
      sql: `SELECT p.postcode, p.names_json
        FROM postcodes p
        INNER JOIN state_postcodes s ON s.postcode = p.postcode
        WHERE s.state = ?
        ORDER BY p.postcode`,
      args: [state]
    });
    return result.rows.map((row) => ({
      postcode: String(row.postcode),
      name: JSON.parse(String(row.names_json)) as string[]
    }));
  }

  async getByRange(from: number, to: number): Promise<RangeResult> {
    const start = Math.max(from, 0);
    const end = Math.min(to, 9999);
    const result = start <= end
      ? await this.db.execute({
          sql: "SELECT names_json FROM postcodes WHERE CAST(postcode AS INTEGER) BETWEEN ? AND ?",
          args: [start, end]
        })
      : { rows: [] };

    const suburbs = result.rows.flatMap((row) =>
      JSON.parse(String(row.names_json)) as string[]
    );
    const uniqueSorted = [...new Set(suburbs)].sort();
    return {
      "suburb names:": uniqueSorted,
      "total chars": uniqueSorted.reduce((total, name) => total + name.replace(/ /g, "").length, 0)
    };
  }
}
