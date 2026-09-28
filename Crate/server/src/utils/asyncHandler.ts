import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

/**
 * Express doesn't catch rejected promises from async handlers on its own —
 * an unhandled rejection there just hangs the request. Wrapping a handler
 * in asyncHandler catches the rejection and forwards it to next(), so it
 * reaches errorHandler.ts like any other error.
 */
export function asyncHandler(handler: AsyncRouteHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
