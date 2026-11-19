import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import type Database from "better-sqlite3";
import { PostcodesRepository } from "./repositories/postcodes.repository";
import { PostcodesService } from "./services/postcodes.service";
import { createPostcodesRouter } from "./controllers/postcodes.controller";

export function createApp(database: Database.Database) {
  const app = express();
  const repository = new PostcodesRepository(database);
  const service = new PostcodesService(repository);

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use("/", createPostcodesRouter(service));

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error?.name === "ZodError") {
      res.status(400).json({ error: "Invalid request body.", details: error.issues });
      return;
    }
    if (error instanceof SyntaxError && "body" in error) {
      res.status(400).json({ error: "Request body must contain valid JSON." });
      return;
    }
    res.status(500).json({ error: "Internal server error." });
  };
  app.use(errorHandler);

  return app;
}