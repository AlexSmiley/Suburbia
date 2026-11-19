import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function openDatabase(): Client {
  const databaseUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (databaseUrl) {
    if (!authToken) {
      throw new Error("TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL is configured.");
    }
    return createClient({ url: databaseUrl, authToken });
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Hosted database configuration is missing. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel."
    );
  }

  const filename = resolve(process.env.DATABASE_PATH ?? "./storage/suburbia.sqlite");
  mkdirSync(dirname(filename), { recursive: true });
  return createClient({ url: `file:${filename}` });
}
