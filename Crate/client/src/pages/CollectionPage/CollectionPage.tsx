import { useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import SearchBar from "../../features/collection/components/SearchBar/SearchBar";
import SortControl from "../../features/collection/components/SortControl/SortControl";
import LayoutToggle from "../../features/collection/components/LayoutToggle/LayoutToggle";
import AlbumCard from "../../features/collection/components/AlbumCard/AlbumCard";
import AlbumListItem from "../../features/collection/components/AlbumListItem/AlbumListItem";
import { useCollection } from "../../features/collection/hooks/useCollection";
import { useAlbumSearch } from "../../features/collection/hooks/useAlbumSearch";
import type { Album, ViewMode } from "../../features/collection/types";
import "./CollectionPage.css";

/**
 * CollectionPage
 * Composes feature components and wires them to useCollection.
 *
 * viewMode (grid vs. list) is local state here, not part of
 * useCollection, because it's purely a display choice — it never
 * changes which albums exist or their order, only how each one is
 * rendered. See the comment on useCollection for the full rule this
 * follows: data-affecting state lives in the hook, display-only state
 * stays on the page.
 */
export default function CollectionPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [addAlbumError, setAddAlbumError] = useState<string | null>(null);

  const {
    albums,
    collectionSize,
    isLoading,
    loadError,
    addAlbum,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
  } = useCollection();

  const { query, setQuery, results, status, errorMessage } =
    useAlbumSearch(albums);

  // addAlbum can reject (network failure, or a 409 if it's already in the
  // collection in that format) — this is the one place that catches it
  // and turns it into something visible, so SearchBar stays a component
  // that only ever calls onAdd and never has to know it can fail.
  const handleAdd = async (album: Album) => {
    setAddAlbumError(null);
    try {
      await addAlbum(album);
    } catch (error) {
      setAddAlbumError(
        error instanceof Error
          ? error.message
          : "Couldn't add that album. Try again."
      );
    }
  };

  return (
    <div className="collection-page">
      <Header />

      <main>
        <section className="collection-intro">
          <p className="collection-intro__eyebrow">your collection</p>
          <h1 className="collection-intro__headline">Your Shelf</h1>
          <p className="collection-intro__sub">
            Search the catalog to add a record, then sort the shelf however
            you like to browse it.
          </p>
        </section>

        <section className="collection-search">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            results={results}
            status={status}
            errorMessage={errorMessage}
            onAdd={handleAdd}
          />
          {addAlbumError && (
            <p className="collection-search__error" role="alert">
              {addAlbumError}
            </p>
          )}
        </section>

        <section className="collection-list">
          <div className="collection-list__toolbar">
            <span className="collection-list__count">
              {collectionSize} {collectionSize === 1 ? "record" : "records"}
            </span>
            <div className="collection-list__controls">
              <SortControl
                sortField={sortField}
                sortDirection={sortDirection}
                onFieldChange={setSortField}
                onToggleDirection={toggleSortDirection}
              />
              <LayoutToggle view={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {isLoading ? (
            <p className="collection-list__status">Loading your shelf…</p>
          ) : loadError ? (
            <p className="collection-list__status collection-list__status--error" role="alert">
              {loadError} Make sure the API server is running.
            </p>
          ) : albums.length === 0 ? (
            <p className="collection-list__empty">
              Nothing on the shelf yet — search above to add your first
              record.
            </p>
          ) : viewMode === "grid" ? (
            <div className="collection-list__grid">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <ul className="collection-list__list" role="list">
              {albums.map((album) => (
                <AlbumListItem key={album.id} album={album} />
              ))}
            </ul>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
