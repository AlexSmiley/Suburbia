import { Router } from "express";
import { z } from "zod";
import type { PostcodesService } from "../services/postcodes.service";

const postcodeSchema = z.object({
  postcode: z.string().regex(/^\d{4}$/, "postcode must contain exactly four digits"),
  name: z.array(z.string().trim().min(1)).min(1)
});

const stateSchema = z.enum(["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]);

export function createPostcodesRouter(service: PostcodesService): Router {
  const router = Router();

  router.post("/postcodes", (req, res, next) => {
    try {
      const records = z.array(postcodeSchema).parse(req.body);
      res.status(200).json(service.save(records));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:first/:second", (req, res, next) => {
    try {
      const first = Number(req.params.first);
      const second = Number(req.params.second);
      if (!/^\d{4}$/.test(req.params.first) || !/^\d{4}$/.test(req.params.second)) {
        return res.status(400).json({ error: "Both range boundaries must be four-digit postcodes." });
      }
      res.json(service.byRange(first, second));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:state", (req, res, next) => {
    try {
      const state = stateSchema.parse(req.params.state.toUpperCase());
      res.json(service.byState(state));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Unsupported Australian state or territory code." });
      }
      next(error);
    }
  });

  return router;
}