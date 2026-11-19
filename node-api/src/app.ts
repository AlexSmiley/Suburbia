import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import type Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PostcodesRepository, type StateData } from "./repositories/postcodes.repository";
import { PostcodesService } from "./services/postcodes.service";
import { createPostcodesRouter } from "./controllers/postcodes.controller";

export function createApp(database: Database.Database, stateData: StateData) {
  const app = express();
  const repository = new PostcodesRepository(database, stateData);
  const service = new PostcodesService(repository);
  const frontendDirectory = resolve(__dirname, "../public");
  const frontendIndex = resolve(frontendDirectory, "index.html");

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // Serve the compiled React application from the same Node.js origin.
  app.use(express.static(frontendDirectory));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "suburbia-node-api" });
  });

  // Keep the API routes available alongside the frontend.
  app.use("/", createPostcodesRouter(service));

  // A clear setup response is more useful than Express's generic 404
  // when the frontend bundle has not been built yet.
  app.get("/", (_req, res) => {
    if (existsSync(frontendIndex)) {
      res.sendFile(frontendIndex);
      return;
    }
    res.status(503).type("text/plain").send(
      "Suburbia frontend has not been built. Run npm run build from the node-api directory."
    );
  });

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