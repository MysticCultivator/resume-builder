// Thin Netlify Function adapter around the existing Express app.
//
// This does NOT duplicate any routes/controllers/services — it just wraps
// `server/src/app.ts` (the existing Express app builder) with
// `serverless-http` so it can run inside a Netlify Function. Local
// development is unaffected: `server/src/server.ts` (which calls
// `app.listen`) is still what runs the app locally, and this file never
// imports `server.ts` or calls `.listen()`.
import serverless from 'serverless-http';
import app from '../../server/src/app';

const serverlessHandler = serverless(app);

// netlify.toml redirects both `/api/*` and `/health` to this function (see
// the `[[redirects]]` rules there). Depending on the Netlify environment,
// `event.path` shows up in one of two forms:
//
//   1. The function-invocation path, e.g. a browser request to
//      `/api/auth/login` arrives as `/.netlify/functions/api/auth/login`
//      (this is what `netlify dev` sends locally).
//   2. The original, unmodified public request path, e.g. `/api/auth/login`
//      or `/health` as-is (this is what Netlify's production redirect proxy
//      actually sends for a `status = 200` rewrite rule like ours).
//
// The previous version of this handler assumed form (1) unconditionally and
// re-added an `/api` prefix whenever the path didn't already start with
// `/.netlify/functions/api`. In production that turned `/api/auth/login`
// (form 2) into `/api/api/auth/login`, which doesn't match
// `app.use('/api/auth', authRoutes)` or `app.use('/api/resumes', ...)` and
// fell through to the catch-all `app.use('/api', resumeItemsRoutes)` mount
// in `server/src/app.ts` — whose router applies `requireAuth` to every
// request it receives. That's why `POST /api/auth/login` was incorrectly
// returning `{"error":"Authentication required"}` instead of reaching
// `authController.login`.
//
// The fix: only strip/rewrite the path when it actually carries the
// function-invocation prefix (form 1). Otherwise the path Netlify handed us
// is already the exact path Express expects (form 2), so it's left as-is —
// no `/api` is ever added a second time.
const FUNCTION_PATH_PREFIX = '/.netlify/functions/api';
const HEALTH_PATH = '/health';

export const handler = async (event: any, context: any) => {
  let path = event.path;

  if (path.startsWith(FUNCTION_PATH_PREFIX)) {
    // Form (1): strip the function-invocation prefix, then restore the
    // public `/api` prefix that Express expects — except for `/health`,
    // which `server/src/app.ts` exposes at the top level, outside `/api`.
    const stripped = path.slice(FUNCTION_PATH_PREFIX.length) || '/';
    path = stripped === HEALTH_PATH ? HEALTH_PATH : `/api${stripped === '/' ? '' : stripped}`;
  }
  // Form (2): already the correct public path (`/api/...` or `/health`) —
  // nothing to do.

  return serverlessHandler({ ...event, path }, context);
};
