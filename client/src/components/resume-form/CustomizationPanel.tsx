import React, { useState } from 'react';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { SaveStatusBadge } from '../shared/SaveStatusBadge';
import {
  resolveCustomization,
  FONT_SIZE_OPTIONS,
  SPACING_OPTIONS,
  ACCENT_COLOR_OPTIONS,
} from '../../utils/resumeCustomization';
import { ResumeFontSize, ResumeSpacing } from '../../types/resume';

/**
 * "Customize Resume" panel (Part 4 §1) — font size, section spacing, and
 * accent color. Intentionally small: three fixed option sets, no free-form
 * styling. Changes apply to the live preview immediately (via context state)
 * and are persisted the same way template selection is (see
 * ResumeBuilderContext.updateCustomization), so they also reach the PDF.
 */
export function CustomizationPanel() {
  const { draft, saveStatus, updateCustomization } = useResumeBuilder();
  const [error, setError] = useState<string | null>(null);
  const current = resolveCustomization(draft.resume.customization);

  async function apply(next: typeof current) {
    setError(null);
    try {
      await updateCustomization(next);
    } catch {
      setError('Could not save your customization. Please try again.');
    }
  }

  function segmentClasses(active: boolean) {
    return `rounded-md border px-3 py-1.5 text-sm transition-colors ${
      active
        ? 'border-primary-700 bg-primary-50 font-medium text-primary-800'
        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
    }`;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">Adjust how your resume looks. Changes apply instantly.</p>
        <SaveStatusBadge status={saveStatus} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-800">Font size</span>
        <div className="flex flex-wrap gap-2">
          {FONT_SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={segmentClasses(current.fontSize === opt.value)}
              onClick={() => void apply({ ...current, fontSize: opt.value as ResumeFontSize })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-800">Section spacing</span>
        <div className="flex flex-wrap gap-2">
          {SPACING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={segmentClasses(current.spacing === opt.value)}
              onClick={() => void apply({ ...current, spacing: opt.value as ResumeSpacing })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-800">Accent color</span>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLOR_OPTIONS.map((opt) => {
            const active = current.accentColor.toLowerCase() === opt.value.toLowerCase();
            return (
              <button
                key={opt.value}
                type="button"
                title={opt.label}
                aria-label={opt.label}
                aria-pressed={active}
                onClick={() => void apply({ ...current, accentColor: opt.value })}
                className={`h-8 w-8 rounded-full border-2 transition-transform ${
                  active ? 'scale-110 border-gray-800' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: opt.value }}
              />
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
}
