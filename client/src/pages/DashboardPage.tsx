import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResumeWithSections } from '../types/resume';
import { resumeService } from '../services/resumeService';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { ResumeThumbnail, RESUME_PAGE_ASPECT_CLASS } from '../components/preview/ResumeThumbnail';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { DocumentIcon, PlusIcon } from '../components/shared/icons';

/**
 * One dashboard card, isolated in its own component (rather than an inline
 * `.map()` body) for two reasons:
 *
 * 1. `draft` is memoized on the underlying resume data, not recreated as a
 *    brand-new object every time DashboardPage re-renders for an unrelated
 *    reason (opening the delete dialog, toggling `deleting`, etc). A fresh
 *    object identity fed into ResumeThumbnail re-triggers its content-density
 *    measurement effect for every visible card, which was unnecessary
 *    thrash and, with several resumes on screen at once, was slow enough to
 *    look like "the dashboard is stuck loading" even after data had arrived.
 * 2. The thumbnail is wrapped in its own ErrorBoundary. resumeService.list
 *    + Promise.allSettled already protects the *fetch* step (Part 1) — one
 *    resume's request failing doesn't blank the page. That guarantee did
 *    not extend to the *render* step: a render-time exception thrown while
 *    drawing ONE resume's data (an edge case in that resume's own saved
 *    content hitting an untested branch in a template) is uncaught by
 *    default and unmounts the entire React app, not just this card — which
 *    is the actual mechanism behind "the dashboard sometimes does not
 *    load" for data-dependent reasons that have nothing to do with the
 *    network. Scoping the boundary to just the thumbnail means the rest of
 *    the card (title, Edit/Preview/Delete) — and every other resume on the
 *    page — keeps working even if one thumbnail can't render.
 */
function DashboardResumeCard({
  fullResume,
  onRequestDelete,
}: {
  fullResume: ResumeWithSections;
  onRequestDelete: () => void;
}) {
  const { resume, template, education, experience, projects, skills, certifications, achievements } = fullResume;
  const templateName = template?.template_name ?? resume.template_name;

  const draft = useMemo(
    () => ({ resume, education, experience, projects, skills, certifications, achievements }),
    [resume, education, experience, projects, skills, certifications, achievements]
  );

  return (
    <li className="flex flex-col overflow-hidden rounded-md border border-gray-200 bg-paper">
      <div className="border-b border-gray-100 bg-gray-50 p-3">
        <ErrorBoundary
          onError={(err) => console.error(`Failed to render thumbnail for resume ${resume.resume_id}:`, err)}
          fallback={(retry) => (
            <div
              className={`${RESUME_PAGE_ASPECT_CLASS} flex w-full flex-col items-center justify-center gap-2 border border-gray-200 bg-white px-3 text-center`}
            >
              <p className="text-xs text-gray-500">Couldn't render this preview.</p>
              <button onClick={retry} className="text-xs font-medium text-primary-700 hover:underline">
                Try again
              </button>
            </div>
          )}
        >
          <ResumeThumbnail
            templateName={templateName}
            draft={draft}
            className={`${RESUME_PAGE_ASPECT_CLASS} w-full border border-gray-200`}
          />
        </ErrorBoundary>
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="font-medium text-gray-900">{resume.title}</p>
          <p className="mt-1 text-xs text-gray-500">
            {templateName ? `${templateName} · ` : ''}
            Updated {new Date(resume.updated_at).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3">
          <Link
            to={`/resumes/${resume.resume_id}/builder`}
            className="text-sm font-medium text-primary-700 hover:underline"
            aria-label={`Edit ${resume.title}`}
          >
            Edit
          </Link>
          <Link
            to={`/resumes/${resume.resume_id}/preview`}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
            aria-label={`Preview ${resume.title}`}
          >
            Preview
          </Link>
          <button
            onClick={onRequestDelete}
            className="ml-auto text-sm text-gray-400 hover:text-danger-600"
            aria-label={`Delete ${resume.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeWithSections[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // `mountedRef` guards every setState below: React 18 StrictMode invokes
  // effects (mount → cleanup → mount) twice in development, and on a real
  // navigation-away this component can unmount before an in-flight request
  // resolves. Without the guard, the earlier, stale request's response can
  // land after unmount (or after a newer load already started) and call
  // setState on a component that's gone, which logs a warning at best and,
  // combined with the second effect run, can leave `loading` stuck on
  // `true` forever if the *second* run's state updates are the ones that
  // get clobbered by the *first* run's late-arriving response — i.e. a
  // request race is itself one of the concrete ways "the dashboard
  // sometimes does not load".
  async function loadResumes(mountedRef: { current: boolean }) {
    setLoading(true);
    setError(null);

    try {
      // The list endpoint intentionally stays lightweight and only returns
      // resume metadata. Dashboard thumbnails, however, need the same full
      // document data as the builder/preview so they can accurately represent
      // the user's real resume. Fetch the complete document for each listed
      // resume via the dedicated GET /resumes/:id/full endpoint (same payload
      // shape the builder loads), without changing the existing API contract.
      const summaries = await resumeService.list();

      // Promise.allSettled, not Promise.all: one resume that fails to load
      // its full document (a stale id deleted between the two calls, a
      // transient network hiccup on one of several parallel requests, a
      // single malformed row) must not take down the whole dashboard. Every
      // resume that *did* load successfully is still shown; only the ones
      // that failed are dropped, with a banner noting how many.
      const results = await Promise.allSettled(
        summaries.map((resume) => resumeService.getFull(resume.resume_id))
      );

      if (!mountedRef.current) return;

      const loaded = results
        .filter((r): r is PromiseFulfilledResult<ResumeWithSections> => r.status === 'fulfilled')
        .map((r) => r.value);
      const failedCount = results.length - loaded.length;

      setResumes(loaded);
      setError(
        failedCount > 0
          ? `${failedCount} resume${failedCount === 1 ? '' : 's'} couldn't be loaded and ${
              failedCount === 1 ? "isn't" : "aren't"
            } shown below.`
          : null
      );
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load resumes');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  const mountedRef = React.useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    void loadResumes(mountedRef);
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRetryLoad() {
    void loadResumes(mountedRef);
  }

  async function confirmDelete() {
    if (pendingDeleteId == null) return;
    setDeleting(true);
    try {
      await resumeService.remove(pendingDeleteId);
      setResumes((prev) => prev.filter((r) => r.resume.resume_id !== pendingDeleteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume');
    } finally {
      setDeleting(false);
      setPendingDeleteId(null);
    }
  }

  if (loading) return <LoadingSpinner label="Loading your resumes…" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Resumes</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {user ? `Welcome back, ${user.full_name}.` : ''} Pick up where you left off, or start something new.
          </p>
        </div>
        <Link to="/templates">
          <Button>
            <PlusIcon className="h-4 w-4" />
            Create resume
          </Button>
        </Link>
      </div>

      {error && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-danger-500/30 bg-danger-50 px-3 py-2">
          <p className="text-sm text-danger-600">{error}</p>
          <button onClick={handleRetryLoad} className="text-sm font-medium text-danger-700 hover:underline">
            Try again
          </button>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-gray-300 bg-paper px-6 py-10 text-center">
          <DocumentIcon className="h-8 w-8 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">No resumes yet</p>
            <p className="mt-1 text-sm text-gray-500">Create your first resume to get started.</p>
          </div>
          <Link to="/templates" className="mt-1">
            <Button variant="secondary">
              <PlusIcon className="h-4 w-4" />
              Create your first resume
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 items-stretch gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {resumes.map((fullResume) => {
            return (
              <DashboardResumeCard
                key={fullResume.resume.resume_id}
                fullResume={fullResume}
                onRequestDelete={() => setPendingDeleteId(fullResume.resume.resume_id)}
              />
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete resume?"
        message="Are you sure you want to delete this resume? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
      {deleting && (
        <p role="status" aria-live="polite" className="text-xs text-gray-500">
          Deleting…
        </p>
      )}
    </div>
  );
}
