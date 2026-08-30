import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Navbar } from '../components/shared/Navbar';

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/resumes', label: 'Resumes' },
  { to: '/admin/templates', label: 'Templates' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/export', label: 'Export' },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Mobile-only admin section nav: the sidebar below is `hidden sm:block`,
          so without this row, Overview/Templates/Users would be unreachable
          on small screens — same pattern as the main app's Navbar/Sidebar. */}
      <nav aria-label="Admin sections" className="flex gap-5 overflow-x-auto border-b border-gray-200 bg-paper px-4 text-sm sm:hidden">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `shrink-0 border-b-2 py-2 transition-colors ${
                isActive ? 'border-primary-700 font-medium text-gray-900' : 'border-transparent text-gray-600'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-paper p-4 sm:block">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Admin</p>
          <ul className="flex flex-col gap-0.5">
            {adminLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-800' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-primary-700' : 'bg-transparent'}`}
                      />
                      {link.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
