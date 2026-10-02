export type {
  Album,
  AddAlbumBody,
  MediaFormat,
} from "../../../../shared/album";

export type SortField = "title" | "artist" | "year" | "format";
export type SortDirection = "asc" | "desc";
export type ViewMode = "grid" | "list";

export type SearchStatus = "idle" | "loading" | "success" | "error";
