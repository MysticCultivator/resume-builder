import React, { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Field-level validation message. Rendered directly under this input
   *  (not a shared banner) so the person sees it right next to the field
   *  that needs fixing. Also flips the border red and sets aria-invalid. */
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, id, className = '', error, ...props }, ref) => {
  // Auto-generate a stable id when the caller doesn't pass one, so the
  // <label> is always correctly associated with its <input> for screen
  // readers and "click label to focus input" — not just visually adjacent.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
          error
            ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
