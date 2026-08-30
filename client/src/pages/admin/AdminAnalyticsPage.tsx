import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { PlatformStats, TemplateUsage } from '../../types/admin';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { StatsCard } from '../../components/admin/StatsCard';
import { MetricGroup } from '../../components/admin/MetricGroup';
import { TemplateUsageBars } from '../../components/admin/TemplateUsageBars';

export function AdminAnalyticsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [usage, setUsage] = useState<TemplateUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    setError(null);
    Promise.all([adminService.statistics(), adminService.templateUsage()])
      .then(([s, u]) => {
        setStats(s);
        setUsage(u);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  if (loading) return <LoadingSpinner label="Loading analytics…" />;

  if (error || !stats) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <div className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600">
          {error ?? 'Failed to load analytics'}
        </div>
        <button onClick={refresh} className="w-fit text-sm font-medium text-primary-700 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-0.5 text-sm text-gray-500">Understand platform usage across users, resumes, and templates.</p>
      </div>

      {/* Section 1 — compact period summary (no large duplicate KPIs). */}
      <section aria-labelledby="activity-summary-heading" className="flex flex-col gap-2">
        <h2 id="activity-summary-heading" className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Activity summary
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetricGroup
            title="Users"
            metrics={[
              { label: 'Today', value: stats.users_today },
              { label: 'Last 7 days', value: stats.users_last_7_days },
              { label: 'Last 30 days', value: stats.users_last_30_days },
            ]}
          />
          <MetricGroup
            title="Resumes"
            metrics={[
              { label: 'Today', value: stats.resumes_today },
              { label: 'Last 7 days', value: stats.resumes_last_7_days },
              { label: 'Last 30 days', value: stats.resumes_last_30_days },
            ]}
          />
        </div>
      </section>

      {/* Section 2 — the main visual section of this page. */}
      <section aria-labelledby="template-usage-heading" className="flex flex-col gap-2">
        <h2 id="template-usage-heading" className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Template usage
        </h2>
        <div className="rounded-md border border-gray-200 bg-paper p-4">
          <TemplateUsageBars usage={usage} />
        </div>
      </section>

      {/* Section 3 — insights built only from real, already-available data. */}
      <section aria-labelledby="usage-insights-heading" className="flex flex-col gap-2">
        <h2 id="usage-insights-heading" className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Key usage insights
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatsCard variant="compact" label="Most-used template" value={stats.most_used_template ?? '—'} />
          <StatsCard variant="compact" label="Templates" value={stats.total_templates} />
          <StatsCard variant="compact" label="Avg. resumes / user" value={stats.avg_resumes_per_user} />
        </div>
      </section>
    </div>
  );
}
