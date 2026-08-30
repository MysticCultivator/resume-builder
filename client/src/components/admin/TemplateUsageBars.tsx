import React from 'react';
import { TemplateUsage } from '../../types/admin';

/** Clamps and coerces a percentage value that may arrive as a string,
 *  null/undefined, negative, NaN, or greater than 100 — without touching
 *  the underlying API data. */
function safePercentage(value: unknown): number {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.min(Math.max(num, 0), 100);
}

function formatPercentage(value: number): string {
  // Whole numbers render without a decimal (e.g. "0%"), fractional values
  // keep one decimal place (e.g. "66.7%") — matches the existing convention.
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

/** Renders "Modern — 42 resumes — 52.5%" rows with a proportional CSS bar
 *  behind each — deliberately not pulling in a chart library for this
 *  (Part 11: "Do NOT install a large charting framework just for this.").
 *
 *  Bar width is the template's own percentage of total resumes, clamped to
 *  0-100 - NOT normalized against the largest value in the list. A template
 *  at 66.7% renders a bar at 66.7% width, not 100%. */
export function TemplateUsageBars({ usage }: { usage: TemplateUsage[] }) {
  if (usage.length === 0) {
    return <p className="text-sm text-gray-500">No templates yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {usage.map((row) => {
        const percentage = safePercentage(row.percentage);
        const count = Number.isFinite(row.resume_count) ? row.resume_count : 0;
        const name = row.template_name?.trim() || 'Untitled template';

        return (
          <div key={row.template_id ?? 'none'} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-gray-800">{name}</span>
              <span className="shrink-0 text-gray-500">
                {count} {count === 1 ? 'resume' : 'resumes'} — {formatPercentage(percentage)}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${name} usage`}
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
            >
              {percentage > 0 ? (
                <div className="h-full rounded-full bg-primary-600" style={{ width: `${percentage}%` }} />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
