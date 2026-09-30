import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { searchAlbums } from "../../../services/externalMusicApi";
import type { Album, SearchStatus } from "../types";

// The server spaces its calls to MusicBrainz ~1.1s apart, so waiting for
// a pause in typing avoids queueing a request for every keystroke.
const DEBOUNCE_MS = 400;

/** title + artist, case-insensitive, as a single comparable key. */
function albumKey(title: string, artist: string): string {
  return `${title.toLowerCase()}::${artist.toLowerCase()}`;
}

/**
 * useAlbumSearch
 *
 * Owns everything about searching the external catalog: the input text,
 * debouncing, the request itself, and loading/error state. SearchBar is
 * purely presentational and just renders what this returns.
 *
 * `ownedAlbums` filters out albums the user already has, matched by
 * title+artist rather than id. That's a deliberate compromise: search
 * results carry a MusicBrainz id (a UUID), while a saved collection
 * entry's id comes from the database (an integer, stringified) — the two
 * id spaces have no overlap, so comparing them directly would never
 * exclude anything. Title+artist matching is looser (a retitled reissue
 * could slip through as "new"), but it's the only signal both sides
 * actually share given the current schema.
 */
export function useAlbumSearch(ownedAlbums: Pick<Album, "title" | "artist">[]) {
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
    const ownedKeys = new Set(
      ownedAlbums.map((album) => albumKey(album.title, album.artist))
    );
    return rawResults.filter(
      (album) => !ownedKeys.has(albumKey(album.title, album.artist))
    );
  }, [rawResults, ownedAlbums]);

  return {
    query,
    setQuery,
    results,
    status: isWaitingToSearch ? ("loading" as const) : requestStatus,
    errorMessage,
  };
}
