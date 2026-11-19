import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function openDatabase(filename = process.env.DATABASE_PATH ?? "./storage/suburbia.sqlite") {
  if (filename === ":memory:") return new Database(filename);
  const path = resolve(filename);
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}