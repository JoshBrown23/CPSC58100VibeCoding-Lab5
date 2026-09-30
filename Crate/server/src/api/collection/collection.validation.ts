import type { Request } from "express";
import { BadRequestError } from "../../utils/apiError";

const VALID_FORMATS = ["CD", "Vinyl"] as const;
type ValidFormat = (typeof VALID_FORMATS)[number];

const MAX_TITLE_ARTIST_LENGTH = 300;
const MAX_GENRE_LENGTH = 100;
const MAX_URL_LENGTH = 2048;

export interface AddToCollectionBody {
  title: string;
  artist: string;
  releaseYear: number | null;
  genre: string | null;
  coverImageUrl: string | null;
  format: ValidFormat;
}

function requireNonEmptyString(
  value: unknown,
  field: string,
  maxLength: number
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BadRequestError(`"${field}" is required.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new BadRequestError(
      `"${field}" must be ${maxLength} characters or fewer.`
    );
  }
  return trimmed;
}

function parseOptionalString(
  value: unknown,
  field: string,
  maxLength: number
): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new BadRequestError(`"${field}" must be a string.`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLength) {
    throw new BadRequestError(
      `"${field}" must be ${maxLength} characters or fewer.`
    );
  }
  return trimmed;
}

function parseOptionalYear(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const year = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    throw new BadRequestError('"releaseYear" must be a 4-digit year.');
  }
  return year;
}

export function parseAddToCollectionBody(req: Request): AddToCollectionBody {
  const body: unknown = req.body ?? {};
  const record = (typeof body === "object" && body !== null ? body : {}) as Record<
    string,
    unknown
  >;

  const format = record.format;
  if (format !== "CD" && format !== "Vinyl") {
    throw new BadRequestError('"format" must be either "CD" or "Vinyl".');
  }

  return {
    title: requireNonEmptyString(record.title, "title", MAX_TITLE_ARTIST_LENGTH),
    artist: requireNonEmptyString(record.artist, "artist", MAX_TITLE_ARTIST_LENGTH),
    releaseYear: parseOptionalYear(record.releaseYear),
    genre: parseOptionalString(record.genre, "genre", MAX_GENRE_LENGTH),
    coverImageUrl: parseOptionalString(
      record.coverImageUrl,
      "coverImageUrl",
      MAX_URL_LENGTH
    ),
    format,
  };
}

const ENTRY_ID_PATTERN = /^\d+$/;

export function parseCollectionEntryId(req: Request): number {
  const { id } = req.params;
  if (!ENTRY_ID_PATTERN.test(id)) {
    throw new BadRequestError("Invalid collection entry id.");
  }
  return Number.parseInt(id, 10);
}
