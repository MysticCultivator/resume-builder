import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';
import { Sidebar } from '../components/shared/Sidebar';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';

function PageErrorFallback(retry: () => void) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm font-medium text-gray-900">This page ran into a problem.</p>
      <p className="max-w-sm text-sm text-gray-500">Nothing else in the app was affected — you can try again.</p>
      <button
        onClick={retry}
        className="rounded-md border border-primary-700 bg-primary-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-800"
      >
        Try again
      </button>
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="no-print">
        <Navbar />
      </div>
      <div className="flex flex-1">
        <div className="no-print">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 sm:p-6">
          {/* Page-level boundary: if the routed page (e.g. the dashboard)
              hits a render error, Navbar/Sidebar stay usable instead of the
              whole app going blank (see components/shared/ErrorBoundary.tsx
              for why this matters — React unmounts the whole tree on an
              uncaught render error by default). */}
          <ErrorBoundary fallback={PageErrorFallback} onError={(err) => console.error('Page render error:', err)}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
