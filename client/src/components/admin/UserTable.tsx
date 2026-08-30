import React from 'react';
import { Link } from 'react-router-dom';
import { AdminUser } from '../../types/admin';

interface UserTableProps {
  users: AdminUser[];
  currentUserId?: number;
  onDelete: (userId: number) => void;
}

export function UserTable({ users, currentUserId, onDelete }: UserTableProps) {
  if (users.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        No users match your search.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Username</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Role</th>
            <th className="px-3 py-2">Resumes</th>
            <th className="px-3 py-2">Joined</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.user_id === currentUserId;
            return (
              <tr key={u.user_id} className="border-b border-gray-100">
                <td className="px-3 py-2">{u.full_name}</td>
                <td className="px-3 py-2 text-gray-600">{u.username}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2 capitalize">{u.role}</td>
                <td className="px-3 py-2">{u.resume_count}</td>
                <td className="px-3 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-3">
                    <Link to={`/admin/users/${u.user_id}`} className="text-primary-700 hover:underline">
                      View
                    </Link>
                    <button
                      onClick={() => onDelete(u.user_id)}
                      disabled={isSelf}
                      title={isSelf ? "You can't delete your own account while logged in." : undefined}
                      className="text-danger-500 hover:text-danger-700 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:text-gray-300"
                      aria-label={`Remove ${u.full_name}`}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
