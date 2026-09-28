import type { Album } from "../features/collection/types";
import { apiGet } from "./apiClient";

// Matches GET /api/search/albums — see server/src/api/externalLookup.
interface SearchAlbumsResponse {
  data: Album[];
  count: number;
}

const RESULT_LIMIT = 8;

/** Searches the external music catalog (MusicBrainz, via our API). */
export async function searchAlbums(
  query: string,
  signal?: AbortSignal
): Promise<Album[]> {
  const response = await apiGet<SearchAlbumsResponse>(
    "/search/albums",
    { q: query, limit: String(RESULT_LIMIT) },
    signal
  );

  return response.data;
}
