import { Router } from "express";
import { z } from "zod";
import type { PostcodesService } from "../services/postcodes.service";

const postcodeSchema = z.object({
  postcode: z.string().regex(/^\\d{4}$/, "postcode must contain exactly four digits"),
  name: z.array(z.string().refine((value) => value.trim().length > 0)).min(1)
});

const stateSchema = z.enum(["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]);

export function createPostcodesRouter(service: PostcodesService): Router {
  const router = Router();

  router.post("/postcodes", async (req, res, next) => {
    try {
      const records = z.array(postcodeSchema).parse(req.body);
      res.status(200).json(await service.save(records));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:first/:second", async (req, res, next) => {
    try {
      if (!/^\\d{1,10}$/.test(req.params.first) || !/^\\d{1,10}$/.test(req.params.second)) {
        return res.status(400).json({ error: "Range boundaries must be numeric postcodes." });
      }
      res.json(await service.byRange(Number(req.params.first), Number(req.params.second)));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:state", async (req, res, next) => {
    const parsed = stateSchema.safeParse(req.params.state.toUpperCase());
    if (!parsed.success) {
      return res.status(404).json({ error: `Unknown state: ${req.params.state}` });
    }
    try {
      res.json(await service.byState(parsed.data));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
