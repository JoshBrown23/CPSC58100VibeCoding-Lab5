import { prisma } from "../../db/prismaClient";
import { Prisma, type MediaFormat } from "../../../generated/prisma/client";
import { ConflictError } from "../../utils/apiError";

export interface AlbumInput {
  title: string;
  artistName: string;
  releaseYear: number | null;
  genre: string | null;
  coverImageUrl: string | null;
}

/**
 * Builds the `update` clause for the album upsert below: only the fields
 * this particular add actually supplied, so an existing row's good data
 * is never clobbered by a later add that simply didn't have that detail.
 *
 * This has to be built conditionally rather than always passing every
 * field — passing `{ set: null }` would still overwrite an existing
 * value with null, and passing `{ set: undefined }` (e.g. from
 * `value ?? undefined`) isn't a valid update value at all and throws
 * PrismaClientValidationError. Omitting the key entirely is the only way
 * to say "leave this field alone."
 */
function buildAlbumUpdate(input: AlbumInput): Prisma.AlbumUpdateInput {
  const update: Prisma.AlbumUpdateInput = {};
  if (input.releaseYear !== null) update.releaseYear = input.releaseYear;
  if (input.genre !== null) update.genre = input.genre;
  if (input.coverImageUrl !== null) update.coverImageUrl = input.coverImageUrl;
  return update;
}

// Shape returned by every query below: a collection row with its album
// and that album's artist already joined in, so the service layer never
// has to make a second round trip to assemble one.
const collectionEntryInclude = {
  album: { include: { artist: true } },
} satisfies Prisma.UserCollectionInclude;

export type CollectionEntryWithAlbum = Prisma.UserCollectionGetPayload<{
  include: typeof collectionEntryInclude;
}>;

export function findCollectionByUser(
  userId: number
): Promise<CollectionEntryWithAlbum[]> {
  return prisma.userCollection.findMany({
    where: { userId },
    orderBy: { id: "asc" },
    include: collectionEntryInclude,
  });
}

/**
 * Adds one album to a user's collection, creating the Artist/Album rows
 * first if they don't already exist.
 *
 * Wrapped in a single transaction: if the process died between creating
 * the album and creating the collection entry, a retry would otherwise
 * see a half-finished state (an orphaned Album nobody owns yet). $transaction
 * makes the whole sequence succeed or fail together.
 *
 * Throws ConflictError (409) if this user already has this exact
 * album+format combination — see the @@unique on UserCollection in
 * schema.prisma, which is what actually makes that guarantee, not this
 * code. The unique constraint is the real safety net if two requests
 * race; the try/catch here just turns the resulting database error into
 * a clean API response.
 */
export async function addToCollection(
  userId: number,
  albumInput: AlbumInput,
  format: MediaFormat
): Promise<CollectionEntryWithAlbum> {
  try {
    return await prisma.$transaction(async (tx) => {
      const artist = await tx.artist.upsert({
        where: { artistName: albumInput.artistName },
        update: {},
        create: { artistName: albumInput.artistName },
      });

      const album = await tx.album.upsert({
        where: {
          title_artistId: { title: albumInput.title, artistId: artist.id },
        },
        // If the album already exists (e.g. someone else added it first),
        // fill in any details this add supplies that the existing row is
        // still missing, rather than either overwriting good data or
        // silently discarding new data.
        update: buildAlbumUpdate(albumInput),
        create: {
          title: albumInput.title,
          artistId: artist.id,
          releaseYear: albumInput.releaseYear,
          genre: albumInput.genre,
          coverImageUrl: albumInput.coverImageUrl,
        },
      });

      return tx.userCollection.create({
        data: { userId, albumId: album.id, format },
        include: collectionEntryInclude,
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError(
        "This album is already in your collection in that format."
      );
    }
    throw error;
  }
}

/**
 * Deletes one collection entry, scoped to its owner.
 *
 * Deliberately uses deleteMany with BOTH id and userId in the WHERE
 * clause, not delete({ where: { id } }). A single delete-by-id would
 * remove the row regardless of who owns it — anyone guessing another
 * user's entry id could delete it. Requiring userId to match in the same
 * query means a mismatched id (wrong owner, or it doesn't exist at all)
 * just deletes zero rows instead of throwing or succeeding on the wrong
 * record, and the caller turns "zero rows deleted" into a 404.
 */
export async function removeFromCollection(
  userId: number,
  entryId: number
): Promise<boolean> {
  const result = await prisma.userCollection.deleteMany({
    where: { id: entryId, userId },
  });
  return result.count > 0;
}
