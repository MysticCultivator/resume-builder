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

// netlify.toml redirects both `/api/*` and `/health` to this function
// (see the `[[redirects]]` rules there). Netlify invokes this function with
// `event.path` set to the rewritten path — e.g. a browser request to
// `/api/auth/login` arrives here as `/.netlify/functions/api/auth/login`,
// and a request to `/health` arrives as `/.netlify/functions/api/health` —
// NOT as `/api/auth/login` or `/health`.
//
// The existing Express app mounts most routes under `/api`
// (`server/src/app.ts`: `app.use('/api/auth', authRoutes)`, etc.) but
// exposes `/health` at the top level, outside `/api`. So after stripping
// the Netlify function-invocation prefix, `/health` must be left as-is,
// while everything else gets `/api` restored — otherwise `/health` would
// incorrectly become `/api/health`, which doesn't match any Express route.
const FUNCTION_PATH_PREFIX = '/.netlify/functions/api';
const HEALTH_PATH = '/health';

export const handler = async (event: any, context: any) => {
  const strippedPath = event.path.startsWith(FUNCTION_PATH_PREFIX)
    ? event.path.slice(FUNCTION_PATH_PREFIX.length) || '/'
    : event.path;

  const normalizedPath =
    strippedPath === HEALTH_PATH ? HEALTH_PATH : `/api${strippedPath === '/' ? '' : strippedPath}`;

  return serverlessHandler({ ...event, path: normalizedPath }, context);
};
