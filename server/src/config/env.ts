import path from 'path';
import dotenv from 'dotenv';

// Load server/.env by resolving it relative to this file, not
// `process.cwd()`. `process.cwd()` depends on the directory the process
// was launched from (repo root vs `server/`, `npm run dev:server` vs
// `cd server && npm run dev` vs a plain `node dist/server.js`), so relying
// on it made env loading inconsistent across those cases.
//
// This file lives at `server/src/config/env.ts` in dev (run via `tsx`) and
// at `server/dist/config/env.js` after `tsc` compiles it — both are two
// directories below `server/`, so `../../.env` from here always resolves
// to `server/.env` regardless of which one is running or where the
// process was started from.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// dotenv never overrides variables that are already set in process.env,
// so this is a no-op (and does nothing harmful) when env vars were
// instead injected up front — e.g. `dotenv -e .env.test -- vitest run`
// (see server/package.json's `test` script), which is how the test suite
// points at server/.env.test instead of server/.env.
