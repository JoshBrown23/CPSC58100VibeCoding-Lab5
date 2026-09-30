import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  parseAddToCollectionBody,
  parseCollectionEntryId,
} from "./collection.validation";
import {
  addAlbumToCollection,
  deleteCollectionEntry,
  getCollection,
} from "./collection.service";

/** GET /api/collection — this user's saved albums. */
export const getCollectionHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const entries = await getCollection(req.userId!);
    res.status(200).json({ data: entries, count: entries.length });
  }
);

/** POST /api/collection — add an album (creating Artist/Album rows as needed). */
export const addToCollectionHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const body = parseAddToCollectionBody(req);
    const entry = await addAlbumToCollection(req.userId!, body);
    res.status(201).json({ data: entry });
  }
);

/** DELETE /api/collection/:id — remove one entry. Not yet called from the UI. */
export const deleteFromCollectionHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const entryId = parseCollectionEntryId(req);
    await deleteCollectionEntry(req.userId!, entryId);
    res.status(204).send();
  }
);
