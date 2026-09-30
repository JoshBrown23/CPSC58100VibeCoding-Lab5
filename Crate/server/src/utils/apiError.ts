/**
 * Base error type for anything a route handler throws on purpose.
 * errorHandler.ts checks for this and uses statusCode directly,
 * rather than every route hardcoding res.status(...) at the throw site.
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request.") {
    super(400, message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found.") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

/** The request conflicts with something that already exists (e.g. a duplicate). */
export class ConflictError extends ApiError {
  constructor(message = "Conflict.") {
    super(409, message);
    this.name = "ConflictError";
  }
}

/** The external catalog (MusicBrainz) failed or returned something unexpected. */
export class UpstreamServiceError extends ApiError {
  constructor(message = "Upstream service error.", statusCode = 502) {
    super(statusCode, message);
    this.name = "UpstreamServiceError";
  }
}

/**
 * Our own outbound throttle is saturated. errorHandler turns
 * retryAfterSeconds into a Retry-After header on the 429 response.
 */
export class TooManyRequestsError extends ApiError {
  retryAfterSeconds: number;

  constructor(message = "Too many requests.", retryAfterSeconds = 1) {
    super(429, message);
    this.name = "TooManyRequestsError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
