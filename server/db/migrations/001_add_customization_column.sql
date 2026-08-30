-- ============================================================================
-- Migration: add resumes.customization (font size / spacing / accent color)
-- ============================================================================
-- Only needed if your Supabase/PostgreSQL database was created BEFORE the
-- `customization` column was added to schema.sql. `CREATE TABLE IF NOT
-- EXISTS resumes (...)` in schema.sql does nothing to a table that already
-- exists, so an existing `resumes` table won't pick up a new column just
-- from re-running schema.sql.
--
-- This migration is safe to run any number of times (IF NOT EXISTS), does
-- not touch existing rows' data, and does not drop/rename/reset anything.
--
-- Run it once against your Supabase database via the SQL Editor, or:
--   psql "$DATABASE_URL" -f server/db/migrations/001_add_customization_column.sql
--
-- If you're setting up a brand-new database, you don't need this file —
-- schema.sql already creates `resumes` with this column included.
-- ============================================================================

ALTER TABLE resumes
  ADD COLUMN IF NOT EXISTS customization JSONB;
