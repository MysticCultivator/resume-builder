import React from 'react';
import { RESUME_BUILDER_STEPS } from '../../utils/constants';

type Step = (typeof RESUME_BUILDER_STEPS)[number];

interface BuilderStepNavProps {
  current: Step;
  onSelect: (step: Step) => void;
  /** Steps with at least one saved entry — shown with a filled indicator
   *  instead of just a number, so progress through the form is visible. */
  completed?: Partial<Record<Step, boolean>>;
}

export function BuilderStepNav({ current, onSelect, completed = {} }: BuilderStepNavProps) {
  return (
    <nav aria-label="Resume sections" className="border-b border-gray-200 lg:border-b-0 lg:border-r lg:pr-2">
      <ol className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
        {RESUME_BUILDER_STEPS.map((label, i) => {
          const isActive = label === current;
          const isDone = Boolean(completed[label]) && !isActive;
          return (
            <li key={label} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(label)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex w-full items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors lg:whitespace-normal lg:px-3 lg:py-2 ${
                  isActive
                    ? 'bg-primary-50 font-medium text-primary-800'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium ${
                    isActive
                      ? 'border-primary-700 bg-primary-700 text-white'
                      : isDone
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {i + 1}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
