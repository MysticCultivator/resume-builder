import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import './index.css';

/**
 * Top-level, last-resort error boundary. Page/section-level boundaries
 * (e.g. around each dashboard resume card) catch and recover from most
 * render errors on their own; this one only fires for something that
 * slips past all of them, so the user gets a plain "something went wrong"
 * screen with a reload option instead of a silent blank page.
 */
function RootErrorFallback(retry: () => void) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ivory px-6 text-center">
      <p className="text-base font-medium text-gray-900">Something went wrong.</p>
      <p className="max-w-sm text-sm text-gray-600">
        This page ran into an unexpected error. Reloading usually fixes it.
      </p>
      <div className="mt-1 flex items-center gap-3">
        <button
          onClick={retry}
          className="rounded-md border border-primary-700 bg-primary-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-800"
        >
          Try again
        </button>
        <button onClick={() => window.location.reload()} className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Reload page
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary fallback={RootErrorFallback} onError={(err) => console.error('Unhandled render error:', err)}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
