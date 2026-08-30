import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ResumeBuilderProvider, useResumeBuilder } from '../contexts/ResumeBuilderContext';
import { PersonalDetailsForm } from '../components/resume-form/PersonalDetailsForm';
import { EducationSection } from '../components/resume-form/EducationSection';
import { ExperienceSection } from '../components/resume-form/ExperienceSection';
import { ProjectSection } from '../components/resume-form/ProjectSection';
import { SkillSection } from '../components/resume-form/SkillSection';
import { CertificationSection } from '../components/resume-form/CertificationSection';
import { AchievementSection } from '../components/resume-form/AchievementSection';
import { TemplateSelector } from '../components/preview/TemplateSelector';
import { CustomizationPanel } from '../components/resume-form/CustomizationPanel';
import { ResumePreview } from '../components/preview/ResumePreview';
import { DownloadPdfButton } from '../components/pdf/DownloadPdfButton';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { SaveStatusBadge } from '../components/shared/SaveStatusBadge';
import { BuilderStepNav } from '../components/shared/BuilderStepNav';
import { RESUME_BUILDER_STEPS } from '../utils/constants';

function ResumeBuilderContent() {
  const { draft, template, loading, loadError, saveStatus, savePersonalNow, saveAndPrint } = useResumeBuilder();
  const [step, setStep] = React.useState<(typeof RESUME_BUILDER_STEPS)[number]>('Personal');
  const [printing, setPrinting] = React.useState(false);

  async function handlePrint() {
    setPrinting(true);
    try {
      // Flushes any pending personal-field autosave and waits for template/
      // customization saves already in flight before opening the print
      // dialog, so Save/Print always reflects the current editor state
      // instead of whatever was last persisted (see ResumeBuilderContext).
      await saveAndPrint();
    } finally {
      setPrinting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading your resume…" />;
  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-danger-600">{loadError}</p>
        <Link to="/dashboard" className="text-sm text-primary-700 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const completed = {
    Personal: Boolean(draft.resume.full_name || draft.resume.email),
    Template: Boolean(template),
    Customize: Boolean(draft.resume.customization),
    Education: draft.education.length > 0,
    Experience: draft.experience.length > 0,
    Projects: draft.projects.length > 0,
    Skills: draft.skills.length > 0,
    Certifications: draft.certifications.length > 0,
    Achievements: draft.achievements.length > 0,
  };

  return (
    <>
      {/* This wrapper's own negative margin (`-m-4 sm:-m-6`, used to make the
          toolbar span edge-to-edge on screen by offsetting `<main>`'s
          padding) is NOT neutralized by hiding its children — a div's own
          margin still applies even when its content collapses to nothing.
          Previously only the children were `.no-print`, so in print this
          now-empty box's negative margin pulled the `.print-only` sibling
          below it upward, clipping the top of the printed resume off the
          page ("zoomed"/cropped-looking output). Marking the wrapper itself
          `.no-print` removes the whole box — margin included — from the
          print layout. */}
      <div className="no-print flex flex-col gap-4 -m-4 sm:-m-6">
        {/* Toolbar: title, save status, manual save, print/PDF — visible on every step,
            not tucked behind a hidden "review" tab. A quiet document-editor bar
            rather than a floating card. */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-paper px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-2">
            <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-800" aria-label="Back to dashboard">
              ←
            </Link>
            <div>
              <p className="text-sm font-medium text-gray-900">{draft.resume.title || 'Untitled Resume'}</p>
              <SaveStatusBadge status={saveStatus} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => void savePersonalNow()}>
              Save
            </Button>
            <Button variant="secondary" onClick={() => void handlePrint()} disabled={printing}>
              {printing ? 'Preparing…' : 'Print / Save as PDF'}
            </Button>
            <DownloadPdfButton />
          </div>
        </div>

        <div className="no-print grid grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-2 xl:grid-cols-[190px_minmax(360px,0.9fr)_minmax(440px,1.2fr)]">
          <div className="lg:col-span-2 xl:col-span-1">
            <BuilderStepNav current={step} onSelect={setStep} completed={completed} />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            {step === 'Personal' && <PersonalDetailsForm />}
            {step === 'Template' && <TemplateSelector />}
            {step === 'Customize' && <CustomizationPanel />}
            {step === 'Education' && <EducationSection />}
            {step === 'Experience' && <ExperienceSection />}
            {step === 'Projects' && <ProjectSection />}
            {step === 'Skills' && <SkillSection />}
            {step === 'Certifications' && <CertificationSection />}
            {step === 'Achievements' && <AchievementSection />}
          </div>

          <div className="min-w-0 lg:col-span-1 xl:col-span-1 xl:sticky xl:top-16 xl:self-start">
            <ResumePreview />
          </div>
        </div>
      </div>

      {/* Print-only view: just the resume, none of the editor chrome. Kept
          outside the toolbar's negative-margin wrapper so print layout
          (which zeroes out `main`'s padding) isn't thrown off by it. */}
      <div className="print-only">
        <ResumePreview />
      </div>
    </>
  );
}

export function ResumeBuilderPage() {
  const { id } = useParams();
  const resumeId = Number(id);

  if (!id || Number.isNaN(resumeId)) {
    return <p className="text-sm text-danger-600">Invalid resume.</p>;
  }

  return (
    <ResumeBuilderProvider resumeId={resumeId}>
      <ResumeBuilderContent />
    </ResumeBuilderProvider>
  );
}
