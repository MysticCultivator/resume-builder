import React from 'react';
import { SaveStatus } from '../../contexts/ResumeBuilderContext';

const LABELS: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Save failed',
};

const CLASSES: Record<SaveStatus, string> = {
  idle: 'text-transparent',
  saving: 'text-gray-500',
  saved: 'text-success-700',
  error: 'text-danger-600',
};

export function SaveStatusBadge({ status }: { status: SaveStatus }) {
  return (
    <span className={`text-xs font-medium ${CLASSES[status]}`} role="status" aria-live="polite">
      {LABELS[status] || '\u00A0'}
    </span>
  );
}
