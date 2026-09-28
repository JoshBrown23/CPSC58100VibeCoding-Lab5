import type { NextFunction, Request, Response } from "express";
import { ApiError, TooManyRequestsError } from "../utils/apiError";

// Express only treats a 4-arg function as error-handling middleware —
// _req and _next must stay in the signature even though they're unused.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    if (err instanceof TooManyRequestsError) {
      res.set("Retry-After", String(err.retryAfterSeconds));
    }
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
}
