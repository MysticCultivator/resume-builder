import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AdminUser, UserRoleFilter, UserSort } from '../../types/admin';
import { useAuth } from '../../contexts/AuthContext';
import { UserTable } from '../../components/admin/UserTable';
import { UserToolbar } from '../../components/admin/UserToolbar';
import { Pagination } from '../../components/admin/Pagination';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';

const LIMIT = 15;

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState<UserRoleFilter>('all');
  const [sort, setSort] = useState<UserSort>('newest');
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Debounce free-text search so every keystroke doesn't fire a request.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Any filter change starts back on page 1 — otherwise a narrower search
  // could leave the user stranded on a page that no longer exists.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, sort]);

  function refresh() {
    setLoading(true);
    setError(null);
    adminService
      .listUsers({ search: debouncedSearch || undefined, role, sort, page, limit: LIMIT })
      .then((result) => {
        setUsers(result.data);
        setTotal(result.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users'))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [debouncedSearch, role, sort, page]);

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await adminService.removeUser(pendingDeleteId);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Registered users</h1>
      <UserToolbar search={search} onSearchChange={setSearch} role={role} onRoleChange={setRole} sort={sort} onSortChange={setSort} />
      {error && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-danger-200 bg-danger-50 px-3 py-2">
          <p className="text-sm text-danger-600">{error}</p>
          <button onClick={refresh} className="text-sm font-medium text-danger-700 hover:underline">
            Try again
          </button>
        </div>
      )}
      {loading ? (
        <LoadingSpinner label="Loading users…" />
      ) : (
        <>
          <UserTable users={users} currentUserId={currentUser?.user_id} onDelete={setPendingDeleteId} />
          <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
        </>
      )}
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete user?"
        message="This permanently deletes the user and all of their resumes. This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
