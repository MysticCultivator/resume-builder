import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { PlatformStats } from '../../types/admin';
import { StatsCard } from '../../components/admin/StatsCard';
import { MetricGroup } from '../../components/admin/MetricGroup';
import { RecentUsersList } from '../../components/admin/RecentUsersList';
import { RecentActivityList } from '../../components/admin/RecentActivityList';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    setError(null);
    adminService
      .statistics()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load statistics'))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  if (loading) return <LoadingSpinner label="Loading statistics…" />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Platform overview</h1>
        <p className="mt-0.5 text-sm text-gray-500">Monitor users, resumes, and platform activity.</p>
      </div>

      {error ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-danger-200 bg-danger-50 px-3 py-2">
          <p className="text-sm text-danger-600">{error}</p>
          <button onClick={refresh} className="text-sm font-medium text-danger-700 hover:underline">
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Primary KPIs — the four most important numbers, equal weight, one row. */}
          <section aria-labelledby="overview-kpis" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <h2 id="overview-kpis" className="sr-only">
              Key metrics
            </h2>
            <StatsCard label="Total users" value={stats?.total_users ?? 0} />
            <StatsCard label="Total resumes" value={stats?.total_resumes ?? 0} />
            <StatsCard label="Templates" value={stats?.total_templates ?? 0} />
            <StatsCard label="Avg. resumes / user" value={stats?.avg_resumes_per_user ?? 0} />
          </section>

          {/* Period detail — kept, but grouped and visually secondary to the KPIs above. */}
          <section aria-label="Activity by period" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MetricGroup
              title="Users"
              metrics={[
                { label: 'Today', value: stats?.users_today ?? 0 },
                { label: 'Last 7 days', value: stats?.users_last_7_days ?? 0 },
                { label: 'Last 30 days', value: stats?.users_last_30_days ?? 0 },
              ]}
            />
            <MetricGroup
              title="Resumes"
              metrics={[
                { label: 'Today', value: stats?.resumes_today ?? 0 },
                { label: 'Last 7 days', value: stats?.resumes_last_7_days ?? 0 },
                { label: 'Last 30 days', value: stats?.resumes_last_30_days ?? 0 },
              ]}
            />
          </section>

          {/* Platform highlight — secondary to the KPI row above. Full template
              usage breakdown (counts/percentages) lives on the Analytics page. */}
          <section aria-labelledby="platform-usage-heading" className="flex flex-col gap-2">
            <h2 id="platform-usage-heading" className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Platform usage
            </h2>
            <div className="rounded-md border border-gray-200 bg-paper px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-gray-500">Most-used template</span>
                <span className="text-sm font-semibold text-gray-900">{stats?.most_used_template ?? '—'}</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Recently registered users</h2>
                <Link to="/admin/users" className="text-xs font-medium text-primary-700 hover:underline">
                  View all
                </Link>
              </div>
              <RecentUsersList users={stats?.recent_users ?? []} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Recent resume activity</h2>
                <Link to="/admin/resumes" className="text-xs font-medium text-primary-700 hover:underline">
                  View all
                </Link>
              </div>
              <RecentActivityList activity={stats?.recent_activity ?? []} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
