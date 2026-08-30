import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">404 — Page not found</h1>
      <Link to="/" className="text-primary-600 hover:underline">
        Back to home
      </Link>
    </div>
  );
}
