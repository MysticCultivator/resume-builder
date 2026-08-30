import React from 'react';
import { RecentResumeActivity } from '../../types/admin';

interface RecentActivityListProps {
  activity: RecentResumeActivity[];
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** Derives "created" vs "updated" from existing timestamps only — there is
 *  no separate activity-log table (Part 4 §3). A resume whose updated_at
 *  is (practically) the same as its created_at hasn't been edited since. */
function activityVerb(entry: RecentResumeActivity): string {
  const created = new Date(entry.created_at).getTime();
  const updated = new Date(entry.updated_at).getTime();
  return Math.abs(updated - created) < 2000 ? 'created' : 'updated';
}

export function RecentActivityList({ activity }: RecentActivityListProps) {
  if (activity.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No resume activity yet.
      </p>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <ul className="divide-y divide-gray-100">
        {activity.map((entry) => (
          <li key={entry.resume_id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-3 py-2 text-sm">
            <p className="text-gray-800">
              <span className="font-medium">{entry.user_full_name}</span> {activityVerb(entry)} “{entry.title}”
            </p>
            <span className="text-xs text-gray-500">{formatWhen(entry.updated_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
