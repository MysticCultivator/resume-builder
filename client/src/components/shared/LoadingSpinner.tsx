import React from 'react';

interface LoadingSpinnerProps {
  /** Visible + screen-reader-announced description of what's loading. */
  label?: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <div role="status" aria-live="polite" className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      <p className="text-sm text-gray-500">{label ?? 'Loading…'}</p>
    </div>
  );
}
