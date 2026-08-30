// In production (Netlify) the frontend and API are served from the same
// origin, so the default is a same-origin relative path handled by the
// `/api/*` redirect in netlify.toml. `VITE_API_BASE_URL` remains available
// as an optional override (e.g. for pointing a local build at a different
// API host) — trailing slash stripped so callers can append `path` as-is.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** When true (the default), the request is sent with the HttpOnly auth
   *  cookie attached via `credentials: 'include'`. Set to false only for
   *  endpoints that must work while logged out (e.g. register/login
   *  themselves — there's no cookie to send yet, but including credentials
   *  is harmless either way; kept as an explicit flag so call sites stay
   *  self-documenting about which requests are authenticated). */
  auth?: boolean;
}

/**
 * Thin fetch wrapper shared by every service module.
 *
 * Authentication is handled entirely via an HttpOnly cookie set by the
 * server on login/register — the JWT itself is never readable by, or
 * stored in, frontend JavaScript (no localStorage/sessionStorage token).
 * `credentials: 'include'` tells the browser to send that cookie along
 * with cross-origin requests to the API.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // response had no JSON body
    }

    // A 401 on an authenticated request means the session cookie is
    // missing, invalid, or expired. Let AuthContext know so the app can
    // redirect to /login immediately instead of leaving the user stuck on
    // a broken page with scattered error messages.
    if (response.status === 401 && auth) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
