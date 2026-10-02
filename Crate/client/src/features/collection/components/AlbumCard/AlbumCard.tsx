import { useEffect, useState } from "react";
import type { Album } from "../../types";
import { formatYear } from "../../utils/formatYear";
import "./AlbumCard.css";

interface AlbumCardProps {
  album: Album;
}

// Explicit format -> class map, rather than deriving the class name by
// transforming album.format at render time. TypeScript enforces that this
// stays exhaustive against Album["format"], so a renamed or added format
// value fails to compile here instead of silently producing an unstyled
// sleeve.
const SLEEVE_CLASS_BY_FORMAT: Record<Album["format"], string> = {
  Vinyl: "album-card__sleeve--vinyl",
  CD: "album-card__sleeve--cd",
};

/**
 * AlbumCard
 * Presentational only — no data fetching, no knowledge of the
 * collection as a whole. Reusable anywhere a single album needs
 * to be displayed (grid view, search results, detail page later).
 */
export default function AlbumCard({ album }: AlbumCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    setCoverFailed(false);
  }, [album.coverImageUrl]);

  const coverImageUrl = album.coverImageUrl;
  const showCover = coverImageUrl !== null && !coverFailed;

  return (
    <article className="album-card">
      {showCover ? (
        <img
          className="album-card__cover"
          src={coverImageUrl}
          alt=""
          onError={() => setCoverFailed(true)}
        />
      ) : (
        <div
          className={`album-card__sleeve ${SLEEVE_CLASS_BY_FORMAT[album.format]}`}
          aria-hidden="true"
        />
      )}
      <div className="album-card__body">
        <span className="album-card__format">{album.format}</span>
        {/* h2: the page's only h1 is CollectionPage's "Your Shelf" heading,
            so this is one level down with nothing skipped. */}
        <h2 className="album-card__title">{album.title}</h2>
        <p className="album-card__meta">
          {album.artist} · {formatYear(album.year)}
          {album.genre ? ` · ${album.genre}` : ""}
        </p>
      </div>
    </article>
  );
}
