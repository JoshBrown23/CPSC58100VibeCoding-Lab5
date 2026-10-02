import type { Album } from "../../../../shared/album";
import {
  addToCollection,
  findCollectionByUser,
  removeFromCollection,
  type CollectionEntryWithAlbum,
} from "./collection.repository";
import type { AddToCollectionBody } from "./collection.validation";
import { NotFoundError } from "../../utils/apiError";

function toResponse(entry: CollectionEntryWithAlbum): Album {
  return {
    // Stringified so this lines up with Album.id, which also holds
    // MusicBrainz IDs (UUIDs) for search results. The two id spaces are
    // different shapes (numeric here, UUID there) and are never compared
    // to each other directly — see the note in useAlbumSearch.ts about
    // why "already owned" matching uses title+artist instead of id.
    id: String(entry.id),
    title: entry.album.title,
    artist: entry.album.artist.artistName,
    year: entry.album.releaseYear,
    format: entry.format,
    genre: entry.album.genre,
    coverImageUrl: entry.album.coverImageUrl,
  };
}

export async function getCollection(userId: number): Promise<Album[]> {
  const rows = await findCollectionByUser(userId);
  return rows.map(toResponse);
}

export async function addAlbumToCollection(
  userId: number,
  body: AddToCollectionBody
): Promise<Album> {
  const entry = await addToCollection(
    userId,
    {
      title: body.title,
      artistName: body.artist,
      releaseYear: body.year,
      genre: body.genre,
      coverImageUrl: body.coverImageUrl,
    },
    body.format
  );
  return toResponse(entry);
}

export async function deleteCollectionEntry(
  userId: number,
  entryId: number
): Promise<void> {
  const deleted = await removeFromCollection(userId, entryId);
  if (!deleted) {
    throw new NotFoundError("Collection entry not found.");
  }
}
