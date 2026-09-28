import type { Album, SearchStatus } from "../../types";
import { formatYear } from "../../utils/formatYear";
import "./SearchBar.css";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: Album[];
  status: SearchStatus;
  errorMessage: string | null;
  onAdd: (album: Album) => void;
}

function getStatusMessage(
  status: SearchStatus,
  resultCount: number,
  errorMessage: string | null
): string {
  switch (status) {
    case "loading":
      return "Searching…";
    case "error":
      return errorMessage ?? "Search failed.";
    case "success":
      if (resultCount === 0) return "No matches found.";
      return `${resultCount} ${resultCount === 1 ? "result" : "results"}`;
    default:
      return "";
  }
}

/**
 * SearchBar
 * Presentational only: renders whatever query, results, and status it's
 * given. Fetching, debouncing, and filtering live in useAlbumSearch, so
 * this component knows nothing about where results come from.
 */
export default function SearchBar({
  query,
  onQueryChange,
  results,
  status,
  errorMessage,
  onAdd,
}: SearchBarProps) {
  const hasQuery = query.trim().length > 0;
  const statusMessage = hasQuery
    ? getStatusMessage(status, results.length, errorMessage)
    : "";

  return (
    <div className="search-bar">
      <label className="search-bar__label" htmlFor="album-search">
        Add to your shelf
      </label>
      <input
        id="album-search"
        className="search-bar__input"
        type="text"
        placeholder="Search by title or artist"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        autoComplete="off"
      />

      {/* Always rendered so screen readers reliably announce changes to it. */}
      <p
        className={
          status === "error" && hasQuery
            ? "search-bar__status search-bar__status--error"
            : "search-bar__status"
        }
        role="status"
        aria-live="polite"
      >
        {statusMessage}
      </p>

      {hasQuery && results.length > 0 && (
        <ul className="search-bar__results">
          {results.map((album) => (
            <li className="search-bar__result" key={album.id}>
              <div className="search-bar__result-text">
                <span className="search-bar__result-title">{album.title}</span>
                <span className="search-bar__result-meta">
                  {album.artist} · {formatYear(album.year)} · {album.format}
                </span>
              </div>
              <button
                type="button"
                className="search-bar__add"
                aria-label={`Add ${album.title} by ${album.artist}`}
                onClick={() => {
                  onAdd(album);
                  onQueryChange("");
                }}
              >
                + Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
