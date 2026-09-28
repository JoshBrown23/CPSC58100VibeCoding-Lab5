import { Router } from "express";
import {
  getAlbumByIdHandler,
  searchAlbumsHandler,
} from "./externalLookup.controller";

const router = Router();

router.get("/albums", searchAlbumsHandler);
router.get("/albums/:mbid", getAlbumByIdHandler);

export default router;
