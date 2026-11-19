import type { PostcodeRecord, RangeResult } from "../models/postcode";

export type StateData = Record<string, PostcodeRecord[]>;

/**
 * Process-local in-memory store.
 *
 * Vercel may run multiple isolated instances and recycle them at any time.
 * This store is therefore intentionally ephemeral and is not a durable or
 * globally shared database.
 */
export class PostcodesRepository {
  private readonly records = new Map<string, PostcodeRecord>();
  private readonly statePostcodes = new Map<string, Set<string>>();
  private initialization?: Promise<void>;

  initialize(stateData: StateData): Promise<void> {
    this.initialization ??= Promise.resolve().then(() => {
      for (const [state, records] of Object.entries(stateData)) {
        const postcodes = this.statePostcodes.get(state) ?? new Set<string>();
        for (const record of records) {
          this.records.set(record.postcode, this.copyRecord(record));
          postcodes.add(record.postcode);
        }
        this.statePostcodes.set(state, postcodes);
      }
    });
    return this.initialization;
  }

  async saveAll(records: PostcodeRecord[]): Promise<PostcodeRecord[]> {
    for (const record of records) {
      this.records.set(record.postcode, this.copyRecord(record));
    }
    return this.getAll();
  }

  async getAll(): Promise<PostcodeRecord[]> {
    return [...this.records.values()]
      .sort((a, b) => a.postcode.localeCompare(b.postcode))
      .map((record) => this.copyRecord(record));
  }

  async getByState(state: string): Promise<PostcodeRecord[]> {
    const postcodes = this.statePostcodes.get(state);
    if (!postcodes) return [];

    return [...postcodes]
      .sort((a, b) => a.localeCompare(b))
      .flatMap((postcode) => {
        const record = this.records.get(postcode);
        return record ? [this.copyRecord(record)] : [];
      });
  }

  async getByRange(from: number, to: number): Promise<RangeResult> {
    const start = Math.max(from, 0);
    const end = Math.min(to, 9999);
    const suburbs = start <= end
      ? [...this.records.values()]
          .filter((record) => {
            const postcode = Number(record.postcode);
            return postcode >= start && postcode <= end;
          })
          .flatMap((record) => record.name)
      : [];

    const uniqueSorted = [...new Set(suburbs)].sort();
    return {
      "suburb names:": uniqueSorted,
      "total chars": uniqueSorted.reduce(
        (total, name) => total + name.replace(/ /g, "").length,
        0
      )
    };
  }

  private copyRecord(record: PostcodeRecord): PostcodeRecord {
    return { postcode: record.postcode, name: [...record.name] };
  }
}
