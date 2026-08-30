import './env';
import { Pool } from 'pg';

// Fail fast and loud if the connection string isn't configured, instead of
// silently falling back to a local-Postgres default (host=localhost,
// user=postgres, password=postgres). That fallback was the source of the
// "password authentication failed for user postgres" error: DATABASE_URL
// wasn't actually loaded, but the app quietly started against a bogus
// local default anyway instead of surfacing the real problem.
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not configured. Set it in server/.env (see .env.example) — ' +
      'the app requires an explicit PostgreSQL connection string and no longer ' +
      'falls back to a local-Postgres default.'
  );
}

// Supabase (and most hosted Postgres providers) require TLS and present a
// certificate that isn't in Node's default trust store, so `pg` needs
// `ssl: { rejectUnauthorized: false }` or the connection is refused.
// Controlled via PGSSL so local/dev Postgres (which has no TLS listener)
// is unaffected unless explicitly opted in.
const useSsl = process.env.PGSSL === 'true';

// Single shared connection pool for the whole application.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  // pg's own pool-level error messages (e.g. "password authentication
  // failed for user X", "Connection terminated unexpectedly") don't
  // include the connection string or password, so logging the message is
  // safe — but log only the message, not the full error object, in case a
  // future driver version ever attaches connection config to it.
  // eslint-disable-next-line no-console
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

export default pool;
