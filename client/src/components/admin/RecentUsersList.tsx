import React from 'react';
import { RecentUser } from '../../types/admin';

interface RecentUsersListProps {
  users: RecentUser[];
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RecentUsersList({ users }: RecentUsersListProps) {
  if (users.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No users registered yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Role</th>
            <th className="px-3 py-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id} className="border-b border-gray-100 last:border-b-0">
              <td className="px-3 py-2 font-medium text-gray-900">{u.full_name}</td>
              <td className="px-3 py-2 text-gray-600">{u.email}</td>
              <td className="px-3 py-2 text-gray-600 capitalize">{u.role}</td>
              <td className="px-3 py-2 text-gray-500">{formatWhen(u.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
