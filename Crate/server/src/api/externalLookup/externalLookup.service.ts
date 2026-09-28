import { config } from "../../config/env";
import { ApiError, UpstreamServiceError } from "../../utils/apiError";
import { createThrottle } from "../../utils/throttle";

const MUSICBRAINZ_BASE_URL = "https://musicbrainz.org/ws/2";
const REQUEST_TIMEOUT_MS = 8000;

// MusicBrainz asks unauthenticated clients to stay at or under ~1
// request/second and answers 503 beyond that. 1100ms leaves a small
// buffer. This is shared across *all* incoming requests to our server:
// two users searching at the same moment still produce only one
// MusicBrainz call per 1100ms. The queue cap turns a burst into fast
// 429s instead of long waits.
const musicBrainzThrottle = createThrottle({
  minIntervalMs: 1100,
  maxQueueSize: 5,
});

// Our app only tracks two formats — anything else MusicBrainz returns
// (Cassette, Digital Media, SACD, ...) gets filtered out in toCatalogAlbum.
export type CatalogFormat = "Vinyl" | "CD";

export interface CatalogAlbum {
  id: string; // MusicBrainz release ID (MBID)
  title: string;
  artist: string;
  year: number | null;
  format: CatalogFormat;
}

interface MusicBrainzMedium {
  format?: string;
}

interface MusicBrainzArtistCredit {
  name?: string;
  joinphrase?: string;
  artist?: { name?: string };
}

interface MusicBrainzRelease {
  id: string;
  title: string;
  date?: string;
  "artist-credit"?: MusicBrainzArtistCredit[];
  media?: MusicBrainzMedium[];
}

interface MusicBrainzReleaseSearchResponse {
  releases: MusicBrainzRelease[];
}

function normalizeFormat(rawFormat?: string): CatalogFormat | null {
  if (!rawFormat) return null;
  const value = rawFormat.toLowerCase();
  if (value.includes("vinyl")) return "Vinyl";
  if (value === "cd") return "CD";
  return null;
}

function extractYear(date?: string): number | null {
  if (!date) return null;
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

/**
 * MusicBrainz splits a joint credit like "Simon & Garfunkel" into separate
 * entries, each carrying the text that joins it to the next one.
 * Concatenating them back together rebuilds the display name.
 */
function formatArtistCredit(
  credits?: MusicBrainzArtistCredit[]
): string | null {
  if (!credits?.length) return null;

  const formatted = credits
    .map(
      (credit) =>
        (credit.name ?? credit.artist?.name ?? "") + (credit.joinphrase ?? "")
    )
    .join("")
    .trim();

  return formatted || null;
}

/**
 * Inside a quoted Lucene phrase only backslash and double quote are
 * special. Unescaped, a search like `12" single` makes MusicBrainz reject
 * the query with a 400 — which would surface as a misleading 502 from us.
 */
function escapeLucenePhrase(text: string): string {
  return text.replace(/[\\"]/g, "\\$&");
}

function toCatalogAlbum(release: MusicBrainzRelease): CatalogAlbum | null {
  const format = normalizeFormat(release.media?.[0]?.format);
  if (!format) return null;

  const artist = formatArtistCredit(release["artist-credit"]);
  if (!artist) return null;

  return {
    id: release.id,
    title: release.title,
    artist,
    year: extractYear(release.date),
    format,
  };
}

/**
 * Performs one MusicBrainz HTTP request: sets the required User-Agent,
 * enforces a timeout, and maps upstream failures onto ApiError so callers
 * never deal with raw fetch errors or MusicBrainz's own status codes.
 * Always called through musicBrainzThrottle (see musicBrainzFetch), so the
 * timeout clock starts when the request is actually sent, not while it
 * waits for its turn.
 */
async function performMusicBrainzRequest<T>(url: URL): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": config.musicBrainzUserAgent },
      signal: controller.signal,
    });
  } catch {
    throw new UpstreamServiceError(
      "Unable to reach MusicBrainz. It may be down or unreachable from this network."
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    return null;
  }

  if (response.status === 503) {
    // MusicBrainz asks clients to stay under ~1 request/second without an
    // API key and returns 503 once you exceed it.
    throw new ApiError(
      503,
      "MusicBrainz is rate-limiting this server right now. Try again in a moment."
    );
  }

  if (!response.ok) {
    throw new UpstreamServiceError(
      `MusicBrainz responded with an unexpected status (${response.status}).`
    );
  }

  return (await response.json()) as T;
}

/**
 * The only way the rest of this file talks to MusicBrainz. Builds the URL
 * and runs the request through the shared throttle, so no code path can
 * accidentally bypass the rate limit.
 */
function musicBrainzFetch<T>(
  path: string,
  searchParams: Record<string, string>
): Promise<T | null> {
  const url = new URL(`${MUSICBRAINZ_BASE_URL}${path}`);
  url.searchParams.set("fmt", "json");
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  return musicBrainzThrottle(() => performMusicBrainzRequest<T>(url));
}

export async function searchAlbums(
  query: string,
  limit: number
): Promise<CatalogAlbum[]> {
  const phrase = escapeLucenePhrase(query);
  const data = await musicBrainzFetch<MusicBrainzReleaseSearchResponse>(
    "/release",
    {
      query: `release:"${phrase}" OR artist:"${phrase}"`,
      // Over-fetch: some results get dropped for having a format we
      // don't track (Cassette, Digital Media, ...) or a duplicate
      // title+artist+format combination.
      limit: String(Math.min(limit * 3, 100)),
    }
  );

  if (!data?.releases) return [];

  const seen = new Set<string>();
  const results: CatalogAlbum[] = [];

  for (const release of data.releases) {
    const album = toCatalogAlbum(release);
    if (!album) continue;

    const dedupeKey = `${album.title.toLowerCase()}::${album.artist.toLowerCase()}::${album.format}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    results.push(album);
    if (results.length >= limit) break;
  }

  return results;
}

export async function getAlbumById(mbid: string): Promise<CatalogAlbum | null> {
  const release = await musicBrainzFetch<MusicBrainzRelease>(
    `/release/${mbid}`,
    { inc: "artist-credits+media" }
  );

  if (!release) return null;

  return toCatalogAlbum(release);
}
