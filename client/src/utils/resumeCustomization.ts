import { ResumeCustomization, ResumeFontSize, ResumeSpacing } from '../types/resume';

/** Sensible defaults applied whenever a resume has no stored customization
 *  (e.g. every resume created before this feature existed) — see Part 4 §1
 *  "CUSTOMIZATION BEHAVIOUR". */
export const DEFAULT_CUSTOMIZATION: ResumeCustomization = {
  fontSize: 'medium',
  spacing: 'normal',
  accentColor: '#2d4f32', // matches the app's existing primary-700 accent
};

export const FONT_SIZE_OPTIONS: { value: ResumeFontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export const SPACING_OPTIONS: { value: ResumeSpacing; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'spacious', label: 'Spacious' },
];

/** A small number of professional, print-safe accent colors (Part 4 §1.C) —
 *  deliberately not a full color picker. */
export const ACCENT_COLOR_OPTIONS: { value: string; label: string }[] = [
  { value: '#111827', label: 'Black' },
  { value: '#1e3a8a', label: 'Dark blue' },
  { value: '#4b5563', label: 'Gray' },
  { value: '#166534', label: 'Dark green' },
];

/** Multiplier applied to base font sizes in both the live preview (via CSS
 *  custom property) and the PDF (via direct pt multiplication). */
export const FONT_SIZE_SCALE: Record<ResumeFontSize, number> = {
  small: 0.9,
  medium: 1,
  large: 1.15,
};

/** Multiplier applied to section/element spacing (gaps, margins, padding). */
export const SPACING_SCALE: Record<ResumeSpacing, number> = {
  compact: 0.7,
  normal: 1,
  spacious: 1.35,
};

/** Merges a possibly-partial/missing customization with the defaults so
 *  every consumer (preview, PDF, panel) always has all three fields. */
export function resolveCustomization(customization?: ResumeCustomization | null): ResumeCustomization {
  return { ...DEFAULT_CUSTOMIZATION, ...(customization ?? {}) };
}
