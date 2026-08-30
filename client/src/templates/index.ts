import { ComponentType } from 'react';
import { ResumeDraft } from '../contexts/ResumeBuilderContext';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { ElegantTemplate } from './ElegantTemplate';

export type TemplateComponent = ComponentType<{ draft: ResumeDraft }>;

/**
 * Maps a template's `template_name` (as stored in the `templates` table,
 * see server/db/seed.sql) to the React component that renders it.
 * Add new templates here as they're built — every entry consumes the same
 * ResumeDraft shape, no template-specific fields required.
 */
export const TEMPLATE_REGISTRY: Record<string, TemplateComponent> = {
  Classic: ClassicTemplate,
  Modern: ModernTemplate,
  Minimal: MinimalTemplate,
  Elegant: ElegantTemplate,
};

/** Short blurbs shown on template cards (gallery + in-editor selector). An
 *  admin-added template without an entry here just shows no description —
 *  the card still works fine. Kept here, next to the registry, so both
 *  places that list templates (TemplateGalleryPage, TemplateSelector) stay
 *  in sync automatically. */
export const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  Classic: 'A traditional single-column layout with clear section labels.',
  Modern: 'A bold header and strong visual hierarchy for a contemporary look.',
  Minimal: 'ATS-friendly and print-safe, with no decoration to get in the way.',
  Elegant: 'A centered, serif-led layout with refined double-rule section headers.',
};

/** Names with an actual renderer above — the only template_name values the
 *  admin UI should ever be able to create/rename a template to (Part 3 §14). */
export const BUILT_IN_TEMPLATE_NAMES = Object.keys(TEMPLATE_REGISTRY);

const DEFAULT_TEMPLATE: TemplateComponent = ClassicTemplate;

/** Resolves a template_name to its component, falling back to Classic for
 *  an unrecognized or missing name (e.g. no template selected yet). */
export function resolveTemplate(templateName: string | null | undefined): TemplateComponent {
  if (!templateName) return DEFAULT_TEMPLATE;
  return TEMPLATE_REGISTRY[templateName] ?? DEFAULT_TEMPLATE;
}
