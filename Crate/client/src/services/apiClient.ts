/**
 * apiClient
 * The single place the client makes HTTP requests. Components and hooks
 * never call fetch directly, so base URL, error handling, and (later)
 * auth headers live here and nowhere else.
 *
 * In development, Vite proxies "/api" to the Express server (see
 * vite.config.ts), so the default base URL needs no configuration. For a
 * deployed build, set VITE_API_BASE_URL to the API's full URL.
 */
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api";

/** Any failed request, with the HTTP status (0 = never reached the server). */
export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function buildUrl(path: string, params: Record<string, string>): URL {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

async function performFetch(url: URL, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    // A cancelled request isn't a failure — let the caller see the abort.
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiRequestError(
      0,
      "Couldn't reach the server. Make sure the API is running."
    );
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // The API always replies to errors with { error: "message" }.
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body?.error === "string") {
        message = body.error;
      }
    } catch {
      // Body wasn't JSON — keep the generic message.
    }
    throw new ApiRequestError(response.status, message);
  }

  // A 204 No Content has no body to parse (used by DELETE endpoints).
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(
  path: string,
  params: Record<string, string> = {},
  signal?: AbortSignal
): Promise<T> {
  const url = buildUrl(path, params);
  const response = await performFetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  return parseResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  const url = buildUrl(path, {});
  const response = await performFetch(url, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(response);
}

export async function apiDelete(path: string, signal?: AbortSignal): Promise<void> {
  const url = buildUrl(path, {});
  const response = await performFetch(url, {
    method: "DELETE",
    signal,
    headers: { Accept: "application/json" },
  });
  await parseResponse<void>(response);
}
