# Resume Builder — Server

Node.js + Express + TypeScript + PostgreSQL REST API. See root `README.md` for full setup and
API documentation.

## Structure
- `src/config` — database connection pool (`pg`)
- `src/middleware` — `requireAuth` (JWT via HttpOnly cookie), `requireAdmin` (role check),
  centralized error handler
- `src/routes` — Express routers, one per resource
- `src/controllers` — request/response handling per route
- `src/services` — business logic: `auth.service.ts` (registration/login/hashing),
  `resume.service.ts` (ownership checks, the `/full` aggregate read)
- `src/repositories` — all raw parameterized SQL, one file per table
- `src/validators` — zod request-body schemas
- `src/utils/cookies.ts` — HttpOnly auth cookie helpers
- `src/utils/dynamicUpdate.ts` — builds `UPDATE ... SET` clauses from only the fields present in
  a request, so partial updates never conflate "not provided" with "explicitly cleared"
- `tests/` — Vitest + Supertest test suite (see root README's "Testing" section)
- `db/schema.sql` — the complete database schema; run this once against a fresh, empty database
- `db/seed.sql` — optional sample data (the three default templates)
