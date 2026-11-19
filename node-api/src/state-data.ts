import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PostcodeRecord } from "./models/postcode";
import type { StateData } from "./repositories/postcodes.repository";

const STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] as const;

export function loadStateData(directory = join(process.cwd(), "data", "states")): StateData {
  return Object.fromEntries(STATES.map((state) => {
    const content = readFileSync(join(directory, `${state}.json`), "utf8");
    return [state, JSON.parse(content) as PostcodeRecord[]];
  }));
}