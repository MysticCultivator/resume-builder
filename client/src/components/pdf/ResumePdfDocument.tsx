import React from 'react';
import { Document } from '@react-pdf/renderer';
import { ResumeDraft } from '../../contexts/ResumeBuilderContext';
import { resolveCustomization } from '../../utils/resumeCustomization';
import { resolvePdfTemplate } from './pdfTemplates';

/**
 * Top-level PDF document. Resolves the resume's selected template
 * (`templateName`, sourced from the resume's saved `template_id` via
 * ResumeBuilderContext's `template.template_name` — see
 * DownloadPdfButton.tsx) to the matching @react-pdf/renderer template
 * component in ./pdfTemplates.tsx, the same way ResumePreview.tsx resolves
 * it for the live preview via ../../templates/resolveTemplate(). Falls
 * back to the Classic layout if no template is selected yet.
 *
 * Customization (font size / spacing / accent color, Part 4 §1) is
 * resolved once here and passed to whichever template renders, so it
 * keeps working no matter which of the four designs is active.
 */
export function ResumePdfDocument({
  draft,
  templateName,
}: {
  draft: ResumeDraft;
  templateName?: string | null;
}) {
  const ActiveTemplate = resolvePdfTemplate(templateName);
  const customization = resolveCustomization(draft.resume.customization);

  return (
    <Document>
      <ActiveTemplate draft={draft} customization={customization} />
    </Document>
  );
}
