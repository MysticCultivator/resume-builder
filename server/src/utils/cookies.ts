import { Response, CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'token';

/**
 * Parses simple duration strings ("15m", "1h", "1d", "7d") or a bare number
 * of seconds into milliseconds. This mirrors the subset of formats used for
 * JWT_EXPIRES_IN so the auth cookie's maxAge always matches the JWT's own
 * expiry without pulling in an extra dependency just for this.
 */
export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)?$/i.exec(duration.trim());
  const unitMs: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  if (!match) {
    // Unrecognized format — fall back to a sane 1 day default rather than
    // producing a cookie with no expiry (or NaN) at all.
    return unitMs.d;
  }

  const value = Number(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  return value * (unitMs[unit] ?? unitMs.s);
}

function baseCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    // Only require HTTPS in production; localhost dev over http would
    // otherwise silently never receive the cookie.
    secure: isProduction,
    // 'lax' is appropriate here: frontend and backend are same-site
    // (same registrable domain, different ports in dev / same domain in
    // prod), so the cookie is still sent on top-level navigations and on
    // same-site fetch() calls, while still blocking cross-site requests.
    sameSite: (process.env.COOKIE_SAME_SITE as CookieOptions['sameSite']) || 'lax',
    path: '/',
  };
}

export function setAuthCookie(res: Response, token: string): void {
  const maxAge = parseDurationToMs(process.env.JWT_EXPIRES_IN || '1d');
  res.cookie(AUTH_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge,
  });
}

export function clearAuthCookie(res: Response): void {
  // clearCookie must be called with the same attributes (path/sameSite/etc.)
  // used to set the cookie, or the browser won't recognize it as the same
  // cookie and won't remove it.
  res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions());
}
