import type { Request } from "express";
import { BadRequestError } from "../../utils/apiError";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

export interface SearchAlbumsQuery {
  query: string;
  limit: number;
}

export function parseSearchAlbumsQuery(req: Request): SearchAlbumsQuery {
  const rawQuery = req.query.q;

  if (typeof rawQuery !== "string" || rawQuery.trim().length === 0) {
    throw new BadRequestError('Query parameter "q" is required.');
  }

  let limit = DEFAULT_LIMIT;
  const rawLimit = req.query.limit;

  if (typeof rawLimit === "string") {
    const parsed = Number.parseInt(rawLimit, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      throw new BadRequestError(
        'Query parameter "limit" must be a positive integer.'
      );
    }
    limit = Math.min(parsed, MAX_LIMIT);
  }

  return { query: rawQuery.trim(), limit };
}

// MusicBrainz IDs (MBIDs) are UUIDs.
const MBID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseReleaseId(req: Request): string {
  const { mbid } = req.params;

  if (!MBID_PATTERN.test(mbid)) {
    throw new BadRequestError("Invalid MusicBrainz release id.");
  }

  return mbid;
}
