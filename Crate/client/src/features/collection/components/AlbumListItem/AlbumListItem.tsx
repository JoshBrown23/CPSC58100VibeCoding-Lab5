import type { Album } from "../../types";
import { formatYear } from "../../utils/formatYear";
import "./AlbumListItem.css";

interface AlbumListItemProps {
  album: Album;
}

/**
 * AlbumListItem
 * The list-view counterpart to AlbumCard. Deliberately limited to
 * title, artist, year, and format — no cover art — so list view stays
 * scannable. Presentational only, same as AlbumCard.
 *
 * Renders as an <li> — its parent in CollectionPage is a <ul>, so this
 * shows up as list semantics for assistive tech instead of an
 * unordered stack of generic divs.
 */
export default function AlbumListItem({ album }: AlbumListItemProps) {
  return (
    <li className="album-list-item">
      <span className="album-list-item__format">{album.format}</span>
      <span className="album-list-item__title">{album.title}</span>
      <span className="album-list-item__artist">{album.artist}</span>
      <span className="album-list-item__year">{formatYear(album.year)}</span>
    </li>
  );
}
