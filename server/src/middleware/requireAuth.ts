import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AUTH_COOKIE_NAME } from '../utils/cookies';

/**
 * Verifies the JWT for the request and, on success, attaches
 * { user_id, role } to req.user.
 *
 * The JWT is read primarily from the HttpOnly auth cookie set by
 * login/register (see utils/cookies.ts) — this is what the frontend uses.
 * The `Authorization: Bearer <token>` header is still accepted as a
 * fallback so the API remains usable by non-browser clients (tests, curl,
 * mobile apps, Postman) that can't rely on cookie jars.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

  const header = req.headers.authorization;
  const bearerToken = header && header.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
