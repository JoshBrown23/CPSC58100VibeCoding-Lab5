import { Router } from "express";
import {
  addToCollectionHandler,
  deleteFromCollectionHandler,
  getCollectionHandler,
} from "./collection.controller";

const router = Router();

router.get("/", getCollectionHandler);
router.post("/", addToCollectionHandler);
router.delete("/:id", deleteFromCollectionHandler);

export default router;
