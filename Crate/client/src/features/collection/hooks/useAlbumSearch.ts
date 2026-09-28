import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { searchAlbums } from "../../../services/externalMusicApi";
import type { Album, SearchStatus } from "../types";

// The server spaces its calls to MusicBrainz ~1.1s apart, so waiting for
// a pause in typing avoids queueing a request for every keystroke.
const DEBOUNCE_MS = 400;

/**
 * useAlbumSearch
 *
 * Owns everything about searching the external catalog: the input text,
 * debouncing, the request itself, and loading/error state. SearchBar is
 * purely presentational and just renders what this returns.
 *
 * `ownedIds` filters out albums the user already has, so they can't be
 * added twice.
 */
export function useAlbumSearch(ownedIds: string[]) {
  const [query, setQuery] = useState("");
  const [rawResults, setRawResults] = useState<Album[]>([]);
  const [requestStatus, setRequestStatus] = useState<SearchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(trimmedQuery, DEBOUNCE_MS);

  // Between a keystroke and the debounce firing there's no request yet,
  // but the user should still see that a search is coming.
  const isWaitingToSearch = trimmedQuery !== debouncedQuery;

  useEffect(() => {
    if (!debouncedQuery) {
      setRawResults([]);
      setRequestStatus("idle");
      setErrorMessage(null);
      return;
    }

    // Aborting on cleanup means a slow response for an old query can never
    // overwrite the results of a newer one.
    const controller = new AbortController();
    setRequestStatus("loading");
    setErrorMessage(null);

    searchAlbums(debouncedQuery, controller.signal)
      .then((albums) => {
        setRawResults(albums);
        setRequestStatus("success");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setRawResults([]);
        setRequestStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong searching the catalog."
        );
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const results = useMemo(() => {
    const owned = new Set(ownedIds);
    return rawResults.filter((album) => !owned.has(album.id));
  }, [rawResults, ownedIds]);

  return {
    query,
    setQuery,
    results,
    status: isWaitingToSearch ? ("loading" as const) : requestStatus,
    errorMessage,
  };
}
