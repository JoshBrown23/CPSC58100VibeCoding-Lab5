import { Router } from "express";
import externalLookupRoutes from "./externalLookup/externalLookup.routes";
import collectionRoutes from "./collection/collection.routes";
import { attachDefaultUser } from "../middleware/attachDefaultUser";

const router = Router();

router.use("/search", externalLookupRoutes);
router.use("/collection", attachDefaultUser, collectionRoutes);

export default router;
