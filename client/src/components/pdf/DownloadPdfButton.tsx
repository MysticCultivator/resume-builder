import React, { ReactNode } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { ResumePdfDocument } from './ResumePdfDocument';
import { Button } from '../shared/Button';

// @react-pdf/renderer's TS types don't model the documented render-prop usage
// for `children` (see react-pdf/renderer#2790), so the callback is cast
// through `unknown` at the call site — the runtime behavior is correct.
type DownloadRenderProps = { loading: boolean };

export function DownloadPdfButton() {
  const { draft, template } = useResumeBuilder();
  const filename = `${(draft.resume.title || 'resume').replace(/\s+/g, '_')}.pdf`;

  const renderLink = ({ loading }: DownloadRenderProps): ReactNode => (
    <Button disabled={loading}>{loading ? 'Preparing PDF…' : 'Download PDF'}</Button>
  );

  return (
    <PDFDownloadLink
      document={<ResumePdfDocument draft={draft} templateName={template?.template_name} />}
      fileName={filename}
    >
      {renderLink as unknown as ReactNode}
    </PDFDownloadLink>
  );
}
