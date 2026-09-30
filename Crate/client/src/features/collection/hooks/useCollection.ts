import { useCallback, useEffect, useMemo, useState } from "react";
import type { Album, SortDirection, SortField } from "../types";
import { addAlbumToCollection, fetchCollection } from "../../../services/collectionApi";

/**
 * Sorts a copy of `albums` by one field. Albums missing a value for that
 * field (currently only `year` can be null) always sort to the end, in
 * both directions, so unknowns never crowd out the real data.
 */
function sortAlbums(
  albums: Album[],
  field: SortField,
  direction: SortDirection
): Album[] {
  const factor = direction === "asc" ? 1 : -1;

  return [...albums].sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];

    if (valueA === null && valueB === null) return 0;
    if (valueA === null) return 1;
    if (valueB === null) return -1;

    if (typeof valueA === "number" && typeof valueB === "number") {
      return (valueA - valueB) * factor;
    }

    return String(valueA).localeCompare(String(valueB)) * factor;
  });
}

/**
 * useCollection
 *
 * Owns the user's collection state and how it's sorted. `albums` is
 * fetched from GET /api/collection on mount, and addAlbum posts to the
 * API rather than updating local state directly — this hook is the only
 * place either of those happens, so nothing outside it needs to know the
 * collection is backed by a real database rather than memory.
 *
 * addAlbum can reject (network failure, or a 409 if the album is already
 * in the collection in that format) — callers are responsible for
 * catching that and showing something to the user; this hook doesn't
 * assume how that should be displayed.
 *
 * Sort field/direction live here rather than as page-local state
 * because they determine the actual order of `albums` returned below —
 * they're part of what this hook computes, not just how the result is
 * displayed. Contrast with view mode (grid vs. list) in CollectionPage,
 * which doesn't change the data at all, only how a given album is
 * rendered — that's why it's local state on the page instead of being
 * pulled in here. Keep that distinction in mind before moving either
 * one: display-only state belongs on the page, state that affects the
 * data itself belongs in this hook.
 */
export function useCollection() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    fetchCollection(controller.signal)
      .then(setAlbums)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "Couldn't load your collection."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const addAlbum = useCallback(async (album: Album) => {
    const saved = await addAlbumToCollection({
      title: album.title,
      artist: album.artist,
      releaseYear: album.year,
      format: album.format,
    });
    setAlbums((current) => [...current, saved]);
  }, []);

  const toggleSortDirection = () => {
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
  };

  const sortedAlbums = useMemo(
    () => sortAlbums(albums, sortField, sortDirection),
    [albums, sortField, sortDirection]
  );

  return {
    albums: sortedAlbums,
    collectionSize: albums.length,
    isLoading,
    loadError,
    addAlbum,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
  };
}
