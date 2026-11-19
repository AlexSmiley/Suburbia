import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PostcodeRecord } from "./models/postcode";
import type { StateData } from "./repositories/postcodes.repository";

const STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] as const;

/**
 * Load the bundled source dataset into process memory.
 *
 * Resolve relative to this module first (works for both src/server.ts and
 * dist/server.js), then fall back to the service working directory. This
 * avoids relying on Vercel's process.cwd() being the repository root.
 */
export function loadStateData(directory?: string): StateData {
  const candidates = directory
    ? [directory]
    : [
        join(__dirname, "..", "data", "states"),
        join(process.cwd(), "data", "states"),
        join(process.cwd(), "node-api", "data", "states")
      ];

  const resolvedDirectory = candidates.find((candidate) =>
    STATES.every((state) => existsSync(join(candidate, `${state}.json`)))
  );

  if (!resolvedDirectory) {
    throw new Error(
      `Unable to locate bundled postcode datasets. Checked: ${candidates.join(", ")}`
    );
  }

  const data = {} as StateData;
  for (const state of STATES) {
    const file = join(resolvedDirectory, `${state}.json`);
    const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (!Array.isArray(parsed)) {
      throw new Error(`Invalid postcode dataset: ${file} must contain an array.`);
    }
    data[state] = parsed as PostcodeRecord[];
  }

  return data;
}
