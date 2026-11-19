import express, { type ErrorRequestHandler } from "express";
import type { Client } from "@libsql/client";
import { PostcodesRepository, type StateData } from "./repositories/postcodes.repository";
import { PostcodesService } from "./services/postcodes.service";
import { createPostcodesRouter } from "./controllers/postcodes.controller";

export function createApp(database: Client, stateData: StateData) {
  const app = express();
  const repository = new PostcodesRepository(database);
  const service = new PostcodesService(repository);

  app.use(express.json({ limit: "1mb" }));

  // Initialize schema and seed data once per warm function instance before serving API requests.
  app.use(async (_req, _res, next) => {
    try {
      await repository.initialize(stateData);
      next();
    } catch (error) {
      next(error);
    }
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "suburbia-node-api" });
  });

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
    console.error("Suburbia API request failed", error);
    res.status(500).json({ error: "Internal server error." });
  };
  app.use(errorHandler);

  return app;
}
