import type { Album } from "../types";

/**
 * Placeholder data — there is no database yet, so the user's collection
 * starts from these three records and lives only in memory (a page
 * refresh resets it). Once persistence exists, STARTER_COLLECTION is
 * replaced by a GET /api/collection call in hooks/useCollection.ts.
 *
 * Searching for new albums to add no longer uses mock data: it goes
 * through the real catalog API (see services/externalMusicApi.ts).
 */
export const STARTER_COLLECTION: Album[] = [
  { id: "own-1", title: "Rumours", artist: "Fleetwood Mac", year: 1977, format: "Vinyl" },
  { id: "own-2", title: "Abbey Road", artist: "The Beatles", year: 1969, format: "Vinyl" },
  { id: "own-3", title: "Thriller", artist: "Michael Jackson", year: 1982, format: "CD" },
];
