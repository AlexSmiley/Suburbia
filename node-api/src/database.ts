import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function openDatabase(filename = process.env.DATABASE_PATH ?? "./data/suburbia.sqlite") {
  const path = resolve(filename);
  if (filename !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(filename === ":memory:" ? filename : path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}