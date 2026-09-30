import type { NextFunction, Request, Response } from "express";

export const DEFAULT_USER_ID = 1; // matches GUEST_USER in prisma/seed.ts

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

/**
 * TEMPORARY: there is no authentication yet. Every request is treated as
 * the same seeded "guest" user so the collection endpoints have someone
 * to attach records to.
 *
 * Replace this with real auth middleware once login exists — one that
 * verifies a session/JWT and sets req.userId from it. Nothing in the
 * collection routes/controller/service needs to change when that
 * happens, since they only ever read req.userId and don't know where it
 * came from.
 */
export function attachDefaultUser(req: Request, _res: Response, next: NextFunction) {
  req.userId = DEFAULT_USER_ID;
  next();
}
