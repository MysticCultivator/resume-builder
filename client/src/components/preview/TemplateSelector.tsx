import React, { useState } from 'react';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { TemplateCard } from './TemplateCard';
import { SaveStatusBadge } from '../shared/SaveStatusBadge';
import { TEMPLATE_DESCRIPTIONS } from '../../templates';
import { sampleResumeData } from '../../data/sampleResumeData';

export function TemplateSelector() {
  const { templates, template, selectTemplate, saveStatus } = useResumeBuilder();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  if (templates.length === 0) {
    return <p className="text-sm text-gray-500">No templates available yet.</p>;
  }

  async function handleSelect(templateId: number) {
    if (templateId === template?.template_id) return;
    setError(null);
    setPendingId(templateId);
    try {
      await selectTemplate(templateId);
    } catch {
      setError('Could not update the template. Please try again.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          {template ? (
            <>
              Currently using <span className="font-medium text-gray-900">{template.template_name}</span>. Pick another
              to switch — the preview updates right away.
            </>
          ) : (
            'Choose a template for this resume.'
          )}
        </p>
        <SaveStatusBadge status={saveStatus} />
      </div>

      <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3">
        {templates.map((t) => (
          <div
            key={t.template_id}
            className={`h-full${pendingId === t.template_id ? ' opacity-60' : ''}`}
          >
            <TemplateCard
              template={t}
              draft={sampleResumeData}
              description={TEMPLATE_DESCRIPTIONS[t.template_name]}
              selected={template?.template_id === t.template_id}
              onSelect={(selectedTemplate) => handleSelect(selectedTemplate.template_id)}
            />
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-danger-600">{error}</p>}
    </div>
  );
}
