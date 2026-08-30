/**
 * The app has exactly four real React/`@react-pdf` renderers — Classic,
 * Modern, Minimal, Elegant (see client/src/templates/index.ts's
 * TEMPLATE_REGISTRY and client/src/components/pdf/pdfTemplates.tsx's
 * PDF_TEMPLATE_REGISTRY). There is no dynamic template engine, so a
 * `templates` row is only ever actually renderable if its `template_name`
 * exactly matches one of these (see client/src/templates/index.ts's
 * resolveTemplate(), which otherwise falls back to Classic).
 *
 * Kept as a small, manually-synced list rather than shared code with the
 * client (separate build/deploy units) — the smallest safe way to let the
 * server enforce Part 3 §13/§14 (admins can't rename/delete a built-in
 * template out from under its renderer, or create a template name that
 * silently renders as Classic).
 */
export const BUILT_IN_TEMPLATE_NAMES = ['Classic', 'Modern', 'Minimal', 'Elegant'] as const;

export function isBuiltInTemplateName(name: string): boolean {
  return (BUILT_IN_TEMPLATE_NAMES as readonly string[]).includes(name);
}
