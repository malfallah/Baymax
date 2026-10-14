import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@baymax/shared';
import { forbidden, unauthorized } from '../lib/errors';
import { verifyToken, type TokenPayload } from '../lib/tokens';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

function readToken(req: Request): TokenPayload | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  try {
    return verifyToken(header.slice(7));
  } catch {
    throw unauthorized('Your session has expired. Please sign in again.');
  }
}

/** Attaches `req.auth` when a valid token is present, without requiring one. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  req.auth = readToken(req);
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = readToken(req);
  if (!auth) throw unauthorized();
  req.auth = auth;
  next();
}

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) throw unauthorized();
    if (!roles.includes(req.auth.role)) throw forbidden();
    next();
  };

/** Returns the authenticated user id; use only after `requireAuth`. */
export function currentUserId(req: Request): string {
  if (!req.auth) throw unauthorized();
  return req.auth.sub;
}
