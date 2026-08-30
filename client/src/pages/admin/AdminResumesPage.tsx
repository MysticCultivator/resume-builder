import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { templateService } from '../../services/templateService';
import { AdminResumeListItem, ResumeSort } from '../../types/admin';
import { Template } from '../../types/template';
import { ResumeTable } from '../../components/admin/ResumeTable';
import { ResumeToolbar } from '../../components/admin/ResumeToolbar';
import { Pagination } from '../../components/admin/Pagination';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';

const LIMIT = 15;

export function AdminResumesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [templateId, setTemplateId] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<ResumeSort>('updated_desc');
  const [page, setPage] = useState(1);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [resumes, setResumes] = useState<AdminResumeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  useEffect(() => {
    templateService.list().then(setTemplates).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, templateId, sort]);

  function refresh() {
    setLoading(true);
    setError(null);
    adminService
      .listResumes({ search: debouncedSearch || undefined, template_id: templateId, sort, page, limit: LIMIT })
      .then((result) => {
        setResumes(result.data);
        setTotal(result.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load resumes'))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [debouncedSearch, templateId, sort, page]);

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    try {
      await adminService.removeResume(pendingDeleteId);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume');
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Platform resumes</h1>
      <ResumeToolbar
        search={search}
        onSearchChange={setSearch}
        templates={templates}
        templateId={templateId}
        onTemplateChange={setTemplateId}
        sort={sort}
        onSortChange={setSort}
      />
      {error && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-danger-200 bg-danger-50 px-3 py-2">
          <p className="text-sm text-danger-600">{error}</p>
          <button onClick={refresh} className="text-sm font-medium text-danger-700 hover:underline">
            Try again
          </button>
        </div>
      )}
      {loading ? (
        <LoadingSpinner label="Loading resumes…" />
      ) : (
        <>
          <ResumeTable resumes={resumes} onDelete={setPendingDeleteId} />
          <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
        </>
      )}
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete resume?"
        message="This permanently deletes the resume for its owner. This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
