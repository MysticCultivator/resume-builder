import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ResumeWithSections } from '../types/resume';
import { resumeService } from '../services/resumeService';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Button } from '../components/shared/Button';
import { resolveTemplate } from '../templates';

export function ResumePreviewPage() {
  const { id } = useParams();
  const [data, setData] = useState<ResumeWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    resumeService
      .getFull(Number(id))
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load resume'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading resume…" />;
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-danger-600">{error}</p>
        <Link to="/dashboard" className="text-sm text-primary-700 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }
  if (!data) return null;

  const ActiveTemplate = resolveTemplate(data.template?.template_name);

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
          Back to dashboard
        </Link>
        <div className="flex gap-2">
          <Link to={`/resumes/${id}/builder`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button onClick={() => window.print()}>Print / Save as PDF</Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl rounded-sm border border-gray-200 bg-white p-6 shadow-paper print:border-none print:shadow-none sm:p-8">
        <ActiveTemplate
          draft={{
            resume: data.resume,
            education: data.education,
            experience: data.experience,
            projects: data.projects,
            skills: data.skills,
            certifications: data.certifications,
            achievements: data.achievements,
          }}
        />
      </div>
    </div>
  );
}
