import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Shows an inline spinner and disables the button, without changing its
   *  label — callers keep control of the loading copy (e.g. "Saving…"). */
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-primary-700 text-white border border-primary-700 hover:bg-primary-800 hover:border-primary-800 active:bg-primary-900',
  secondary:
    'bg-paper text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100',
  danger:
    'bg-paper text-danger-600 border border-danger-500/40 hover:bg-danger-50 hover:border-danger-500 active:bg-danger-50',
  ghost: 'bg-transparent text-gray-700 border border-transparent hover:bg-gray-100 active:bg-gray-200',
};

export function Button({ variant = 'primary', loading = false, disabled, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
        />
      )}
      {children}
    </button>
  );
}
