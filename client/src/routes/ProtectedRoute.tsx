import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
