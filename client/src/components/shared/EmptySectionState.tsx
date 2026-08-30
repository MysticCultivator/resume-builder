import React from 'react';

interface EmptySectionStateProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

/**
 * Shown in place of a repeatable section's list when it has no entries yet.
 * The button is a real, working "Add" action (focuses the first field of
 * the add form above) — not just decorative text.
 */
export function EmptySectionState({ message, actionLabel, onAction }: EmptySectionStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
      <p className="text-sm text-gray-500">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="text-sm font-medium text-primary-600 hover:underline"
      >
        {actionLabel}
      </button>
    </div>
  );
}
