import type { PostcodeRecord, RangeResult } from "../models/postcode";
import { PostcodesRepository } from "../repositories/postcodes.repository";

export class PostcodesService {
  constructor(private readonly repository: PostcodesRepository) {}

  save(records: PostcodeRecord[]): PostcodeRecord[] {
    return this.repository.saveAll(records);
  }

  byState(state: string): PostcodeRecord[] {
    return this.repository.getByState(state);
  }

  byRange(from: number, to: number): RangeResult {
    return this.repository.getByRange(from, to);
  }
}