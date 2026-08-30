import React from 'react';

interface MetricGroupProps {
  /** Group heading, e.g. "Users" or "Resumes". */
  title: string;
  metrics: { label: string; value: number | string }[];
}

/** A single labeled row of small metrics (e.g. Today / Last 7 days / Last 30
 *  days) grouped under one heading — used where six independent StatsCards
 *  would otherwise dominate the page (Overview/Analytics period summaries). */
export function MetricGroup({ title, metrics }: MetricGroupProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-paper px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      <dl className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-0.5">
            <dt className="text-xs text-gray-500">{m.label}</dt>
            <dd className="text-lg font-semibold text-gray-900">{m.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
