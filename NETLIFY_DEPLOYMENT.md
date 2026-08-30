# Netlify Deployment

This app deploys as **one Netlify site**: the React/Vite frontend is served as
static files, and the existing Express API runs inside a single Netlify
Function (a thin `serverless-http` wrapper around `server/src/app.ts` — no
routes/controllers/services are duplicated). There is **no separate
Express/Node server to host in production**; the existing PostgreSQL/Supabase
database is unchanged and still required.

```
Netlify
 ├── React/Vite frontend (client/dist)
 ├── Netlify Function (netlify/functions/api.ts)
 │     └── existing Express API (server/src/app.ts)
 └── /api/*  ──────────────────────────────►  Netlify Function
                                                     │
                                                     ▼
                                    Existing PostgreSQL / Supabase database
```

## 1. Install dependencies

```bash
npm install
```

(Root `npm install` installs both the `client` and `server` workspaces, via
npm workspaces.)

## 2. Run locally

Two terminals, same as before this migration:

```bash
npm run dev:server   # Express API on http://localhost:5000
npm run dev:client   # Vite dev server on http://localhost:5173
```

The Vite dev server proxies `/api/*` and `/health` to `http://localhost:5000`
(see `client/vite.config.ts`), so the frontend talks to the API via the same
`/api` relative path in dev as it does in production — no Netlify Function
involved locally.

## 3. Build the frontend

```bash
npm run build:client
```

This is the exact command Netlify runs (`netlify.toml`'s `[build].command`).
Output goes to `client/dist`, which is what Netlify publishes.

## 4. Create the Netlify site

Push this repository to GitHub, then in Netlify: **Add new site → Import an
existing project**, and pick the repo. Netlify reads `netlify.toml` for the
build settings automatically.

## 5. Netlify build settings

Already configured in `netlify.toml`:

| Setting | Value |
|---|---|
| Base directory | `.` (repo root) |
| Build command | `npm run build:client` |
| Publish directory | `client/dist` |
| Functions directory | `netlify/functions` |
| Node version | 20 |

## 6. Required environment variables

Set these in **Netlify → Site configuration → Environment variables** (used
by the Netlify Function, i.e. the existing Express app):

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL/Supabase connection string. The app throws a startup error if unset. |
| `PGSSL` | If using Supabase/hosted Postgres | Set to `true` — Supabase requires TLS. |
| `JWT_SECRET` | Yes | Secret used to sign auth JWTs. |
| `JWT_EXPIRES_IN` | No | Defaults to `1d`. |
| `NODE_ENV` | Yes | Set to `production`. Controls the `secure` flag on the auth cookie. |
| `CLIENT_URL` | No | CORS origin. Frontend and API are same-origin on Netlify, so this isn't required there, but harmless to set to your Netlify site URL. |
| `COOKIE_SAME_SITE` | No | Defaults to `lax`. |

The frontend build only ever reads `VITE_API_BASE_URL` (optional — see
`client/.env.example`), which defaults to the same-origin path `/api`. Do
**not** set `DATABASE_URL` or `JWT_SECRET` as `VITE_`-prefixed variables —
they must stay server-side only.

## 7. PostgreSQL / Supabase setup

Netlify does not provide or replace the database. Provision PostgreSQL
(e.g. a Supabase project) as before, run `server/db/schema.sql` against it
once, and point `DATABASE_URL` (env var above) at it. This is unchanged from
the pre-Netlify setup.

## 8. `/api/*` routing

`netlify.toml` redirects `/api/*` to the Netlify Function
(`/.netlify/functions/api/:splat`) **before** the SPA fallback rule. The
function (`netlify/functions/api.ts`) restores the `/api` prefix that
Netlify strips out on the way in, so the existing Express app — which
mounts all routes under `/api` (`server/src/app.ts`) — receives requests at
the exact paths it already expects (e.g. `/api/auth/login`,
`/api/resumes`, `/api/admin/...`). No existing route, controller, service,
or repository was changed.

## 9. Netlify Function architecture

`netlify/functions/api.ts` imports `server/src/app.ts` (the Express app
builder) — never `server/src/server.ts` — and never calls `app.listen()`.
It wraps the app with `serverless-http` so Netlify can invoke it per
request. `server/src/server.ts` is untouched and still used for local dev.

## 10. React Router SPA fallback

The second `[[redirects]]` rule in `netlify.toml` (`/* → /index.html`, after
the `/api/*` rule) means any client-side route — `/dashboard`,
`/resumes/123`, `/admin/analytics`, etc. — resolves to `index.html` on
direct load or refresh, and React Router takes over from there.

## 11. HttpOnly cookie authentication

Unchanged. Login/register still set a JWT in an `httpOnly` cookie
(`server/src/utils/cookies.ts`); the JWT is never exposed to frontend
JavaScript, never stored in `localStorage`/`sessionStorage`. Because the
frontend and API are same-origin in production (`/api/*` on the same
Netlify domain), the existing `sameSite: 'lax'` and `secure: true` (when
`NODE_ENV=production`) cookie settings work as-is — no cookie changes were
needed for this migration.

## 12. `/health` check

`GET /health` still works: proxied locally by Vite, and once deployed,
`netlify.toml` redirects `/health` (in addition to `/api/*`) to the same
Netlify Function, which forwards it unchanged to the existing Express
`/health` route (`server/src/app.ts`) — since that route lives outside the
`/api` prefix, the function leaves the path as `/health` rather than
rewriting it to `/api/health`. Check it at:

```
GET https://YOUR-NETLIFY-SITE.netlify.app/health
```

## 13. No separate Express server in production

There is nothing else to deploy or host. The Netlify Function *is* the
production API. `server/src/server.ts` (`app.listen(...)`) is only ever run
locally.

## 14. PostgreSQL / Supabase still required externally

Netlify hosts the frontend and the API function; it does not host or
replace the database. A running PostgreSQL/Supabase instance, reachable via
`DATABASE_URL`, remains required exactly as before this migration.
