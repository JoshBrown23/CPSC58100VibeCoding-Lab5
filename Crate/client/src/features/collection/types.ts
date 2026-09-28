export type MediaFormat = "Vinyl" | "CD";

export interface Album {
  id: string;
  title: string;
  artist: string;
  // null when the catalog has no release date for this pressing.
  year: number | null;
  format: MediaFormat;
}

export type SortField = "title" | "artist" | "year" | "format";
export type SortDirection = "asc" | "desc";
export type ViewMode = "grid" | "list";

export type SearchStatus = "idle" | "loading" | "success" | "error";
