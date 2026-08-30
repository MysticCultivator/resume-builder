import React from 'react';
import { Template } from '../../types/template';
import { ResumeDraft } from '../../contexts/ResumeBuilderContext';
import { ResumeThumbnail, RESUME_PAGE_ASPECT_CLASS } from './ResumeThumbnail';
import { CheckIcon } from '../shared/icons';

interface TemplateCardProps {
  template: Template;
  description?: string;
  selected?: boolean;
  onSelect: (template: Template) => void;
  /** Draft rendered by the actual template. Gallery/selector callers pass
   * the dedicated fictional preview dataset; dashboard callers use real user data. */
  draft?: ResumeDraft;
}

export function TemplateCard({ template, description, selected, onSelect, draft }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template)}
      aria-pressed={Boolean(selected)}
      className={`group relative flex h-full flex-col items-stretch gap-2 rounded-md border bg-paper p-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ${
        selected ? 'border-primary-700' : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      <div
        className={`flex ${RESUME_PAGE_ASPECT_CLASS} w-full items-center justify-center overflow-hidden rounded-sm border ${
          selected ? 'border-primary-200' : 'border-gray-100'
        } bg-gray-50`}
      >
        <ResumeThumbnail templateName={template.template_name} draft={draft} className="h-full w-full" />
      </div>

      <div className="flex flex-1 items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-900">{template.template_name}</span>
          {description && <span className="text-xs leading-snug text-gray-500">{description}</span>}
        </div>
        {selected && (
          <span
            aria-label="Selected"
            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-700 text-white"
          >
            <CheckIcon className="h-2.5 w-2.5" strokeWidth={2.5} />
          </span>
        )}
      </div>
    </button>
  );
}
