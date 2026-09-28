import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { NotFoundError } from "../../utils/apiError";
import {
  parseReleaseId,
  parseSearchAlbumsQuery,
} from "./externalLookup.validation";
import { getAlbumById, searchAlbums } from "./externalLookup.service";

/**
 * GET /api/search/albums?q=...&limit=...
 * A search returning zero matches is still a successful request, so
 * this always responds 200 with an (possibly empty) array — 404 is
 * reserved for a specific resource that doesn't exist (see below).
 */
export const searchAlbumsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { query, limit } = parseSearchAlbumsQuery(req);
    const results = await searchAlbums(query, limit);

    res.status(200).json({ data: results, count: results.length });
  }
);

/**
 * GET /api/search/albums/:mbid
 * Looks up one specific release by its MusicBrainz ID.
 */
export const getAlbumByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const mbid = parseReleaseId(req);
    const album = await getAlbumById(mbid);

    if (!album) {
      throw new NotFoundError(`No release found for id "${mbid}".`);
    }

    res.status(200).json({ data: album });
  }
);
