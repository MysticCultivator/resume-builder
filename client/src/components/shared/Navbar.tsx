import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from './Button';

// Kept in sync with Sidebar's links: the sidebar is hidden below `sm:`, so
// these links move into the navbar's mobile row instead of disappearing.
const MOBILE_NAV_LINKS = [
  { to: '/dashboard', label: 'My Resumes' },
  { to: '/templates', label: 'Templates' },
];

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-primary-700 text-xs font-bold text-white">
            R
          </span>
          <span>Resume Builder</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="font-medium text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="font-medium text-gray-600 hover:text-gray-900">
                  Admin
                </Link>
              )}
              <Button variant="secondary" onClick={() => logout()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-medium text-gray-600 hover:text-gray-900">
                Log in
              </Link>
              <Link to="/register">
                <Button>Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile-only section nav: the Sidebar is `hidden sm:block`, so without
          this row, "My Resumes" and "Templates" would be unreachable on
          small screens. Plain underline tabs, not pills. */}
      {user && (
        <nav aria-label="Sections" className="flex gap-5 overflow-x-auto border-t border-gray-100 px-4 text-sm sm:hidden">
          {MOBILE_NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
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
      )}
    </header>
  );
}
