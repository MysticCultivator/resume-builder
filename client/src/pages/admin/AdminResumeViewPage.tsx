import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { AdminResumeDetail } from '../../types/admin';
import { resolveTemplate } from '../../templates';
import { resolveCustomization, FONT_SIZE_SCALE, SPACING_SCALE } from '../../utils/resumeCustomization';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

/**
 * Read-only admin resume viewer (Part 8). Deliberately does not import
 * ResumeBuilderContext, autosave, or any editor component — there is no
 * code path here that could write back to the resume, so the admin can't
 * "accidentally" enter edit mode even by mistake.
 *
 * Renders through the exact same template components (`resolveTemplate` +
 * `<ActiveTemplate draft={...} />`) as the user-facing preview, so an admin
 * sees precisely what the resume's owner sees.
 */
export function AdminResumeViewPage() {
  const { id } = useParams<{ id: string }>();
  const resumeId = Number(id);

  const [data, setData] = useState<AdminResumeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminService
      .getResume(resumeId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load resume'))
      .finally(() => setLoading(false));
  }, [resumeId]);

  if (loading) return <LoadingSpinner label="Loading resume…" />;

  if (error || !data) {
    return (
      <div className="flex flex-col gap-3">
        <Link to="/admin/resumes" className="text-sm text-primary-700 hover:underline">
          ← Back to resumes
        </Link>
        <div className="rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-600">
          {error ?? 'Resume not found'}
        </div>
      </div>
    );
  }

  const ActiveTemplate = resolveTemplate(data.template?.template_name);
  const customization = resolveCustomization(data.resume.customization);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/admin/resumes" className="text-sm text-primary-700 hover:underline">
            ← Back to resumes
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{data.resume.title}</h1>
        </div>
        <span className="mt-1 inline-flex h-fit items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600">
          Read-only
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-md border border-gray-200 bg-white p-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Owner</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{data.owner ? data.owner.full_name : 'Unknown'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{data.owner?.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Template</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{data.template?.template_name ?? 'None selected'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Last updated</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{new Date(data.resume.updated_at).toLocaleString()}</dd>
        </div>
      </dl>

      <div className="mx-auto w-full max-w-3xl rounded-sm border border-gray-200 bg-white p-5 shadow-paper sm:p-7">
        <div
          className="resume-content"
          style={
            {
              '--resume-font-scale': FONT_SIZE_SCALE[customization.fontSize],
              '--resume-spacing-scale': SPACING_SCALE[customization.spacing],
              '--resume-accent': customization.accentColor,
            } as React.CSSProperties
          }
        >
          <ActiveTemplate draft={data} />
        </div>
      </div>
    </div>
  );
}
