import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Rendered instead of children once an error has been caught. Receives
   *  a `retry` callback that resets the boundary and re-attempts render. */
  fallback: (retry: () => void) => React.ReactNode;
  /** Called with the caught error, e.g. to log it. */
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Without an error boundary, an uncaught error thrown during render
 * ANYWHERE in the component tree unmounts the entire React app (this has
 * been true since React 16) — the user sees a blank screen with no
 * indication why, and no amount of fetch-level error handling
 * (Promise.allSettled, try/catch around API calls, etc.) prevents it,
 * because the failure happens later, during render, not during the fetch.
 *
 * This is the class of bug behind "the dashboard sometimes does not load":
 * every resume's full data fetch can succeed, but if rendering ONE
 * particular resume's data (in ResumeThumbnail / one of the template
 * components) hits an edge case, the whole dashboard — including every
 * other, perfectly fine resume — disappears.
 *
 * Error boundaries must be class components; React does not yet provide a
 * hook equivalent of getDerivedStateFromError/componentDidCatch.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
    this.retry = this.retry.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(errorInfo.componentStack);
    }
  }

  retry() {
    this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return this.props.fallback(this.retry);
    }
    return this.props.children;
  }
}
