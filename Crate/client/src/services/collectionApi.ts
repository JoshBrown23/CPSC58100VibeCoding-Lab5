import type { Album } from "../features/collection/types";
import { apiDelete, apiGet, apiPost } from "./apiClient";

// Matches GET/POST /api/collection — see server/src/api/collection.
interface CollectionListResponse {
  data: Album[];
  count: number;
}

interface CollectionEntryResponse {
  data: Album;
}

export function fetchCollection(signal?: AbortSignal): Promise<Album[]> {
  return apiGet<CollectionListResponse>("/collection", {}, signal).then(
    (response) => response.data
  );
}

export interface AddAlbumRequest {
  title: string;
  artist: string;
  releaseYear: number | null;
  format: Album["format"];
}

export async function addAlbumToCollection(
  album: AddAlbumRequest
): Promise<Album> {
  const response = await apiPost<CollectionEntryResponse>(
    "/collection",
    album
  );
  return response.data;
}

/** Not called from the UI yet — no "remove from collection" affordance exists. */
export function removeAlbumFromCollection(entryId: string): Promise<void> {
  return apiDelete(`/collection/${entryId}`);
}
