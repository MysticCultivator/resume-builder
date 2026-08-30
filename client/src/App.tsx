import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardPage } from './pages/DashboardPage';
import { TemplateGalleryPage } from './pages/TemplateGalleryPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { ResumePreviewPage } from './pages/ResumePreviewPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminTemplatesPage } from './pages/admin/AdminTemplatesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserViewPage } from './pages/admin/AdminUserViewPage';
import { AdminResumesPage } from './pages/admin/AdminResumesPage';
import { AdminResumeViewPage } from './pages/admin/AdminResumeViewPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminExportPage } from './pages/admin/AdminExportPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated user routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/templates" element={<TemplateGalleryPage />} />
          <Route path="/resumes/:id/builder" element={<ResumeBuilderPage />} />
          <Route path="/resumes/:id/preview" element={<ResumePreviewPage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/:id" element={<AdminUserViewPage />} />
          <Route path="/admin/resumes" element={<AdminResumesPage />} />
          <Route path="/admin/resumes/:id" element={<AdminResumeViewPage />} />
          <Route path="/admin/templates" element={<AdminTemplatesPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/export" element={<AdminExportPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
