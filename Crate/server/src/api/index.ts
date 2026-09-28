import { Router } from "express";
import externalLookupRoutes from "./externalLookup/externalLookup.routes";

const router = Router();

router.use("/search", externalLookupRoutes);

export default router;
