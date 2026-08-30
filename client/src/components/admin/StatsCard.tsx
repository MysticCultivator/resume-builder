import React from 'react';

interface StatsCardProps {
  label: string;
  value: number | string;
  /** Small supporting line under the value (e.g. a count or context hint). */
  hint?: string;
  /** `primary` = large KPI card for the main dashboard row (default).
   *  `compact` = smaller card used for secondary/insight metrics. */
  variant?: 'primary' | 'compact';
}

export function StatsCard({ label, value, hint, variant = 'primary' }: StatsCardProps) {
  const isCompact = variant === 'compact';
  return (
    <div
      className={`flex flex-col justify-center rounded-md border border-gray-200 bg-paper ${
        isCompact ? 'gap-0.5 px-3 py-2.5' : 'gap-1 px-4 py-3.5'
      }`}
    >
      <p className={`text-gray-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>{label}</p>
      <p className={`font-semibold text-gray-900 ${isCompact ? 'text-lg' : 'text-2xl'}`}>{value}</p>
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}
