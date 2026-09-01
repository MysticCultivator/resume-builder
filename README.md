# Resume Builder Web Application

A full-stack, ATS-friendly resume builder built as a BSc (Computer Science) final year project at
Royal Education Society's College of Computer Science and Information Technology, Latur
(affiliated to Swami Ramanand Teerth Marathwada University, Nanded).

Guide: Mr. Tanaji Kharbad · HOD: Dr. N.S. Zulpe
Team: Devade Pranav Balkishan (A-30) · Gavhane Srushti Sarjerao (A-38) · Dhotre Karan Kacharu (B-95)

## Project Overview

Resume Builder lets a registered user create, edit, and manage multiple resumes through a guided,
section-by-section editor (personal info, education, experience, projects, skills,
certifications, achievements). Each resume can be styled with one of four selectable templates,
is shown in a live preview as it's edited, and can be exported entirely client-side as a PDF or
via the browser's print dialog — no server-side rendering involved. An admin role can manage the
shared template library, view/remove registered users, and see platform-wide usage statistics.
Data is persisted in PostgreSQL. Authentication uses bcrypt-hashed passwords and a JWT carried in
an **HttpOnly cookie** (never in `localStorage`), and users can log in with **either their
username or their email address**.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, TypeScript, HTML5, CSS3, Tailwind CSS, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| Auth | JWT in an HttpOnly cookie, bcrypt |
| PDF Export | react-pdf |
| Testing | Vitest, Supertest |
| Tooling | Git & GitHub, VS Code |

## Modules

1. User Authentication Module (username + full name + email + password, login with **username or
   email**, JWT carried in an HttpOnly cookie, bcrypt, roles)
2. Resume Information Module (Personal, Education, Experience, Projects, Skills, Certifications, Achievements)
3. Resume Preview Module (live preview, four selectable templates: Classic, Modern, Minimal, Elegant)
4. PDF Generation Module (react-pdf, ATS-friendly text output)
5. Database Management Module
6. Admin Module (overview dashboard, user management, resume management, template library +
   usage, analytics, CSV export)

## Project Structure

```
resume-builder/
├── client/                        React + TypeScript + Tailwind + Vite frontend
├── server/
│   ├── src/                       Express + TypeScript API (routes/controllers/services/repositories)
│   ├── tests/                     Vitest + Supertest test suite (see "Testing" below)
│   ├── db/
│   │   ├── schema.sql             The complete database schema — run once against a fresh database
│   │   ├── migrations/            One-off migrations for databases created before a schema change
│   │   │                          (e.g. 001_add_customization_column.sql)
│   │   └── seed.sql               Optional sample data (the four default templates)
│   ├── .env                       Local dev environment (gitignored; see "Configure environment")
│   └── .env.test                  Test-database environment (gitignored)
├── .env.example
├── .gitignore
├── package.json                   npm workspaces root
└── README.md
```

## 1. Database

This project uses **Supabase PostgreSQL** (a hosted, standard Postgres database — the backend
talks to it with the plain `pg` driver, not the Supabase client SDK; no Supabase Auth/Storage/Edge
Functions are used). Local Postgres also still works for development if you prefer it.

It uses a **single schema file** — there is no migration history to replay. Point it at an empty
database (Supabase's default `postgres` database works fine) and run one file to get a fully
working schema:

```
Create/obtain an empty PostgreSQL database (a new Supabase project's default DB, or a local one)
        ↓
Run server/db/schema.sql
        ↓
Optionally run server/db/seed.sql
        ↓
Start the application
```

`server/db/schema.sql` creates everything the application needs in dependency order: the
`update_updated_at_column()` trigger function, then `users`, `templates`, `resumes` (with its
`updated_at` trigger), `experience`, `education`, `projects`, `skills`, `certifications`,
`achievements`, and every foreign key and index the backend relies on. It's idempotent
(`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, etc.), so re-running it against a
database that already has this schema is harmless.

Two functional unique indexes — `users_email_lower_key` and `users_username_lower_key`, both on
`LOWER(...)` of the respective column — back the case-insensitive username-or-email login (see
"Authentication" below); they're created as part of the `users` table setup, not as a separate
step.

**Supabase:**
```bash
# DATABASE_URL is your Supabase project's connection string (Project Settings →
# Database → Connection string → URI) — the database itself already exists,
# so there's no createdb step.
psql "$DATABASE_URL" -f server/db/schema.sql
psql "$DATABASE_URL" -f server/db/seed.sql    # optional: inserts the 3 default templates
```

**Local Postgres:**
```bash
createdb resume_builder                      # or: psql -c "CREATE DATABASE resume_builder;"
psql "$DATABASE_URL" -f server/db/schema.sql
psql "$DATABASE_URL" -f server/db/seed.sql    # optional: inserts the 3 default templates
```

The Express server itself never creates or modifies schema on startup — it only opens a
connection pool (`server/src/config/db.ts`) — so `schema.sql` (and optionally `seed.sql`) must be
run manually, once, before the backend can serve requests.

### Admin account setup

There is no hardcoded default admin. To grant a registered user admin access, run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

They'll need to log in again afterward so their JWT is reissued with the new role.

## 2. Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm 9+ (workspaces support)

### Install dependencies
```bash
git clone <your-repo-url> resume-builder
cd resume-builder
npm install
```

### Configure environment
```bash
cp .env.example server/.env
cp .env.example client/.env
```
**`server/.env` is the only place the backend reads its config from** — it's loaded by resolving
the path relative to `server/src/config/env.ts` itself (`server/dist/config/env.js` in the
compiled build), not from the current working directory, so it loads the same way whether you
start the server from the repo root, from `server/`, or run the compiled `dist/server.js`
directly.

Edit `server/.env` with:
- Your Supabase (or local) PostgreSQL connection string as `DATABASE_URL`, and `PGSSL=true` if
  it's Supabase. **`DATABASE_URL` is required** — the server throws a clear startup error if it's
  missing rather than silently connecting to a local-Postgres default.
- A strong `JWT_SECRET`. In production this is also **required** — the server refuses to start
  without it rather than falling back to a guessable default (it only falls back to a fixed dev
  value when `NODE_ENV` is not `production`, purely for local convenience).

Edit `client/.env` and keep only the `VITE_API_BASE_URL` line.

Relevant server environment variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. **Required** — no fallback. |
| `PGSSL` | Set to `true` when `DATABASE_URL` points at Supabase or another hosted Postgres that requires TLS. Leave unset/`false` for local Postgres. |
| `JWT_SECRET` | Signs/verifies the auth JWT. **Required in production.** |
| `JWT_EXPIRES_IN` | JWT lifetime (e.g. `1d`), also used as the auth cookie's `maxAge` |
| `NODE_ENV` | `development` \| `production` \| `test`. Controls the cookie's `secure` flag and the `JWT_SECRET` requirement. |
| `CLIENT_URL` | Exact frontend origin, used for the CORS allow-list (credentialed requests can't use `*`) |
| `COOKIE_SAME_SITE` | Optional override for the auth cookie's `SameSite` attribute (defaults to `lax`) |

### Set up the database
See "Database" above — create an empty database, then run `server/db/schema.sql` (and optionally
`server/db/seed.sql`) against it.

### Run in development
```bash
# terminal 1
npm run dev:server

# terminal 2
npm run dev:client
```
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Deploying to Netlify

The whole app deploys as **one Netlify site** — the Vite frontend plus a Netlify
Function that wraps this same Express API (`server/src/app.ts`), talking to the
same PostgreSQL/Supabase database. No separate Express hosting is required in
production. See **[NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)** for full
setup steps and the required environment variables.

## 3. API Endpoints

Base path: `/api`. 🔒 = requires authentication (JWT, sent via HttpOnly cookie). 👑 = requires
authentication + `role = admin`.

**Auth**
- `POST /api/auth/register` — `{ username, full_name, email, password }`. Sets the auth cookie on success; response body contains `{ user }` only (no token).
- `POST /api/auth/login` — `{ identifier, password }`, where `identifier` is **either** the username **or** the email address. Sets the auth cookie on success; response body contains `{ user }` only.
- `POST /api/auth/logout` 🔒 — clears the auth cookie.
- `GET /api/auth/me` 🔒

**Resumes** (all 🔒, all ownership-checked via `resume_id` + `user_id`)
- `GET /api/resumes` · `POST /api/resumes` · `GET /api/resumes/:id` · `PUT /api/resumes/:id` · `DELETE /api/resumes/:id`
- `GET /api/resumes/:id/full` — complete nested resume (all sections + selected template) in one response

**Sub-resources** (all 🔒, ownership verified through the parent resume)
- `POST /api/resumes/:id/{education|experience|projects|skills|certifications|achievements}`
- `PUT /api/{education|experience|projects|skills|certifications|achievements}/:itemId`
- `DELETE /api/{education|experience|projects|skills|certifications|achievements}/:itemId`

**Templates**
- `GET /api/templates` 🔒 · `GET /api/templates/:id` 🔒
- `POST /api/templates` 👑 · `PUT /api/templates/:id` 👑 · `DELETE /api/templates/:id` 👑

**Admin** (all 👑; every list/detail endpoint below never returns a password hash, session, or
secret data)
- `GET /api/admin/users` — search (`search`, matches username/full name/email), filter (`role=all|user|admin`),
  sort (`sort=newest|oldest|name_asc|name_desc`), and pagination (`page`, `limit`, default 15).
  Returns `{ data, total, page, limit }`.
- `GET /api/admin/users/:id` — user detail plus a computed `resume_count`.
- `GET /api/admin/users/:id/resumes` — that user's resumes (title, template, timestamps).
- `DELETE /api/admin/users/:id` — cascades the user's resumes via the existing FK. **Backend-enforced**: an admin
  can never delete their own currently-authenticated account (`400`), independent of any frontend check.
- `GET /api/admin/resumes` — search (title/owner username/owner email), filter (`template_id`, `user_id`),
  sort (`sort=updated_desc|updated_asc|created_desc|created_asc|title_asc`), and pagination. Returns owner +
  template info joined server-side; never the full resume JSON (that's `GET /api/admin/resumes/:id`).
- `GET /api/admin/resumes/:id` — full resume (all sections, resolved template, safe owner fields), unscoped by
  ownership — reuses the exact same section-assembly code as the user-facing `GET /api/resumes/:id/full`.
- `DELETE /api/admin/resumes/:id` — unscoped delete of any resume.
- `GET /api/admin/statistics` — totals plus today/7-day/30-day breakdowns for users and resumes, average
  resumes per user, the most-used template, and recent-activity feeds (latest users, latest resume activity).
- `GET /api/admin/template-usage` — resume count + usage percentage per template, most-used first.
- `GET /api/admin/export/users` · `GET /api/admin/export/resumes` · `GET /api/admin/export/templates` — CSV
  downloads (`Content-Disposition: attachment`); the users/resumes exports accept the same `search`/`role` or
  `search`/`template_id`/`user_id` filters as their list endpoints.

All list/sort query parameters are resolved through a fixed whitelist server-side
(`server/src/validators/admin.validator.ts`) before touching SQL — an unrecognized `sort` value is rejected
with `400` rather than ever being interpolated into a query.

## 4. Authentication

Registration requires a unique `username` **and** a unique `email` (email uniqueness and lookups
are case-insensitive; the username's original casing is preserved for display but its
uniqueness/lookup is also case-insensitive). Passwords are hashed with bcrypt and never stored or
returned in plaintext, and the password hash is never included in any API response.

**Login with username or email.** The login endpoint takes a single `identifier` field instead of
a fixed `email` field. The backend auto-detects which one was supplied — a value containing `@`
is looked up as an email, anything else as a username — and returns the same response shape
either way. If the identifier doesn't match any account, or the password is wrong, the API
returns the exact same generic `401` message (`"Invalid username/email or password."`) in both
cases, so a caller can't use the error to tell whether a given username or email is registered.

**Where the JWT lives.** On successful register/login, the server signs a JWT (`user_id` + `role`)
and sends it back as an **HttpOnly cookie** (`Set-Cookie: token=...`) — never in the JSON response
body, and never in `localStorage`/`sessionStorage`. This means the token is inaccessible to
JavaScript running on the page (including any injected via XSS), which is the main reason for
choosing this approach over a client-stored token. The cookie is:
- `HttpOnly` — invisible to `document.cookie` / JS
- `Secure` in production (requires HTTPS; disabled in local dev over plain HTTP)
- `SameSite=Lax` by default (configurable via `COOKIE_SAME_SITE`)
- scoped with `maxAge` matching `JWT_EXPIRES_IN`

The frontend sends `credentials: 'include'` on every API request so the browser attaches this
cookie automatically; it never reads or manages the token itself. `requireAuth` middleware reads
the JWT from the cookie (falling back to a manual `Authorization: Bearer <token>` header, kept
only so the API remains usable from non-browser clients like tests, curl, or Postman that can't
rely on a cookie jar); `requireAdmin` additionally checks `role = 'admin'`.

**Logout and stateless JWTs.** `POST /api/auth/logout` clears the auth cookie
(`res.clearCookie`), so the browser stops sending it and `requireAuth` has nothing left to
authenticate with — protected routes correctly start returning `401` immediately afterward. JWTs
themselves remain stateless: this does **not** revoke the token server-side (there's no
server-side session store or blocklist), so a copy of the token captured before logout — e.g. by
a browser extension, a proxy, or from a `Bearer` header used in a non-browser client — would
technically still verify until it naturally expires. For a project at this scale that tradeoff is
accepted rather than adding a token-revocation store; it's called out here explicitly rather than
the docs implying the server does something it doesn't.

## 5. Testing

The backend has an automated test suite (Vitest + Supertest) covering the areas that matter most
for correctness and security, run against a real local PostgreSQL test database (not mocked):

- **Authentication** — registration (success, duplicate username, duplicate email
  case-insensitively), login with username, login with email (case-insensitively), incorrect
  password and unknown identifier both returning the same generic error, protected routes
  (rejected when unauthenticated, allowed when authenticated), logout (cookie cleared, protected
  routes stop working afterward).
- **Authorization** — a user can access their own resume; a user gets a `404` (not a
  distinguishing `403`) trying to read/update/delete another user's resume; a normal user is
  rejected from admin-only endpoints; an admin can access them (including updating a template,
  which doubles as a direct regression check against the live schema); admin endpoints reject
  unauthenticated requests too.
- **Admin module** (`tests/admin.test.ts`) — users: search/role-filter/sort/pagination, an
  unrecognized `sort` value is rejected (`400`) rather than reaching SQL, user detail with resume
  count and no password hash, self-delete is blocked on the backend (`400`) while deleting a
  *different* user succeeds, `404` for a nonexistent id. Resumes: cross-user list with
  search/sort/pagination, an admin can view (including sub-sections) and delete any resume without
  owning it, normal users get `403` on every admin resume route. Statistics/analytics/export:
  extended statistics include the today/7d/30d fields, template usage counts and percentages are
  computed correctly, all three CSV exports return the right columns and never leak a password,
  and statistics/template-usage handle an empty database (zeroed numbers, not errors).
- **Resume CRUD** — create/read/update/delete, plus dedicated coverage for the field-clearing
  fix: a partial update leaves omitted fields unchanged, an explicit `null` actually clears a
  field, and the same clearing behavior is verified on a nested section (education) to confirm
  the fix was applied consistently, not just on the top-level resume.
- **Validation** — a representative case at each layer (invalid registration email/username,
  malformed login request, invalid resume data) rather than an exhaustive combinatorial list.

The suite is intentionally kept small and non-redundant — one meaningful assertion path per
behavior, not a test per input string.

### Running the tests
```bash
cd server
npm install
npm test
```
This uses `server/.env.test`, which must set its own `DATABASE_URL` pointed at a **separate**
database whose name contains `test` (e.g. `resume_builder_test`, or a dedicated Supabase test
project/database) — every test truncates all tables before it runs, so this must never point at
your real data. `tests/setup.ts` checks this by reading the database name out of `DATABASE_URL`
itself and refuses to run if it doesn't contain `test`, or if `NODE_ENV` isn't `test`.

Create that database once before the first run, and set `server/.env.test`'s `DATABASE_URL` to it
(plus `PGSSL=true` if it's Supabase):
```bash
createdb resume_builder_test   # or, on Supabase, create a separate project/database
psql "$DATABASE_URL" -f server/db/schema.sql
```

## 6. Using the application

1. **Register** at `/register` (username, full name, email, password) or **log in** at `/login`.
2. You land on the **Dashboard** (`/dashboard`) — lists your resumes, or an empty-state prompt if
   you have none yet.
3. **Create a resume**: click "+ Create resume" → give it a title and optionally pick a starting
   template → you're taken straight into the editor with a real, saved `resume_id` (no fake
   client-side IDs).
4. **Edit a resume** (`/resumes/:id/builder`): a tabbed editor (Personal, Template, Education,
   Experience, Projects, Skills, Certifications, Achievements) on the left, a **live preview** on
   the right that updates immediately as you type or add/edit/remove entries. Personal-info fields
   autosave a moment after you stop typing (and there's always a manual **Save** button); every
   section entry (education, experience, ...) is saved to PostgreSQL the moment you click
   Add/Update/Remove — nothing is held only in browser memory. Empty sections are simply hidden
   from the preview rather than shown as blank headings.
5. **Print / Save as PDF**: click "Print / Save as PDF" (uses the browser's native
   `window.print()` — no paid service) or "Download PDF" (client-side, via `react-pdf`). Print
   output hides all editor chrome (navbar, sidebar, buttons, tabs) and shows only the resume.
6. **Delete a resume** from the Dashboard — a confirmation dialog appears first.
7. The whole app is responsive: the editor's two-column form/preview layout stacks to a single
   column on narrow screens, and the sidebar collapses on mobile.

## 7. Admin functionality

Grant a registered user the `admin` role using the SQL command in "Admin account setup" above,
then have them log in again. Admins get an extra "Admin" link in the navbar leading to a sidebar
with six sections:

- **Overview** (`/admin`) — total users/resumes/templates, each broken down by today / last 7 days
  / last 30 days, average resumes per user, the platform's most-used template, and recent-activity
  feeds (latest registered users, latest resume activity). All numbers are computed live from
  PostgreSQL and degrade gracefully on an empty database (zeros, not errors).
- **Users** (`/admin/users`) — search by username/name/email, filter by role (all/regular/admin),
  sort (newest, oldest, name A–Z/Z–A), server-side pagination, and a **View** page per user
  (`/admin/users/:id`) showing their profile fields, resume count, and a list of their resumes with
  a read-only link into each one. Deleting a user cascades their resumes (existing FK behavior) and
  requires confirmation; an admin can never delete their own account — this is enforced on the
  backend (`400`), not just by disabling the button.
- **Resumes** (`/admin/resumes`) — every resume on the platform with owner, template, and accent
  color, searchable (title/owner username/owner email), filterable by template, sortable
  (recently/oldest updated, newest/oldest created, title A–Z), and paginated. **View**
  (`/admin/resumes/:id`) opens a genuinely read-only viewer that renders the resume through the
  same template components (`ClassicTemplate`, `ModernTemplate`, ...) the resume's owner sees —
  the page never imports the editor/autosave context at all, so there is no code path back into
  edit mode. **Remove** deletes any resume with confirmation.
- **Templates** (`/admin/templates`) — add/remove templates in the shared library (unchanged from
  before), now also showing each template's live usage (`"Modern — 42 resumes — 52.5%"`) next to
  its row.
- **Analytics** (`/admin/analytics`) — the same time-window user/resume breakdowns as Overview,
  plus a lightweight CSS-bar visualization of template usage (no charting library) and the two
  recent-activity feeds, each linking into the relevant user/resume detail page.
- **Export** (`/admin/export`) — three CSV downloads: Users (id, username, name, email, role,
  resume count, created at), Resumes (resume id, title, user id, username, email, template, color,
  created/updated at), and Template usage (template, resume count, usage percentage). None of
  these ever include a password, password hash, or session data.

## 8. Export / Print as PDF

Two independent, non-paid export paths, both available from the resume editor toolbar and the
read-only preview page:
- **"Print / Save as PDF"** — calls the browser's native `window.print()`. Dedicated print CSS
  hides the navbar, sidebar, editor forms, step tabs, and every button, printing only the resume
  itself; from the browser's print dialog choose "Save as PDF" as the destination.
- **"Download PDF"** — generates a PDF directly in the browser using `react-pdf`, no server round
  trip and no external service.

There is no server-side PDF-rendering endpoint — it was deliberately left out (see "Known
limitations" below) since both client-side paths already fully satisfy the export requirement.

## 9. Validation

- **Required fields**: resume title/institution/company/skill name/etc. are enforced client-side
  before submission and re-validated server-side with zod (the backend is always the final
  authority).
- **Email**: `type="email"` on all email inputs (registration, login, personal info) for both
  native browser validation and correct mobile keyboards.
- **Phone**: `type="tel"` on the phone field for correct mobile keyboards; kept as free text
  server-side since phone formats vary internationally, matching the database's `VARCHAR` column.
- **URLs**: project links and certification credential URLs are checked to start with `http://`
  or `https://` before saving.

## 10. Demo Flow

A suggested walkthrough for a live demonstration:

1. **Register** a new account at `/register` (username, full name, email, password).
2. **Login** at `/login` with those credentials (or log in directly if already registered).
3. **Create a resume** from the Dashboard (`+ Create resume`).
4. Enter **personal information** (name, email, phone, location, summary) — autosaves as you type.
5. Add an **education** entry.
6. Add a few **skills**.
7. Add a **project**.
8. Add a work **experience** entry.
9. Add a **certification** and/or an **achievement**.
10. Open the **Template** tab and switch between **Classic**, **Modern**, **Minimal**, and **Elegant**.
11. Watch the **live preview** update instantly on the right as each section changes.
12. Use **Download PDF** (client-side `react-pdf`) or **Print / Save as PDF**
    (`window.print()`) to export the resume.
13. Return to the **Dashboard** to show the saved resume listed (with its template), and
    demonstrate **Delete** with its confirmation prompt.
14. If demonstrating admin features: promote the account to `admin` via the SQL command in
    "Admin account setup," log in again, and walk through `/admin` (Overview), `/admin/users`
    (search/filter/sort/pagination, then open a user's **View** page), `/admin/resumes` (open a
    resume's read-only **View** page), `/admin/templates` (usage now shown per row),
    `/admin/analytics`, and `/admin/export` (download a CSV).

## 11. Known limitations

- Server-side PDF rendering was intentionally not built — client-side `react-pdf` and the browser
  print dialog already cover "export as PDF" without adding a heavier dependency for a college
  project.
- Four resume templates ship out of the box — **Classic**, **Modern**, **Minimal**, and **Elegant** —
  selectable from the template gallery and persisted per resume (`resumes.template_id`). The template
  *system* is fully wired for more: add a new renderer in `client/src/templates/` and
  `client/src/components/pdf/pdfTemplates.tsx`, then insert a row via the admin panel or
  `POST /api/templates` (the admin API restricts template names to ones with a matching renderer —
  see `server/src/utils/builtinTemplates.ts`).
- The resume editor's JS bundle is a single ~500KB (gzipped) chunk; Vite flags this at build time.
  Fine for this project's scale — code-splitting would be the next step if the app grew further.
- Login is stateless-JWT based; logging out clears the browser's cookie but doesn't revoke the
  token server-side (see "Authentication" above for the full explanation).

## 12. Architecture & security notes

This section summarizes the current state of the backend's design decisions, for anyone auditing
or extending the project:

- **Auth** is entirely cookie-based (see "Authentication" above) — the JWT is never exposed to
  frontend JavaScript, and login accepts either a username or an email via a single `identifier`
  field with case-insensitive matching and a uniform error message.
- **Partial updates never silently keep stale data.** Every resume-section repository (resume,
  education, experience, projects, skills, certifications, achievements, templates) builds its
  `UPDATE` query dynamically from only the fields actually present in the request
  (`server/src/utils/dynamicUpdate.ts`), so omitting a field leaves it untouched and explicitly
  sending `null` clears it — these two cases are never conflated.
- **TypeScript is strict throughout.** There is no unnecessary `any`, `as any`, or unchecked
  `unknown` cast anywhere in `client/src` or `server/src`.
- **`JWT_SECRET` fails fast in production** instead of silently falling back to a hardcoded
  default if the environment variable is unset (the fallback exists for local dev convenience
  only, and is never used when `NODE_ENV=production`).
- **Password hashes are never sent to the client** at any endpoint (registration, login, profile,
  or the admin user list), and `.env`/`.env.example`/`.gitignore` contain no real secrets.
- **The database schema is a single file** (`server/db/schema.sql`) rather than a chain of
  historical migrations — see "Database" above.
