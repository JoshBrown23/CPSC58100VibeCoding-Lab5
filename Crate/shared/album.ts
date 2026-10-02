/**
 * Shared album contract for Crate's HTTP API.
 *
 * Search results (GET /api/search/albums) and collection entries
 * (GET/POST /api/collection) use the same Album shape so the client never
 * has to translate between two payloads. POST /api/collection accepts
 * AddAlbumBody — every Album field except `id`, which the server assigns.
 *
 * `year` is the wire name (not the database's releaseYear). Optional
 * catalog details are `null` when MusicBrainz (or the client) doesn't
 * have them — never omitted, so both sides can rely on the keys existing.
 */

export const MEDIA_FORMATS = ["Vinyl", "CD"] as const;
export type MediaFormat = (typeof MEDIA_FORMATS)[number];

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  format: MediaFormat;
  genre: string | null;
  coverImageUrl: string | null;
}

export type AddAlbumBody = Omit<Album, "id">;
