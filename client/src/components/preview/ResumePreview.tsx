import React from 'react';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { resolveTemplate } from '../../templates';
import { resolveCustomization, FONT_SIZE_SCALE, SPACING_SCALE } from '../../utils/resumeCustomization';

/**
 * Renders a live preview of the resume currently in ResumeBuilderContext.
 * Re-renders on every keystroke since it reads straight from shared draft state
 * (see Part 1 §2.6 Resume Preview Flow). The active template's name (from the
 * user's selection, see TemplateSelector) picks which layout renders it.
 */
export function ResumePreview() {
  const { draft, template } = useResumeBuilder();
  const ActiveTemplate = resolveTemplate(template?.template_name);
  const customization = resolveCustomization(draft.resume.customization);

  return (
    <div className="mx-auto w-full rounded-sm border border-gray-200 bg-white p-5 shadow-paper sm:p-7">
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
        <ActiveTemplate draft={draft} />
      </div>
    </div>
  );
}
