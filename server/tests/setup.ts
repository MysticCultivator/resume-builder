import { beforeEach, afterAll } from 'vitest';
import { pool } from '../src/config/db';

// Safety net: refuse to run the test suite against anything that isn't
// obviously a test database, since every test truncates all app tables.
//
// db.ts now connects exclusively via DATABASE_URL (no more discrete PG*
// fallback), so the db name has to come from there too — a PGDATABASE-based
// check would silently stop meaning anything now that PGDATABASE plays no
// part in which database the pool actually connects to. Both Supabase and
// plain postgres:// URLs put the database name in the URL path
// (postgresql://user:pass@host:port/dbname), so this works for both.
function configuredDbName(): string {
  if (!process.env.DATABASE_URL) return '';
  try {
    return new URL(process.env.DATABASE_URL).pathname.replace(/^\//, '');
  } catch {
    return '';
  }
}

const dbName = configuredDbName();
if (process.env.NODE_ENV !== 'test' || !dbName.includes('test')) {
  throw new Error(
    `Refusing to run tests: NODE_ENV=${process.env.NODE_ENV}, DATABASE_URL points at database "${dbName}". ` +
      'Tests truncate all tables and must only run against a database whose name contains "test" ' +
      '(see server/.env.test). Run tests via `npm test`, which loads that file.'
  );
}

// Truncate every app table before each test so tests don't leak state into
// one another. RESTART IDENTITY resets auto-increment ids so assertions on
// ids stay predictable; CASCADE handles the FK chain (resumes -> education,
// experience, projects, skills, certifications, achievements).
beforeEach(async () => {
  await pool.query(`
    TRUNCATE TABLE
      achievements,
      certifications,
      skills,
      projects,
      education,
      experience,
      resumes,
      templates,
      users
    RESTART IDENTITY CASCADE
  `);
});

afterAll(async () => {
  await pool.end();
});
