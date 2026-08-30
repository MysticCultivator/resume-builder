import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { AdminUser, AdminUserResume } from '../../types/admin';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { Button } from '../../components/shared/Button';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

export function AdminUserViewPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [resumes, setResumes] = useState<AdminUserResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function refresh() {
    setLoading(true);
    setError(null);
    Promise.all([adminService.getUser(userId), adminService.getUserResumes(userId)])
      .then(([userRes, resumesRes]) => {
        setUser(userRes.user);
        setResumes(resumesRes);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load user'))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [userId]);

  const isSelf = currentUser?.user_id === userId;

  async function confirmDelete() {
    try {
      await adminService.removeUser(userId);
      navigate('/admin/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setConfirmingDelete(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading user…" />;

  if (error && !user) {
    return (
      <div className="flex flex-col gap-3">
        <Link to="/admin/users" className="text-sm text-primary-700 hover:underline">
          ← Back to users
        </Link>
        <div className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/admin/users" className="text-sm text-primary-700 hover:underline">
            ← Back to users
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{user.full_name}</h1>
        </div>
        <Button variant="danger" onClick={() => setConfirmingDelete(true)} disabled={isSelf} title={isSelf ? "You can't delete your own account while logged in." : undefined}>
          Delete user
        </Button>
      </div>

      {error && <div className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</div>}

      <dl className="grid grid-cols-1 gap-4 rounded-md border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="User ID" value={user.user_id} />
        <Field label="Username" value={user.username} />
        <Field label="Email" value={user.email} />
        <Field label="Role" value={<span className="capitalize">{user.role}</span>} />
        <Field label="Registered" value={new Date(user.created_at).toLocaleString()} />
        <Field label="Resume count" value={user.resume_count} />
      </dl>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Resumes</h2>
        {resumes.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            This user hasn't created any resumes yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Template</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {resumes.map((r) => (
                  <tr key={r.resume_id} className="border-b border-gray-100">
                    <td className="px-3 py-2">{r.title}</td>
                    <td className="px-3 py-2 text-gray-600">{r.template_name ?? '—'}</td>
                    <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{new Date(r.updated_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-right">
                      <Link to={`/admin/resumes/${r.resume_id}`} className="text-primary-700 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete user?"
        message="This permanently deletes the user and all of their resumes. This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
