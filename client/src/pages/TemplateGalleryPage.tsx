import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Template } from '../types/template';
import { templateService } from '../services/templateService';
import { resumeService } from '../services/resumeService';
import { TemplateCard } from '../components/preview/TemplateCard';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { TEMPLATE_DESCRIPTIONS } from '../templates';
import { sampleResumeData } from '../data/sampleResumeData';

export function TemplateGalleryPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    templateService
      .list()
      .then(setTemplates)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load templates'))
      .finally(() => setLoading(false));
  }, []);

  async function handleContinue() {
    setCreateError(null);
    setCreating(true);
    try {
      const { resume } = await resumeService.create({
        title: title.trim() || 'Untitled Resume',
        template_id: selected?.template_id,
      });
      navigate(`/resumes/${resume.resume_id}/builder`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create resume');
      setCreating(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading templates…" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create a new resume</h1>
        <p className="mt-1 text-sm text-gray-500">Give it a title and, optionally, pick a starting template.</p>
      </div>

      <Input
        label="Resume title"
        placeholder="e.g. Software Engineer Resume"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Choose a template (optional)</p>
        {loadError ? (
          <p className="text-sm text-danger-600">Couldn't load templates: {loadError}. You can still start from scratch.</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-gray-500">No templates available — you can still start from scratch.</p>
        ) : (
          <div className="grid grid-cols-2 items-stretch gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {templates.map((t) => (
              <TemplateCard
                key={t.template_id}
                template={t}
                description={TEMPLATE_DESCRIPTIONS[t.template_name]}
                selected={selected?.template_id === t.template_id}
                onSelect={setSelected}
                draft={sampleResumeData}
              />
            ))}
          </div>
        )}
      </div>

      {createError && <p className="text-sm text-danger-600">{createError}</p>}

      <Button className="self-start" onClick={handleContinue} disabled={creating}>
        {creating ? 'Creating…' : selected ? 'Continue with this template' : 'Start from scratch'}
      </Button>
    </div>
  );
}
