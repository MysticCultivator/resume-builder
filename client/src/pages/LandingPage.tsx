import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/shared/Button';
import { ResumeThumbnail, RESUME_PAGE_ASPECT_CLASS } from '../components/preview/ResumeThumbnail';
import { sampleResumeData } from '../data/sampleResumeData';

/**
 * A small, static approximation of the resume builder's own two-pane
 * editor — form fields on the left, a genuine resume document on the right
 * — used as the hero visual instead of an abstract illustration or
 * gradient shape. The left form side is a quiet CSS stand-in (it isn't the
 * product's actual focus); the right side reuses the real template
 * rendering system with the shared fictional sample data, so what's shown
 * is an actual resume layout, not generic placeholder bars.
 */
function EditorPreviewMockup() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-paper p-3 shadow-paper sm:grid-cols-[0.9fr_1.1fr] sm:gap-4 sm:p-4 md:p-5"
    >
      {/* Left: a compact, non-interactive editor representation. */}
      <div className="flex flex-col rounded-md border border-gray-100 bg-ivory/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Step 4</p>
            <h2 className="mt-1 text-sm font-semibold text-gray-900">Experience</h2>
          </div>
          <span className="text-[10px] font-medium text-primary-700">Saved</span>
        </div>
        <div className="mt-4 grid gap-3">
          <div>
            <p className="mb-1 text-[10px] font-medium text-gray-600">Job title</p>
            <div className="rounded border border-gray-300 bg-white px-2.5 py-2 text-[11px] text-gray-800">Senior Product Designer</div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-medium text-gray-600">Company</p>
            <div className="rounded border border-gray-300 bg-white px-2.5 py-2 text-[11px] text-gray-800">Northwind Analytics</div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-medium text-gray-600">Accomplishments</p>
            <div className="min-h-24 rounded border border-gray-300 bg-white px-2.5 py-2 text-[11px] leading-relaxed text-gray-700">
              Lead design for the reporting product. Cut setup time from 9 minutes to under 3. Built the shared component library.
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
          <span className="text-[10px] text-gray-500">One section at a time</span>
          <span className="rounded border border-primary-700 bg-primary-700 px-2.5 py-1 text-[10px] font-medium text-white">Next section</span>
        </div>
      </div>

      {/* Right: the actual document — real template, fictional sample data,
          never persisted or connected to any real resume. */}
      <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
        <ResumeThumbnail
          templateName="Modern"
          draft={sampleResumeData}
          className={`${RESUME_PAGE_ASPECT_CLASS} w-full`}
        />
      </div>
    </div>
  );
}

function SectionByEditorGraphic() {
  return (
    <div aria-hidden="true" className="grid grid-cols-[112px_1fr] overflow-hidden rounded-md border border-gray-200 bg-paper">
      <div className="border-r border-gray-200 bg-gray-50/70 p-2.5">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Sections</p>
        <div className="mt-1 flex flex-col gap-0.5">
          {['Personal', 'Template', 'Education', 'Experience', 'Projects', 'Skills'].map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-[11px] font-medium ${
                label === 'Experience' ? 'bg-primary-50 text-primary-800' : 'text-gray-600'
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[8px] ${
                  label === 'Experience' ? 'border-primary-700 text-primary-700' : 'border-gray-300 text-gray-400'
                }`}
              >
                {i + 1}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Step 4</p>
            <h3 className="mt-1 text-sm font-semibold text-gray-900">Experience</h3>
          </div>
          <span className="text-[10px] font-medium text-primary-700">Saved</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-[10px] font-medium text-gray-600">Job title</p>
            <div className="rounded border border-gray-300 bg-white px-2.5 py-2 text-[11px] text-gray-800">Senior Product Designer</div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-medium text-gray-600">Company</p>
            <div className="rounded border border-gray-300 bg-white px-2.5 py-2 text-[11px] text-gray-800">Northwind Analytics</div>
          </div>
        </div>
        <div className="mt-3">
          <p className="mb-1 text-[10px] font-medium text-gray-600">Accomplishments</p>
          <div className="min-h-20 rounded border border-gray-300 bg-white px-2.5 py-2 text-[11px] leading-relaxed text-gray-700">
            Lead design for the reporting product. Cut setup time from 9 minutes to under 3. Built the shared component library.
          </div>
        </div>
      </div>
    </div>
  );
}

function LivePreviewGraphic() {
  // A real miniature of the Minimal template with the shared sample data —
  // an actual document, not generic skeleton bars — so this reads as "the
  // preview updates as you type" rather than an abstract placeholder.
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <ResumeThumbnail
        templateName="Minimal"
        draft={sampleResumeData}
        className={`${RESUME_PAGE_ASPECT_CLASS} w-full`}
      />
    </div>
  );
}

function ExportGraphic() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center rounded-md border border-gray-200 bg-paper p-4">
      <div className="flex h-16 w-12 flex-col gap-1 rounded-sm border border-gray-300 bg-white p-1.5 shadow-subtle">
        <div className="h-1 w-3/4 rounded-full bg-gray-300" />
        <div className="h-1 w-full rounded-full bg-gray-200" />
        <div className="h-1 w-5/6 rounded-full bg-gray-200" />
        <div className="mt-auto h-1.5 w-6 rounded-sm bg-primary-700" />
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="bg-ivory">
      {/* Hero */}
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 pb-14 pt-16 text-center sm:pt-20">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-primary-700">Free resume builder</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
          A resume you build one section at a time
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-gray-600">
          Fill in a guided form, pick a clean template, and watch the document take shape as you type. Export a
          polished PDF when it's ready.
        </p>
        <div className="mt-1 flex items-center gap-4">
          <Link to="/register">
            <Button>Get started</Button>
          </Link>
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-20">
        <EditorPreviewMockup />
      </div>

      {/* Feature story — different visual weight per feature, not three
          identical cards. Left column stacks "Build section by section"
          above "Export when it's ready"; the live preview stays alone on
          the right on desktop, tall enough to match the stacked pair. */}
      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-5">
            <div className="rounded-lg border border-gray-200 bg-paper p-6">
              <div>
                <h2 className="font-serif text-2xl font-medium text-gray-900">Build section by section</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Personal details, experience, education, skills — one focused section at a time, with the current
                  step always clear. No blank page to stare at.
                </p>
              </div>
              <SectionByEditorGraphic />
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-paper p-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Export when it's ready</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  Download a clean, recruiter- and parser-friendly PDF, or print directly.
                </p>
              </div>
              <ExportGraphic />
            </div>
          </div>

          <div className="flex h-full flex-col gap-4 rounded-lg border border-gray-200 bg-paper p-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">See the result as you edit</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                The preview updates as you type, in the template you've chosen.
              </p>
            </div>
            <LivePreviewGraphic />
          </div>
        </div>
      </div>
    </div>
  );
}
