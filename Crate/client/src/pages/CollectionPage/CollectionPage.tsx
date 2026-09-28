import { useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import SearchBar from "../../features/collection/components/SearchBar/SearchBar";
import SortControl from "../../features/collection/components/SortControl/SortControl";
import LayoutToggle from "../../features/collection/components/LayoutToggle/LayoutToggle";
import AlbumCard from "../../features/collection/components/AlbumCard/AlbumCard";
import AlbumListItem from "../../features/collection/components/AlbumListItem/AlbumListItem";
import { useCollection } from "../../features/collection/hooks/useCollection";
import { useAlbumSearch } from "../../features/collection/hooks/useAlbumSearch";
import type { ViewMode } from "../../features/collection/types";
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
  const {
    albums,
    collectionSize,
    addAlbum,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
  } = useCollection();

  const ownedIds = useMemo(() => albums.map((album) => album.id), [albums]);
  const { query, setQuery, results, status, errorMessage } =
    useAlbumSearch(ownedIds);

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
            onAdd={addAlbum}
          />
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

          {albums.length === 0 ? (
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
