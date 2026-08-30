-- Optional sample data: default resume templates.
--
-- NOTE: `templates.template_name` has no UNIQUE constraint (see schema.sql),
-- so a plain `ON CONFLICT DO NOTHING` here is a no-op — there's no
-- constraint for it to key off, so re-running this file (e.g. after a
-- redeploy) would insert a second Classic/Modern/Minimal/Elegant row every
-- time. Using WHERE NOT EXISTS instead makes the insert idempotent without
-- adding a schema constraint that could reject any pre-existing duplicate
-- rows already sitting in the database.
INSERT INTO templates (template_name, thumbnail_url)
SELECT v.template_name, v.thumbnail_url
FROM (VALUES
  ('Classic',    '/templates/classic-thumb.png'),
  ('Modern',     '/templates/modern-thumb.png'),
  ('Minimal',    '/templates/minimal-thumb.png'),
  ('Elegant',    '/templates/elegant-thumb.png')
) AS v(template_name, thumbnail_url)
WHERE NOT EXISTS (
  SELECT 1 FROM templates t WHERE t.template_name = v.template_name
);
