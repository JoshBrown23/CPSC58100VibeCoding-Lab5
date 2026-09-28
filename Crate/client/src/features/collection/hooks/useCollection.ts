import { useMemo, useState } from "react";
import type { Album, SortDirection, SortField } from "../types";
import { STARTER_COLLECTION } from "../data/collectionData";

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
 * Owns the user's collection state and how it's sorted. Today this
 * lives in memory and seeds from STARTER_COLLECTION. Once the backend
 * exists, this hook is the single place that changes: `albums` comes
 * from a fetched GET /api/collection response, and addAlbum posts to
 * the API instead of updating local state directly. Nothing outside
 * this hook should need to change when that happens.
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
  const [albums, setAlbums] = useState<Album[]>(STARTER_COLLECTION);
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const addAlbum = (album: Album) => {
    setAlbums((current) => {
      const alreadyOwned = current.some((existing) => existing.id === album.id);
      return alreadyOwned ? current : [...current, album];
    });
  };

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
    addAlbum,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
  };
}
